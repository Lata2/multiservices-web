import { db } from '@/mocks/db';
import { between, uid } from '@/mocks/helpers';
import type { Address, Booking, BookingStatus, CartItem, PaymentMethod } from '@/types/models';
import { formatDay, formatTime } from '@/utils/format';
import { computePricing, effectivePrice, evaluatePromo } from '@/utils/pricing';
import { generateSlots } from '@/utils/slots';
import { ApiError, mock, notFound, requireUser } from '../http';
import { notify, providerUserId } from './notify';

export type BookingTab = 'upcoming' | 'past' | 'cancelled' | 'all';

export interface CheckoutPayload {
  items: CartItem[];
  addressId: string;
  date: string;
  slot: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  notes?: string;
}

const ACTIVE: BookingStatus[] = ['pending', 'confirmed', 'on_the_way', 'in_progress'];

export function bookingMatchesTab(b: Booking, tab: BookingTab) {
  if (tab === 'all') return true;
  if (tab === 'upcoming') return ACTIVE.includes(b.status);
  if (tab === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
  return b.status === 'completed';
}

const sortBookings = (list: Booking[], tab: BookingTab) =>
  list.sort((a, b) => {
    const ka = `${a.scheduledDate} ${a.slot}`;
    const kb = `${b.scheduledDate} ${b.slot}`;
    return tab === 'upcoming' ? ka.localeCompare(kb) : kb.localeCompare(ka);
  });

function walletBalance(userId: string) {
  return db.walletTxns.filter((t) => t.userId === userId).reduce((s, t) => s + (t.type === 'credit' ? t.amount : -t.amount), 0);
}

export const STATUS_FLOW: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['on_the_way', 'cancelled'],
  on_the_way: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
};

const statusCopy: Partial<Record<BookingStatus, string>> = {
  confirmed: 'Your booking has been confirmed by the provider.',
  on_the_way: 'Your professional is on the way.',
  in_progress: 'Service has started.',
  completed: 'Service completed. Please rate your experience!',
  rejected: 'The provider could not accept your booking. Any payment will be refunded.',
  cancelled: 'Your booking was cancelled.',
};

export const bookingsApi = {
  /** Price a cart server-side (authoritative totals, promo validation). */
  quote: (items: CartItem[], promoCode?: string) =>
    mock(() => {
      if (!items.length) throw new ApiError('Your cart is empty.');
      const services = items.map((it) => db.services.find((s) => s.id === it.serviceId) ?? notFound('Service'));
      const providerId = services[0].providerId;
      const provider = db.providers.find((p) => p.id === providerId)!;
      const subtotal = items.reduce((sum, it, i) => sum + effectivePrice(services[i]) * it.quantity, 0);
      let discount = 0;
      let promoMessage: string | undefined;
      let promoValid = false;
      if (promoCode) {
        const promo = db.promoCodes.find((p) => p.code.toUpperCase() === promoCode.toUpperCase());
        const r = evaluatePromo(promo, subtotal, providerId);
        promoMessage = r.message;
        promoValid = r.valid;
        discount = r.discount;
      }
      const pricing = computePricing({ subtotal, discount, visitingCharge: provider.visitingCharge, taxPercent: db.settings.taxPercent });
      return { pricing, providerId, providerName: provider.businessName, promoValid, promoMessage, taxPercent: db.settings.taxPercent };
    }, 250),

  create: (p: CheckoutPayload) =>
    mock<Booking>(() => {
      const me = requireUser();
      if (!p.items.length) throw new ApiError('Your cart is empty.');
      // Accounts created via Google/Apple may not have a phone yet; the professional must be able to call.
      if (!me.phone?.trim()) throw new ApiError('Add your mobile number to your profile so the professional can reach you.', 422, 'PHONE_REQUIRED');
      if (db.settings.maintenanceMode) throw new ApiError('Bookings are paused for scheduled maintenance. Please try again shortly.', 503, 'MAINTENANCE');
      const gw = db.settings.paymentGateways as Record<string, boolean>;
      if ((p.paymentMethod === 'cash' && !db.settings.cashOnService) || (p.paymentMethod !== 'cash' && p.paymentMethod !== 'wallet' && gw[p.paymentMethod] === false))
        throw new ApiError('This payment method is currently unavailable. Please choose another.', 422, 'PAYMENT_METHOD_DISABLED');
      const address: Address = db.addresses.find((a) => a.id === p.addressId && a.userId === me.id) ?? notFound('Address');
      const services = p.items.map((it) => db.services.find((s) => s.id === it.serviceId) ?? notFound('Service'));
      const provider = db.providers.find((pr) => pr.id === services[0].providerId)!;
      if (services.some((s) => s.providerId !== provider.id)) throw new ApiError('All services must be from the same provider.');

      const slot = generateSlots(provider, p.date, db.bookings).find((s) => s.time === p.slot);
      if (!slot?.available) throw new ApiError('That time slot was just taken. Please choose another.', 409, 'SLOT_TAKEN');

      const subtotal = p.items.reduce((sum, it, i) => sum + effectivePrice(services[i]) * it.quantity, 0);
      let discount = 0;
      if (p.promoCode) {
        const promo = db.promoCodes.find((x) => x.code.toUpperCase() === p.promoCode!.toUpperCase());
        const r = evaluatePromo(promo, subtotal, provider.id);
        if (!r.valid) throw new ApiError(r.message);
        discount = r.discount;
        promo!.usageCount += 1;
      }
      const pricing = computePricing({ subtotal, discount, visitingCharge: provider.visitingCharge, taxPercent: db.settings.taxPercent });

      if (p.paymentMethod === 'wallet') {
        if (walletBalance(me.id) < pricing.total) throw new ApiError('Insufficient wallet balance.', 402, 'INSUFFICIENT_FUNDS');
      }
      // Simulated gateway decline for demoing the error path.
      if (p.notes?.toLowerCase().includes('#fail')) throw new ApiError('Payment was declined by your bank. No money was deducted.', 402, 'PAYMENT_DECLINED');

      const now = new Date().toISOString();
      const booking: Booking = {
        id: uid('bk'),
        code: `SRV${between(300000, 999999)}`,
        customerId: me.id,
        customerName: me.name,
        customerPhone: me.phone,
        providerId: provider.id,
        providerName: provider.businessName,
        items: p.items.map((it, i) => ({
          serviceId: services[i].id,
          categoryId: services[i].categoryId,
          title: services[i].title,
          image: services[i].image,
          unitPrice: effectivePrice(services[i]),
          quantity: it.quantity,
          durationMin: services[i].durationMin,
        })),
        address,
        scheduledDate: p.date,
        slot: p.slot,
        status: 'pending',
        payment: {
          method: p.paymentMethod,
          status: p.paymentMethod === 'cash' ? 'pending' : 'paid',
          transactionId: p.paymentMethod === 'cash' ? undefined : `TXN${between(10000000, 99999999)}`,
        },
        pricing,
        promoCode: discount ? p.promoCode?.toUpperCase() : undefined,
        notes: p.notes,
        startOtp: `${between(1000, 9999)}`,
        timeline: [{ status: 'pending', at: now, note: 'Booking placed' }],
        rescheduleCount: 0,
        createdAt: now,
      };

      if (p.paymentMethod === 'wallet') {
        db.walletTxns.unshift({ id: uid('wt'), userId: me.id, type: 'debit', amount: pricing.total, title: `Paid for ${booking.code}`, reference: booking.id, createdAt: now });
      }

      if (services.some((s) => s.requiresPickup)) {
        const task = {
          id: uid('dt'),
          bookingId: booking.id,
          bookingCode: booking.code,
          type: 'pickup' as const,
          status: 'available' as const,
          pickup: { name: me.name, phone: me.phone, address: `${address.line1}, ${address.line2 ?? ''}, ${address.city}` },
          drop: { name: provider.businessName, phone: provider.phone, address: provider.address },
          itemsSummary: booking.items.map((it) => `${it.quantity} × ${it.title}`).join(', '),
          distanceKm: Math.round((provider.distanceKm + 1) * 10) / 10,
          fee: 60,
          codAmount: 0,
          otp: `${between(1000, 9999)}`,
          scheduledFor: now,
          createdAt: now,
          updatedAt: now,
        };
        db.deliveryTasks.unshift(task);
        booking.deliveryTaskId = task.id;
      }

      db.bookings.unshift(booking);
      const puid = providerUserId(provider.id);
      if (puid)
        notify(puid, {
          type: 'booking',
          title: 'New booking request',
          body: `${me.name} booked ${booking.items[0].title} for ${formatDay(p.date)} at ${formatTime(p.slot)}.`,
          href: `/provider/booking/${booking.id}`,
        });
      notify(me.id, {
        type: 'booking',
        title: 'Booking placed',
        body: `${booking.code} is awaiting confirmation from ${provider.businessName}.`,
        href: `/customer/booking/${booking.id}`,
      });
      return booking;
    }, 1200),

  listMine: (tab: BookingTab) =>
    mock<Booking[]>(() => {
      const me = requireUser();
      return sortBookings(db.bookings.filter((b) => b.customerId === me.id && bookingMatchesTab(b, tab)), tab);
    }),

  get: (id: string) => mock<Booking>(() => db.bookings.find((b) => b.id === id) ?? notFound('Booking')),

  cancel: (id: string, reason: string) =>
    mock<Booking>(() => {
      const me = requireUser();
      const b = db.bookings.find((x) => x.id === id) ?? notFound('Booking');
      if (!STATUS_FLOW[b.status].includes('cancelled')) throw new ApiError('This booking can no longer be cancelled.');
      b.status = 'cancelled';
      b.cancelReason = reason;
      b.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: `Cancelled by ${me.role === 'customer' ? 'customer' : 'provider'}: ${reason}` });
      if (b.payment.status === 'paid') {
        b.payment.status = 'refunded';
        if (b.payment.method === 'wallet' || me.role !== 'customer') {
          db.walletTxns.unshift({ id: uid('wt'), userId: b.customerId, type: 'credit', amount: b.pricing.total, title: `Refund for ${b.code}`, reference: b.id, createdAt: new Date().toISOString() });
        }
      }
      const task = db.deliveryTasks.find((t) => t.bookingId === b.id);
      if (task && task.status !== 'delivered') task.status = 'cancelled';
      const otherParty = me.role === 'customer' ? providerUserId(b.providerId) : b.customerId;
      if (otherParty)
        notify(otherParty, {
          type: 'booking',
          title: `Booking ${b.code} cancelled`,
          body: reason,
          href: me.role === 'customer' ? `/provider/booking/${b.id}` : `/customer/booking/${b.id}`,
        });
      return b;
    }),

  reschedule: (id: string, date: string, slot: string) =>
    mock<Booking>(() => {
      const b = db.bookings.find((x) => x.id === id) ?? notFound('Booking');
      if (!['pending', 'confirmed'].includes(b.status)) throw new ApiError('Only upcoming bookings can be rescheduled.');
      if (b.rescheduleCount >= 2) throw new ApiError('A booking can be rescheduled at most twice.');
      const provider = db.providers.find((p) => p.id === b.providerId)!;
      const available = generateSlots(provider, date, db.bookings.filter((x) => x.id !== id)).find((s) => s.time === slot)?.available;
      if (!available) throw new ApiError('That slot is not available.', 409, 'SLOT_TAKEN');
      b.scheduledDate = date;
      b.slot = slot;
      b.rescheduleCount += 1;
      b.timeline.push({ status: 'rescheduled', at: new Date().toISOString(), note: `Moved to ${formatDay(date)}, ${formatTime(slot)}` });
      const puid = providerUserId(b.providerId);
      if (puid) notify(puid, { type: 'booking', title: 'Booking rescheduled', body: `${b.code} moved to ${formatDay(date)} at ${formatTime(slot)}.`, href: `/provider/booking/${b.id}` });
      return b;
    }),

  /** Provider / admin status transitions. `otp` is required to start a job. */
  updateStatus: (id: string, status: BookingStatus, opts: { otp?: string; note?: string } = {}) =>
    mock<Booking>(() => {
      const b = db.bookings.find((x) => x.id === id) ?? notFound('Booking');
      if (!STATUS_FLOW[b.status].includes(status)) throw new ApiError(`Cannot move from ${b.status} to ${status}.`);
      if (status === 'in_progress' && opts.otp !== b.startOtp)
        throw new ApiError('Incorrect start code. Ask the customer for the 4-digit code shown in their app.', 422, 'BAD_OTP');
      b.status = status;
      b.timeline.push({ status, at: new Date().toISOString(), note: opts.note });
      if (status === 'completed') {
        if (b.payment.method === 'cash') b.payment.status = 'paid';
        const provider = db.providers.find((p) => p.id === b.providerId);
        if (provider) provider.jobsCompleted += 1;
      }
      if (status === 'rejected' && b.payment.status === 'paid') b.payment.status = 'refunded';
      if (statusCopy[status])
        notify(b.customerId, { type: 'booking', title: `${b.code}: ${status.replace('_', ' ')}`, body: statusCopy[status]!, href: `/customer/booking/${b.id}` });
      return b;
    }),

  /** Provider: mark cash collected without completing. */
  markPaid: (id: string) =>
    mock<Booking>(() => {
      const b = db.bookings.find((x) => x.id === id) ?? notFound('Booking');
      b.payment.status = 'paid';
      b.timeline.push({ status: 'payment', at: new Date().toISOString(), note: 'Cash collected' });
      return b;
    }),
};

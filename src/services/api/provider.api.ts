import { db } from '@/mocks/db';
import { uid } from '@/mocks/helpers';
import type { Booking, EarningsSummary, Payout, PromoCode, Provider, Service, WeeklyHours } from '@/types/models';
import { toDateKey, todayKey } from '@/utils/format';
import { ApiError, mock, notFound, requireUser } from '../http';
import { adminIds, notify } from './notify';
import { bookingMatchesTab, type BookingTab } from './bookings.api';

function myProvider(): Provider {
  const me = requireUser();
  if (me.role !== 'provider' || !me.profileId) throw new ApiError('Provider account required', 403, 'FORBIDDEN');
  return db.providers.find((p) => p.id === me.profileId) ?? notFound('Provider profile');
}

/** Provider net earning for one booking (subtotal − discount − commission + visiting charge). */
export function providerNet(b: Booking, commissionRate: number) {
  const base = b.pricing.subtotal - b.pricing.discount;
  return Math.round(base - (base * commissionRate) / 100 + b.pricing.visitingCharge);
}

function earnings(providerId: string, commission: number): EarningsSummary {
  const done = db.bookings.filter((b) => b.providerId === providerId && b.status === 'completed');
  const total = done.reduce((s, b) => s + providerNet(b, commission), 0);
  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = done.filter((b) => b.scheduledDate.startsWith(month)).reduce((s, b) => s + providerNet(b, commission), 0);
  const commissionPaid = done.reduce((s, b) => s + Math.round(((b.pricing.subtotal - b.pricing.discount) * commission) / 100), 0);
  const mine = db.payouts.filter((p) => p.payeeId === providerId);
  const withdrawn = mine.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const inFlight = mine.filter((p) => p.status === 'requested' || p.status === 'approved').reduce((s, p) => s + p.amount, 0);
  // Seeded payouts pre-date seeded bookings; keep the balance sensible for the demo.
  const lifetime = Math.max(total, withdrawn + inFlight) + (providerId === 'prov_1' ? 8640 : 0);
  const series = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toDateKey(d);
    const v = done.filter((b) => b.scheduledDate === key).reduce((s, b) => s + providerNet(b, commission), 0);
    return { label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], value: v || (providerId === 'prov_1' ? [1800, 2400, 1200, 3100, 2650, 900, 2100][i] : 0) };
  });
  const week = series.reduce((s, x) => s + x.value, 0);
  return { total: lifetime, thisMonth: Math.max(thisMonth, week), pendingPayout: Math.max(lifetime - withdrawn - inFlight, 0), withdrawn, commissionPaid, series };
}

export interface ProviderDashboard {
  provider: Provider;
  todayCount: number;
  pendingCount: number;
  activeCount: number;
  completedCount: number;
  earnings: EarningsSummary;
  upcoming: Booking[];
  requests: Booking[];
}

export interface ServiceInput {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  discountPrice?: number;
  durationMin: number;
  membersRequired: number;
  includes: string[];
  excludes: string[];
  requiresPickup: boolean;
  active: boolean;
}

export const providerApi = {
  dashboard: () =>
    mock<ProviderDashboard>(() => {
      const p = myProvider();
      const mine = db.bookings.filter((b) => b.providerId === p.id);
      const today = todayKey();
      const upcoming = mine
        .filter((b) => ['confirmed', 'on_the_way', 'in_progress'].includes(b.status))
        .sort((a, b) => `${a.scheduledDate}${a.slot}`.localeCompare(`${b.scheduledDate}${b.slot}`));
      return {
        provider: p,
        todayCount: mine.filter((b) => b.scheduledDate === today && b.status !== 'cancelled').length,
        pendingCount: mine.filter((b) => b.status === 'pending').length,
        activeCount: upcoming.length,
        completedCount: mine.filter((b) => b.status === 'completed').length,
        earnings: earnings(p.id, p.commissionRate),
        upcoming: upcoming.slice(0, 5),
        requests: mine.filter((b) => b.status === 'pending').slice(0, 5),
      };
    }),

  profile: () => mock<Provider>(() => myProvider()),

  updateProfile: (patch: Partial<Pick<Provider, 'businessName' | 'about' | 'address' | 'phone' | 'email' | 'visitingCharge' | 'categoryIds' | 'bank' | 'yearsExperience'>>) =>
    mock<Provider>(() => Object.assign(myProvider(), patch)),

  uploadDocument: (docId: string) =>
    mock<Provider>(() => {
      const p = myProvider();
      const d = p.documents.find((x) => x.id === docId) ?? notFound('Document');
      d.status = 'pending';
      return p;
    }, 1200),

  bookings: (tab: BookingTab | 'requests') =>
    mock<Booking[]>(() => {
      const p = myProvider();
      return db.bookings
        .filter((b) => b.providerId === p.id && (tab === 'requests' ? b.status === 'pending' : bookingMatchesTab(b, tab) && !(tab === 'upcoming' && b.status === 'pending')))
        .sort((a, b) => {
          const ka = `${a.scheduledDate}${a.slot}`;
          const kb = `${b.scheduledDate}${b.slot}`;
          return tab === 'upcoming' || tab === 'requests' ? ka.localeCompare(kb) : kb.localeCompare(ka);
        });
    }),

  services: () => mock<Service[]>(() => db.services.filter((s) => s.providerId === myProvider().id)),

  saveService: (input: ServiceInput, id?: string) =>
    mock<Service>(() => {
      const p = myProvider();
      if (id) {
        const s = db.services.find((x) => x.id === id && x.providerId === p.id) ?? notFound('Service');
        Object.assign(s, input);
        return s;
      }
      const s: Service = {
        ...input,
        id: uid('svc'),
        providerId: p.id,
        image: '',
        gallery: [],
        rating: 0,
        reviewCount: 0,
        tags: ['new'],
        maxQuantity: input.price < 100 ? 30 : 5,
        cancellable: true,
        createdAt: new Date().toISOString(),
      };
      db.services.unshift(s);
      if (!p.categoryIds.includes(input.categoryId)) p.categoryIds.push(input.categoryId);
      return s;
    }, 700),

  toggleService: (id: string) =>
    mock<Service>(() => {
      const s = db.services.find((x) => x.id === id) ?? notFound('Service');
      s.active = !s.active;
      return s;
    }, 200),

  deleteService: (id: string) =>
    mock(() => {
      const p = myProvider();
      const hasActive = db.bookings.some((b) => b.providerId === p.id && ['pending', 'confirmed', 'on_the_way', 'in_progress'].includes(b.status) && b.items.some((i) => i.serviceId === id));
      if (hasActive) throw new ApiError('This service has active bookings. Deactivate it instead.');
      db.services = db.services.filter((s) => s.id !== id);
      return { ok: true };
    }),

  updateAvailability: (input: { hours: WeeklyHours[]; holidays: string[]; slotDurationMin: number; advanceBookingDays: number }) =>
    mock<Provider>(() => {
      const p = myProvider();
      for (const h of input.hours) {
        if (h.open && h.start >= h.end) throw new ApiError('Closing time must be after opening time.');
      }
      Object.assign(p, input);
      return p;
    }),

  promos: () => mock<PromoCode[]>(() => db.promoCodes.filter((x) => x.providerId === myProvider().id)),

  savePromo: (input: Omit<PromoCode, 'id' | 'usageCount' | 'providerId'>, id?: string) =>
    mock<PromoCode>(() => {
      const p = myProvider();
      if (db.promoCodes.some((x) => x.code === input.code && x.id !== id)) throw new ApiError('This code already exists.', 409, 'EXISTS');
      if (id) {
        const promo = db.promoCodes.find((x) => x.id === id) ?? notFound('Promo code');
        Object.assign(promo, input);
        return promo;
      }
      const promo: PromoCode = { ...input, id: uid('pr'), usageCount: 0, providerId: p.id };
      db.promoCodes.unshift(promo);
      return promo;
    }),

  deletePromo: (id: string) =>
    mock(() => {
      db.promoCodes = db.promoCodes.filter((x) => x.id !== id);
      return { ok: true };
    }),

  earnings: () =>
    mock<{ summary: EarningsSummary; payouts: Payout[]; recent: (Booking & { net: number })[]; commissionRate: number }>(() => {
      const p = myProvider();
      const recent = db.bookings
        .filter((b) => b.providerId === p.id && b.status === 'completed')
        .sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))
        .map((b) => ({ ...b, net: providerNet(b, p.commissionRate) }));
      return {
        summary: earnings(p.id, p.commissionRate),
        payouts: db.payouts.filter((x) => x.payeeId === p.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
        recent,
        commissionRate: p.commissionRate,
      };
    }),

  requestPayout: (amount: number) =>
    mock<Payout>(() => {
      const p = myProvider();
      const s = earnings(p.id, p.commissionRate);
      if (amount < db.settings.minPayout) throw new ApiError(`Minimum withdrawal is ₹${db.settings.minPayout}.`);
      if (amount > s.pendingPayout) throw new ApiError('Amount exceeds your available balance.');
      if (!p.bank) throw new ApiError('Add bank details before requesting a payout.');
      const payout: Payout = { id: uid('po'), payeeId: p.id, payeeName: p.businessName, payeeRole: 'provider', amount, status: 'requested', requestedAt: new Date().toISOString() };
      db.payouts.unshift(payout);
      adminIds().forEach((a) => notify(a, { type: 'payment', title: 'New payout request', body: `${p.businessName} requested ₹${amount}.`, href: '/admin/payouts' }));
      return payout;
    }),
};

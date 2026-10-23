import { db } from '@/mocks/db';
import { uid } from '@/mocks/helpers';
import type { DeliveryPartner, DeliveryTask, EarningsSummary, Payout } from '@/types/models';
import { toDateKey } from '@/utils/format';
import { ApiError, mock, notFound, requireUser } from '../http';
import { adminIds, notify, providerUserId } from './notify';

function me(): DeliveryPartner {
  const u = requireUser();
  if (u.role !== 'delivery' || !u.profileId) throw new ApiError('Delivery partner account required', 403);
  return db.deliveryPartners.find((d) => d.id === u.profileId) ?? notFound('Partner profile');
}

function summary(partnerId: string): EarningsSummary {
  const done = db.deliveryTasks.filter((t) => t.partnerId === partnerId && t.status === 'delivered');
  const total = done.reduce((s, t) => s + t.fee, 0) + (partnerId === 'dp_1' ? 9200 : 0);
  const mine = db.payouts.filter((p) => p.payeeId === partnerId);
  const withdrawn = mine.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const inFlight = mine.filter((p) => p.status !== 'paid' && p.status !== 'rejected').reduce((s, p) => s + p.amount, 0);
  const series = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = toDateKey(d);
    const v = done.filter((t) => t.updatedAt.slice(0, 10) === key).reduce((s, t) => s + t.fee, 0);
    return { label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], value: v + (partnerId === 'dp_1' ? [620, 480, 710, 390, 820, 560, 300][i] : 0) };
  });
  const thisMonth = series.reduce((s, x) => s + x.value, 0) * 3;
  return { total, thisMonth, pendingPayout: Math.max(total - withdrawn - inFlight, 0), withdrawn, commissionPaid: 0, series };
}

const ACTIVE: DeliveryTask['status'][] = ['accepted', 'picked_up'];

export const deliveryApi = {
  profile: () => mock<DeliveryPartner>(() => me()),

  setOnline: (online: boolean) =>
    mock<DeliveryPartner>(() => {
      const p = me();
      if (p.status !== 'approved' && online) throw new ApiError('You can go online once your account is verified.');
      p.online = online;
      return p;
    }, 300),

  updateProfile: (patch: Partial<Pick<DeliveryPartner, 'vehicleType' | 'vehicleNumber' | 'licenseNumber' | 'phone'>>) =>
    mock<DeliveryPartner>(() => Object.assign(me(), patch)),

  home: () =>
    mock<{ partner: DeliveryPartner; available: DeliveryTask[]; active: DeliveryTask[]; todayEarnings: number; todayCount: number }>(() => {
      const p = me();
      const today = toDateKey(new Date());
      const doneToday = db.deliveryTasks.filter((t) => t.partnerId === p.id && t.status === 'delivered' && t.updatedAt.slice(0, 10) === today);
      return {
        partner: p,
        available: p.online ? db.deliveryTasks.filter((t) => t.status === 'available') : [],
        active: db.deliveryTasks.filter((t) => t.partnerId === p.id && ACTIVE.includes(t.status)),
        todayEarnings: doneToday.reduce((s, t) => s + t.fee, 0),
        todayCount: doneToday.length,
      };
    }),

  history: () =>
    mock<DeliveryTask[]>(() => {
      const p = me();
      return db.deliveryTasks
        .filter((t) => t.partnerId === p.id && (t.status === 'delivered' || t.status === 'cancelled'))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }),

  task: (id: string) => mock<DeliveryTask>(() => db.deliveryTasks.find((t) => t.id === id) ?? notFound('Task')),

  accept: (id: string) =>
    mock<DeliveryTask>(() => {
      const p = me();
      const t = db.deliveryTasks.find((x) => x.id === id) ?? notFound('Task');
      if (t.status !== 'available') throw new ApiError('This task was already accepted by another partner.', 409);
      if (!p.online) throw new ApiError('Go online to accept tasks.');
      t.status = 'accepted';
      t.partnerId = p.id;
      t.updatedAt = new Date().toISOString();
      const b = db.bookings.find((x) => x.id === t.bookingId);
      if (b) notify(b.customerId, { type: 'task', title: 'Delivery partner assigned', body: `${p.name} will handle your ${t.type}.`, href: `/customer/booking/${b.id}` });
      return t;
    }),

  reject: (id: string) =>
    mock(() => {
      // Just hides it for this partner in a real backend; mock: no-op.
      return { ok: true, id };
    }, 200),

  markPickedUp: (id: string) =>
    mock<DeliveryTask>(() => {
      const t = db.deliveryTasks.find((x) => x.id === id) ?? notFound('Task');
      if (t.status !== 'accepted') throw new ApiError('Task must be accepted first.');
      t.status = 'picked_up';
      t.updatedAt = new Date().toISOString();
      const b = db.bookings.find((x) => x.id === t.bookingId);
      if (b) notify(b.customerId, { type: 'task', title: 'Items picked up', body: `Your items for ${b.code} are on the way.`, href: `/customer/booking/${b.id}` });
      return t;
    }),

  markDelivered: (id: string, otp: string) =>
    mock<DeliveryTask>(() => {
      const p = me();
      const t = db.deliveryTasks.find((x) => x.id === id) ?? notFound('Task');
      if (t.status !== 'picked_up') throw new ApiError('Pick up the items first.');
      if (otp !== t.otp) throw new ApiError('Incorrect delivery code.', 422, 'BAD_OTP');
      t.status = 'delivered';
      t.updatedAt = new Date().toISOString();
      p.completedTasks += 1;
      const b = db.bookings.find((x) => x.id === t.bookingId);
      const puid = b && providerUserId(b.providerId);
      if (puid) notify(puid, { type: 'task', title: 'Items delivered', body: `${t.itemsSummary} delivered for ${t.bookingCode}.`, href: `/provider/booking/${b!.id}` });
      return t;
    }),

  earnings: () =>
    mock<{ summary: EarningsSummary; payouts: Payout[] }>(() => {
      const p = me();
      return { summary: summary(p.id), payouts: db.payouts.filter((x) => x.payeeId === p.id).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)) };
    }),

  requestPayout: (amount: number) =>
    mock<Payout>(() => {
      const p = me();
      const s = summary(p.id);
      if (amount < db.settings.minPayout) throw new ApiError(`Minimum withdrawal is ₹${db.settings.minPayout}.`);
      if (amount > s.pendingPayout) throw new ApiError('Amount exceeds your available balance.');
      const po: Payout = { id: uid('po'), payeeId: p.id, payeeName: p.name, payeeRole: 'delivery', amount, status: 'requested', requestedAt: new Date().toISOString() };
      db.payouts.unshift(po);
      adminIds().forEach((a) => notify(a, { type: 'payment', title: 'New payout request', body: `${p.name} requested ₹${amount}.`, href: '/admin/payouts' }));
      return po;
    }),

  /** Exposed for the customer app — shows the code the customer gives the partner. */
  taskForBooking: (bookingId: string) =>
    mock<(DeliveryTask & { partner?: DeliveryPartner }) | null>(() => {
      const t = db.deliveryTasks.find((x) => x.bookingId === bookingId);
      if (!t) return null;
      return { ...t, partner: db.deliveryPartners.find((d) => d.id === t.partnerId) };
    }, 200),
};

import { db } from '@/mocks/db';
import { uid } from '@/mocks/helpers';
import type {
  Banner,
  Booking,
  BookingStatus,
  Category,
  City,
  DeliveryPartner,
  Payout,
  PlatformSettings,
  PromoCode,
  Provider,
  ProviderStatus,
  Role,
  User,
} from '@/types/models';
import { toDateKey } from '@/utils/format';
import { ApiError, mock, notFound, requireUser } from '../http';
import { notify } from './notify';

function assertAdmin() {
  if (requireUser().role !== 'admin') throw new ApiError('Admin access required', 403, 'FORBIDDEN');
}

const commissionOf = (b: Booking) => {
  const p = db.providers.find((x) => x.id === b.providerId);
  return Math.round(((b.pricing.subtotal - b.pricing.discount) * (p?.commissionRate ?? 15)) / 100);
};

export interface AdminDashboard {
  gmv: number;
  revenue: number;
  bookingsTotal: number;
  bookingsToday: number;
  customers: number;
  activeProviders: number;
  pendingProviders: number;
  pendingPartners: number;
  pendingPayouts: number;
  openTickets: number;
  statusBreakdown: { status: BookingStatus; count: number }[];
  revenueSeries: { label: string; value: number }[];
  topCategories: { name: string; count: number }[];
  topProviders: { id: string; name: string; bookings: number; rating: number }[];
  recentBookings: Booking[];
}

export interface BookingQuery {
  status?: BookingStatus | 'all';
  query?: string;
}

export const adminApi = {
  dashboard: () =>
    mock<AdminDashboard>(() => {
      assertAdmin();
      const completed = db.bookings.filter((b) => b.status === 'completed');
      const today = toDateKey(new Date());
      const statuses: BookingStatus[] = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'];
      const catCount = new Map<string, number>();
      db.bookings.forEach((b) => {
        const s = db.services.find((x) => x.id === b.items[0].serviceId);
        if (s) catCount.set(s.categoryId, (catCount.get(s.categoryId) ?? 0) + 1);
      });
      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      return {
        gmv: completed.reduce((s, b) => s + b.pricing.total, 0) + 1_284_500,
        revenue: completed.reduce((s, b) => s + commissionOf(b), 0) + 192_675,
        bookingsTotal: db.bookings.length + 3_412,
        bookingsToday: db.bookings.filter((b) => b.scheduledDate === today).length,
        customers: db.users.filter((u) => u.role === 'customer').length + 8_920,
        activeProviders: db.providers.filter((p) => p.status === 'approved').length,
        pendingProviders: db.providers.filter((p) => p.status === 'pending').length,
        pendingPartners: db.deliveryPartners.filter((p) => p.status === 'pending').length,
        pendingPayouts: db.payouts.filter((p) => p.status === 'requested').length,
        openTickets: db.tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
        statusBreakdown: statuses.map((status) => ({ status, count: db.bookings.filter((b) => b.status === status).length })),
        revenueSeries: months.map((label, i) => ({ label, value: [21400, 26800, 24100, 31900, 35200, 38700][i] })),
        topCategories: [...catCount.entries()]
          .map(([id, count]) => ({ name: db.categories.find((c) => c.id === id)?.name ?? id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topProviders: db.providers
          .filter((p) => p.status === 'approved')
          .map((p) => ({ id: p.id, name: p.businessName, bookings: db.bookings.filter((b) => b.providerId === p.id).length, rating: p.rating }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5),
        recentBookings: [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
      };
    }),

  /* Users */
  users: (role: Role | 'all' = 'all', query = '') =>
    mock<User[]>(() => {
      assertAdmin();
      const q = query.trim().toLowerCase();
      return db.users
        .filter((u) => (role === 'all' || u.role === role) && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),
  user: (id: string) =>
    mock<{ user: User; bookings: Booking[] }>(() => {
      assertAdmin();
      const user = db.users.find((u) => u.id === id) ?? notFound('User');
      return { user, bookings: db.bookings.filter((b) => b.customerId === id) };
    }),
  setUserStatus: (id: string, status: User['status']) =>
    mock<User>(() => {
      assertAdmin();
      const u = db.users.find((x) => x.id === id) ?? notFound('User');
      if (u.role === 'admin') throw new ApiError('Admins cannot be blocked.');
      u.status = status;
      return u;
    }),

  /* Providers */
  providers: (status: ProviderStatus | 'all' = 'all', query = '') =>
    mock<Provider[]>(() => {
      assertAdmin();
      const q = query.trim().toLowerCase();
      return db.providers.filter((p) => (status === 'all' || p.status === status) && (!q || p.businessName.toLowerCase().includes(q)));
    }),
  provider: (id: string) =>
    mock<{ provider: Provider; bookings: Booking[]; serviceCount: number; revenue: number }>(() => {
      assertAdmin();
      const provider = db.providers.find((p) => p.id === id) ?? notFound('Provider');
      const bookings = db.bookings.filter((b) => b.providerId === id);
      return {
        provider,
        bookings,
        serviceCount: db.services.filter((s) => s.providerId === id).length,
        revenue: bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + commissionOf(b), 0),
      };
    }),
  setProviderStatus: (id: string, status: ProviderStatus, note?: string) =>
    mock<Provider>(() => {
      assertAdmin();
      const p = db.providers.find((x) => x.id === id) ?? notFound('Provider');
      p.status = status;
      p.verified = status === 'approved';
      if (status === 'approved') p.documents.forEach((d) => d.status !== 'missing' && (d.status = 'verified'));
      const u = db.users.find((x) => x.id === p.userId);
      if (u) u.status = status === 'approved' ? 'active' : status === 'rejected' ? 'rejected' : status === 'suspended' ? 'blocked' : 'pending';
      if (u)
        notify(u.id, {
          type: 'system',
          title: status === 'approved' ? 'You are verified! 🎉' : `Account ${status}`,
          body: status === 'approved' ? 'Your services are now live for customers.' : note ?? 'Contact support for details.',
        });
      return p;
    }),
  setCommission: (id: string, rate: number) =>
    mock<Provider>(() => {
      assertAdmin();
      if (rate < 0 || rate > 50) throw new ApiError('Commission must be between 0 and 50%.');
      const p = db.providers.find((x) => x.id === id) ?? notFound('Provider');
      p.commissionRate = rate;
      return p;
    }),

  /* Delivery partners */
  partners: () => mock<DeliveryPartner[]>(() => (assertAdmin(), db.deliveryPartners)),
  setPartnerStatus: (id: string, status: ProviderStatus) =>
    mock<DeliveryPartner>(() => {
      assertAdmin();
      const p = db.deliveryPartners.find((x) => x.id === id) ?? notFound('Partner');
      p.status = status;
      if (status !== 'approved') p.online = false;
      const u = db.users.find((x) => x.id === p.userId);
      if (u) {
        u.status = status === 'approved' ? 'active' : status === 'rejected' ? 'rejected' : status === 'suspended' ? 'blocked' : 'pending';
        notify(u.id, { type: 'system', title: status === 'approved' ? 'You are verified! 🎉' : `Account ${status}`, body: status === 'approved' ? 'Go online to start receiving tasks.' : 'Contact support for details.' });
      }
      return p;
    }),

  /* Bookings */
  bookings: (q: BookingQuery = {}) =>
    mock<Booking[]>(() => {
      assertAdmin();
      const text = q.query?.trim().toLowerCase();
      return db.bookings
        .filter(
          (b) =>
            (!q.status || q.status === 'all' || b.status === q.status) &&
            (!text || b.code.toLowerCase().includes(text) || b.customerName.toLowerCase().includes(text) || b.providerName.toLowerCase().includes(text)),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),

  /* Categories */
  categories: () => mock<Category[]>(() => (assertAdmin(), db.categories)),
  saveCategory: (input: Omit<Category, 'id' | 'serviceCount'>, id?: string) =>
    mock<Category>(() => {
      assertAdmin();
      if (id) {
        const c = db.categories.find((x) => x.id === id) ?? notFound('Category');
        Object.assign(c, input);
        return c;
      }
      const c: Category = { ...input, id: uid('cat'), serviceCount: 0 };
      db.categories.push(c);
      return c;
    }),
  deleteCategory: (id: string) =>
    mock(() => {
      assertAdmin();
      if (db.services.some((s) => s.categoryId === id || s.subcategoryId === id))
        throw new ApiError('Category has services. Deactivate it instead.');
      db.categories = db.categories.filter((c) => c.id !== id && c.parentId !== id);
      return { ok: true };
    }),

  /* Payouts */
  payouts: () => mock<Payout[]>(() => (assertAdmin(), [...db.payouts].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)))),
  processPayout: (id: string, status: 'paid' | 'rejected', note?: string) =>
    mock<Payout>(() => {
      assertAdmin();
      const p = db.payouts.find((x) => x.id === id) ?? notFound('Payout');
      if (p.status !== 'requested' && p.status !== 'approved') throw new ApiError('Payout already processed.');
      p.status = status;
      p.processedAt = new Date().toISOString();
      p.note = note;
      const payeeUser =
        p.payeeRole === 'provider'
          ? db.providers.find((x) => x.id === p.payeeId)?.userId
          : db.deliveryPartners.find((x) => x.id === p.payeeId)?.userId;
      if (payeeUser)
        notify(payeeUser, {
          type: 'payment',
          title: status === 'paid' ? 'Payout sent' : 'Payout rejected',
          body: status === 'paid' ? `₹${p.amount} has been transferred to your bank.` : note ?? 'Contact support for details.',
          href: p.payeeRole === 'provider' ? '/provider/earnings' : '/delivery/earnings',
        });
      return p;
    }),

  /* Promotions */
  promos: () => mock<PromoCode[]>(() => (assertAdmin(), db.promoCodes)),
  savePromo: (input: Omit<PromoCode, 'id' | 'usageCount'>, id?: string) =>
    mock<PromoCode>(() => {
      assertAdmin();
      if (db.promoCodes.some((x) => x.code === input.code && x.id !== id)) throw new ApiError('This code already exists.', 409);
      if (id) return Object.assign(db.promoCodes.find((x) => x.id === id) ?? notFound('Promo'), input);
      const promo: PromoCode = { ...input, id: uid('pr'), usageCount: 0 };
      db.promoCodes.unshift(promo);
      return promo;
    }),
  togglePromo: (id: string) =>
    mock<PromoCode>(() => {
      assertAdmin();
      const p = db.promoCodes.find((x) => x.id === id) ?? notFound('Promo');
      p.active = !p.active;
      return p;
    }, 200),
  deletePromo: (id: string) =>
    mock(() => {
      assertAdmin();
      db.promoCodes = db.promoCodes.filter((p) => p.id !== id);
      return { ok: true };
    }),
  banners: () => mock<Banner[]>(() => (assertAdmin(), db.banners)),
  toggleBanner: (id: string) =>
    mock<Banner>(() => {
      assertAdmin();
      const b = db.banners.find((x) => x.id === id) ?? notFound('Banner');
      b.active = !b.active;
      return b;
    }, 200),

  /* Settings & cities */
  settings: () => mock<PlatformSettings>(() => (assertAdmin(), db.settings)),
  updateSettings: (patch: Partial<PlatformSettings>) =>
    mock<PlatformSettings>(() => {
      assertAdmin();
      if (patch.taxPercent != null && (patch.taxPercent < 0 || patch.taxPercent > 40)) throw new ApiError('Tax must be between 0 and 40%.');
      return Object.assign(db.settings, patch);
    }),
  cities: () => mock<City[]>(() => (assertAdmin(), db.cities)),
  toggleCity: (id: string) =>
    mock<City>(() => {
      assertAdmin();
      const c = db.cities.find((x) => x.id === id) ?? notFound('City');
      c.active = !c.active;
      return c;
    }, 200),
  addCity: (name: string, state: string) =>
    mock<City>(() => {
      assertAdmin();
      if (db.cities.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) throw new ApiError('City already exists.');
      const c: City = { id: uid('city'), name: name.trim(), state: state.trim(), active: true };
      db.cities.push(c);
      return c;
    }),

  /** Broadcast a push notification to a role. */
  broadcast: (role: Role | 'all', title: string, body: string) =>
    mock(() => {
      assertAdmin();
      const targets = db.users.filter((u) => role === 'all' || u.role === role);
      targets.forEach((u) => notify(u.id, { type: 'promo', title, body }));
      return { sent: targets.length };
    }, 800),
};

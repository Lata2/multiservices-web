/**
 * In-memory mock database. API modules read & mutate these arrays so that
 * actions persist for the session (e.g. a booking placed by a customer shows
 * up for the provider and admin). Replace with real HTTP calls later — screens
 * never import this file directly.
 */
import * as seed from './seed';

export const db = {
  settings: seed.settings,
  cities: seed.cities,
  users: seed.users,
  categories: seed.categories,
  providers: seed.providers,
  services: seed.services,
  addresses: seed.addresses,
  bookings: seed.bookings,
  deliveryPartners: seed.deliveryPartners,
  deliveryTasks: seed.deliveryTasks,
  reviews: seed.reviews,
  promoCodes: seed.promoCodes,
  banners: seed.banners,
  notifications: seed.notifications,
  tickets: seed.tickets,
  faqs: seed.faqs,
  walletTxns: seed.walletTxns,
  payouts: seed.payouts,
  chatThreads: seed.chatThreads,
  chatMessages: seed.chatMessages,
  favorites: { u_c1: ['svc_7', 'svc_27', 'prov_5'] } as Record<string, string[]>,
  /** Demo password store — never do this in production. */
  passwords: {} as Record<string, string>,
  /** Federated identities linked to users (provider + stable subject → user). */
  identities: [] as { provider: 'google' | 'apple'; subject: string; userId: string; email: string | null; linkedAt: string }[],
};

export type MockDb = typeof db;

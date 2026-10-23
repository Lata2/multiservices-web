/**
 * Read hooks (TanStack Query). Each maps 1:1 to a service function so the
 * whole data layer can be swapped to a real backend without touching screens.
 */
import { useQuery } from '@tanstack/react-query';
import {
  addressesApi,
  adminApi,
  bookingsApi,
  catalogApi,
  chatApi,
  deliveryApi,
  favoritesApi,
  notificationsApi,
  offersApi,
  providerApi,
  reviewsApi,
  supportApi,
  walletApi,
  type BookingQuery,
  type BookingTab,
  type ProviderFilters,
  type ServiceFilters,
} from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import type { CartItem, Faq, ProviderStatus, Role } from '@/types/models';
import { qk } from './queryKeys';

const useAuthed = () => !!useAuthStore((s) => s.user);

/* Catalog */
export const usePaymentConfig = () => useQuery({ queryKey: ['config', 'payments'], queryFn: catalogApi.getPaymentConfig, staleTime: 5 * 60_000 });
export const useCities = () => useQuery({ queryKey: qk.cities, queryFn: catalogApi.getCities, staleTime: 60 * 60_000 });
export const useCategories = (parentId: string | null = null) =>
  useQuery({ queryKey: qk.categories(parentId), queryFn: () => catalogApi.getCategories(parentId), staleTime: 10 * 60_000 });
export const useAllCategories = () => useQuery({ queryKey: ['categories', 'all'], queryFn: catalogApi.getAllCategories, staleTime: 10 * 60_000 });
export const useCategory = (id: string) => useQuery({ queryKey: qk.category(id), queryFn: () => catalogApi.getCategory(id), enabled: !!id });
export const useBanners = () => useQuery({ queryKey: qk.banners, queryFn: catalogApi.getBanners, staleTime: 10 * 60_000 });
export const useServices = (filters: ServiceFilters) => useQuery({ queryKey: qk.services(filters), queryFn: () => catalogApi.getServices(filters) });
export const usePopularServices = () => useQuery({ queryKey: qk.popular, queryFn: () => catalogApi.getPopularServices(8) });
export const useService = (id: string) => useQuery({ queryKey: qk.service(id), queryFn: () => catalogApi.getService(id), enabled: !!id });
export const useServiceReviews = (id: string) => useQuery({ queryKey: qk.serviceReviews(id), queryFn: () => catalogApi.getServiceReviews(id), enabled: !!id });
export const useProviders = (filters: ProviderFilters) => useQuery({ queryKey: qk.providers(filters), queryFn: () => catalogApi.getProviders(filters) });
export const useProvider = (id: string) => useQuery({ queryKey: qk.provider(id), queryFn: () => catalogApi.getProvider(id), enabled: !!id });
export const useSearch = (q: string) =>
  useQuery({ queryKey: qk.search(q), queryFn: () => catalogApi.search(q), enabled: q.trim().length >= 2, placeholderData: (prev) => prev });
export const useSlots = (providerId: string | null, date: string | null) =>
  useQuery({ queryKey: qk.slots(providerId ?? '', date ?? ''), queryFn: () => catalogApi.getSlots(providerId!, date!), enabled: !!providerId && !!date });
export const useCartServices = (ids: string[]) =>
  useQuery({ queryKey: ['cart-services', ids], queryFn: () => catalogApi.getServicesByIds(ids), enabled: ids.length > 0, placeholderData: (p) => p });
export const useQuote = (items: CartItem[], promo: string | null) =>
  useQuery({ queryKey: qk.quote(items, promo), queryFn: () => bookingsApi.quote(items, promo ?? undefined), enabled: items.length > 0, placeholderData: (p) => p });

/* Customer */
export const useMyBookings = (tab: BookingTab) => useQuery({ queryKey: qk.bookings.mine(tab), queryFn: () => bookingsApi.listMine(tab), enabled: useAuthed() });
export const useBooking = (id: string) => useQuery({ queryKey: qk.bookings.detail(id), queryFn: () => bookingsApi.get(id), enabled: !!id });
export const useAddresses = () => useQuery({ queryKey: qk.addresses, queryFn: addressesApi.list, enabled: useAuthed() });
export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: notificationsApi.list, enabled: useAuthed(), refetchInterval: 30_000 });
export const useWallet = () => useQuery({ queryKey: qk.wallet, queryFn: walletApi.get, enabled: useAuthed() });
export const useFavoriteIds = () => useQuery({ queryKey: qk.favoriteIds, queryFn: favoritesApi.ids, enabled: useAuthed() });
export const useFavorites = () => useQuery({ queryKey: qk.favorites, queryFn: favoritesApi.list, enabled: useAuthed() });
export const useOffers = (providerId?: string) => useQuery({ queryKey: qk.offers(providerId), queryFn: () => offersApi.list(providerId) });
export const useReview = (id?: string) => useQuery({ queryKey: qk.review(id ?? ''), queryFn: () => reviewsApi.get(id!), enabled: !!id });
export const useFaqs = (aud: Faq['audience']) => useQuery({ queryKey: qk.faqs(aud), queryFn: () => supportApi.faqs(aud) });
export const useMyTickets = () => useQuery({ queryKey: qk.tickets.mine, queryFn: supportApi.myTickets, enabled: useAuthed() });
export const useTicket = (id: string) => useQuery({ queryKey: qk.tickets.detail(id), queryFn: () => supportApi.get(id), enabled: !!id });
export const useChatThreads = () => useQuery({ queryKey: qk.chat.threads, queryFn: chatApi.threads, enabled: useAuthed() });
export const useChat = (id: string) =>
  useQuery({ queryKey: qk.chat.thread(id), queryFn: () => chatApi.messages(id), enabled: !!id, refetchInterval: 2500 });
export const useDeliveryForBooking = (bookingId: string) =>
  useQuery({ queryKey: qk.delivery.forBooking(bookingId), queryFn: () => deliveryApi.taskForBooking(bookingId), enabled: !!bookingId });

/* Provider */
export const useProviderDashboard = () => useQuery({ queryKey: qk.provider_.dashboard, queryFn: providerApi.dashboard });
export const useProviderProfile = () => useQuery({ queryKey: qk.provider_.profile, queryFn: providerApi.profile });
export const useProviderBookings = (tab: BookingTab | 'requests') =>
  useQuery({ queryKey: qk.bookings.provider(tab), queryFn: () => providerApi.bookings(tab) });
export const useProviderServices = () => useQuery({ queryKey: qk.provider_.services, queryFn: providerApi.services });
export const useProviderPromos = (enabled = true) => useQuery({ queryKey: qk.provider_.promos, queryFn: providerApi.promos, enabled });
export const useProviderEarnings = () => useQuery({ queryKey: qk.provider_.earnings, queryFn: providerApi.earnings });
export const useProviderReviews = (providerId?: string) =>
  useQuery({ queryKey: qk.provider_.reviews(providerId ?? ''), queryFn: () => reviewsApi.forProvider(providerId!), enabled: !!providerId });

/* Delivery */
export const useDeliveryHome = () => useQuery({ queryKey: qk.delivery.home, queryFn: deliveryApi.home, refetchInterval: 20_000 });
export const useDeliveryProfile = () => useQuery({ queryKey: qk.delivery.profile, queryFn: deliveryApi.profile });
export const useDeliveryHistory = () => useQuery({ queryKey: qk.delivery.history, queryFn: deliveryApi.history });
export const useDeliveryTask = (id: string) => useQuery({ queryKey: qk.delivery.task(id), queryFn: () => deliveryApi.task(id), enabled: !!id });
export const useDeliveryEarnings = () => useQuery({ queryKey: qk.delivery.earnings, queryFn: deliveryApi.earnings });

/* Admin */
export const useAdminDashboard = () => useQuery({ queryKey: qk.admin.dashboard, queryFn: adminApi.dashboard });
export const useAdminUsers = (role: Role | 'all', q: string) => useQuery({ queryKey: qk.admin.users(role, q), queryFn: () => adminApi.users(role, q), placeholderData: (p) => p });
export const useAdminUser = (id: string) => useQuery({ queryKey: qk.admin.user(id), queryFn: () => adminApi.user(id), enabled: !!id });
export const useAdminProviders = (status: ProviderStatus | 'all', q: string) =>
  useQuery({ queryKey: qk.admin.providers(status, q), queryFn: () => adminApi.providers(status, q), placeholderData: (p) => p });
export const useAdminProvider = (id: string) => useQuery({ queryKey: qk.admin.provider(id), queryFn: () => adminApi.provider(id), enabled: !!id });
export const useAdminPartners = () => useQuery({ queryKey: qk.admin.partners, queryFn: adminApi.partners });
export const useAdminBookings = (q: BookingQuery) => useQuery({ queryKey: qk.bookings.admin(q), queryFn: () => adminApi.bookings(q), placeholderData: (p) => p });
export const useAdminCategories = () => useQuery({ queryKey: qk.admin.categories, queryFn: adminApi.categories });
export const useAdminPayouts = () => useQuery({ queryKey: qk.admin.payouts, queryFn: adminApi.payouts });
export const useAdminPromos = (enabled = true) => useQuery({ queryKey: qk.admin.promos, queryFn: adminApi.promos, enabled });
export const useAdminBanners = () => useQuery({ queryKey: qk.admin.banners, queryFn: adminApi.banners });
export const useAdminSettings = () => useQuery({ queryKey: qk.admin.settings, queryFn: adminApi.settings });
export const useAdminCities = () => useQuery({ queryKey: qk.admin.cities, queryFn: adminApi.cities });
export const useAdminTickets = () => useQuery({ queryKey: qk.tickets.admin, queryFn: supportApi.allTickets });
export const useAdminReviews = () => useQuery({ queryKey: qk.admin.reviews, queryFn: reviewsApi.all });

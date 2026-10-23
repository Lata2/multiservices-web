import { db } from '@/mocks/db';
import type { Banner, Category, City, PlatformSettings, Provider, Review, Service, TimeSlot } from '@/types/models';
import { effectivePrice } from '@/utils/pricing';
import { generateSlots } from '@/utils/slots';
import { mock, notFound } from '../http';

export type SortOption = 'relevance' | 'rating' | 'price_low' | 'price_high' | 'popular';

export interface ServiceFilters {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  discountedOnly?: boolean;
  sort?: SortOption;
}

export interface ProviderFilters {
  query?: string;
  categoryId?: string;
  minRating?: number;
  maxDistance?: number;
  verifiedOnly?: boolean;
  sort?: 'rating' | 'distance' | 'jobs';
}

const approvedProviderIds = () => new Set(db.providers.filter((p) => p.status === 'approved').map((p) => p.id));

export function filterServices(list: Service[], f: ServiceFilters): Service[] {
  const ok = approvedProviderIds();
  const q = f.query?.trim().toLowerCase();
  let out = list.filter((s) => s.active && ok.has(s.providerId));
  if (q) {
    const catNames = new Map(db.categories.map((c) => [c.id, c.name.toLowerCase()]));
    out = out.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        catNames.get(s.categoryId)?.includes(q) ||
        (s.subcategoryId && catNames.get(s.subcategoryId)?.includes(q)) ||
        s.tags.some((t) => t.includes(q)),
    );
  }
  if (f.categoryId) out = out.filter((s) => s.categoryId === f.categoryId);
  if (f.subcategoryId) out = out.filter((s) => s.subcategoryId === f.subcategoryId);
  if (f.providerId) out = out.filter((s) => s.providerId === f.providerId);
  if (f.minPrice != null) out = out.filter((s) => effectivePrice(s) >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((s) => effectivePrice(s) <= f.maxPrice!);
  if (f.minRating) out = out.filter((s) => s.rating >= f.minRating!);
  if (f.discountedOnly) out = out.filter((s) => !!s.discountPrice);
  switch (f.sort) {
    case 'rating':
      out.sort((a, b) => b.rating - a.rating);
      break;
    case 'price_low':
      out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case 'price_high':
      out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case 'popular':
      out.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
  }
  return out;
}

export interface SearchResult {
  services: Service[];
  providers: Provider[];
  categories: Category[];
}

export const catalogApi = {
  getCities: () => mock<City[]>(() => db.cities.filter((c) => c.active)),

  /** Public payment options configured by the admin (`GET /config/payments`). */
  getPaymentConfig: () =>
    mock<Pick<PlatformSettings, 'paymentGateways' | 'cashOnService' | 'taxPercent' | 'cancellationWindowHours'>>(() => ({
      paymentGateways: db.settings.paymentGateways,
      cashOnService: db.settings.cashOnService,
      taxPercent: db.settings.taxPercent,
      cancellationWindowHours: db.settings.cancellationWindowHours,
    }), 150),

  getCategories: (parentId: string | null = null) =>
    mock<Category[]>(() => db.categories.filter((c) => c.active && (c.parentId ?? null) === parentId)),

  /** Full active tree (parents + subcategories) in one call. */
  getAllCategories: () => mock<Category[]>(() => db.categories.filter((c) => c.active)),

  getCategory: (id: string) =>
    mock<{ category: Category; subcategories: Category[] }>(() => {
      const category = db.categories.find((c) => c.id === id) ?? notFound('Category');
      return { category, subcategories: db.categories.filter((c) => c.parentId === id && c.active) };
    }),

  getBanners: () => mock<Banner[]>(() => db.banners.filter((b) => b.active)),

  getServices: (filters: ServiceFilters = {}) => mock<Service[]>(() => filterServices(db.services, filters)),

  getPopularServices: (limit = 8) =>
    mock<Service[]>(() => filterServices(db.services, { sort: 'popular' }).slice(0, limit)),

  getService: (id: string) =>
    mock<{ service: Service; provider: Provider; related: Service[] }>(() => {
      const service = db.services.find((s) => s.id === id) ?? notFound('Service');
      const provider = db.providers.find((p) => p.id === service.providerId)!;
      const related = filterServices(db.services, { providerId: provider.id }).filter((s) => s.id !== id).slice(0, 6);
      return { service, provider, related };
    }),

  getProviders: (f: ProviderFilters = {}) =>
    mock<Provider[]>(() => {
      const q = f.query?.trim().toLowerCase();
      let out = db.providers.filter((p) => p.status === 'approved');
      if (q) out = out.filter((p) => p.businessName.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q));
      if (f.categoryId) out = out.filter((p) => p.categoryIds.includes(f.categoryId!));
      if (f.minRating) out = out.filter((p) => p.rating >= f.minRating!);
      if (f.maxDistance) out = out.filter((p) => p.distanceKm <= f.maxDistance!);
      if (f.verifiedOnly) out = out.filter((p) => p.verified);
      const sort = f.sort ?? 'rating';
      out.sort((a, b) =>
        sort === 'distance' ? a.distanceKm - b.distanceKm : sort === 'jobs' ? b.jobsCompleted - a.jobsCompleted : b.rating - a.rating,
      );
      return out;
    }),

  getProvider: (id: string) =>
    mock<{ provider: Provider; services: Service[]; reviews: Review[] }>(() => {
      const provider = db.providers.find((p) => p.id === id) ?? notFound('Provider');
      return {
        provider,
        services: filterServices(db.services, { providerId: id }),
        reviews: db.reviews.filter((r) => r.providerId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      };
    }),

  search: (query: string) =>
    mock<SearchResult>(() => {
      const q = query.trim().toLowerCase();
      if (!q) return { services: [], providers: [], categories: [] };
      return {
        services: filterServices(db.services, { query: q, sort: 'popular' }),
        providers: db.providers.filter((p) => p.status === 'approved' && p.businessName.toLowerCase().includes(q)),
        categories: db.categories.filter((c) => c.active && c.name.toLowerCase().includes(q)),
      };
    }, 300),

  getServiceReviews: (serviceId: string) =>
    mock<Review[]>(() =>
      db.reviews.filter((r) => r.serviceId === serviceId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),

  /** Public testimonials: recent highly-rated reviews with a written comment, one per customer. */
  getTopReviews: (limit = 8) =>
    mock<(Review & { serviceTitle?: string })[]>(() => {
      const seen = new Set<string>();
      return [...db.reviews]
        .filter((r) => r.rating >= 4 && r.comment.trim().length > 0)
        .sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt))
        .filter((r) => (seen.has(r.customerName) ? false : (seen.add(r.customerName), true)))
        .slice(0, limit)
        .map((r) => ({ ...r, serviceTitle: db.services.find((s) => s.id === r.serviceId)?.title }));
    }),

  getSlots: (providerId: string, dateKey: string) =>
    mock<TimeSlot[]>(() => {
      const provider = db.providers.find((p) => p.id === providerId) ?? notFound('Provider');
      return generateSlots(provider, dateKey, db.bookings);
    }, 300),

  /** Resolve cart line items to full service objects (prices may change server-side). */
  getServicesByIds: (ids: string[]) => mock<Service[]>(() => db.services.filter((s) => ids.includes(s.id)), 200),
};

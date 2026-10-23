import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AddToCartControl, CartBar, PageHero, ServiceRow, useAddToCart } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Chip, ChipRow, EmptyState, ErrorState, IconButton, ListSkeleton } from '@/components/ui';
import { activeFilterCount, FilterSheet, SORTS, type FilterState } from '@/features/FilterSheet';
import { useProviders, useServices } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { SortOption } from '@/services/api';

/** Generic service listing with sort & filters (used by "See all" links and search). */
export default function ServicesList() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? undefined;
  const categoryId = params.get('categoryId') ?? undefined;
  const [filters, setFilters] = useState<FilterState>({ sort: (params.get('sort') as SortOption) ?? 'relevance' });
  const [open, setOpen] = useState(false);
  const query = useServices({ query: q, categoryId, ...filters });
  const providers = useProviders({});
  const { addService, dialog } = useAddToCart();
  const nameOf = (id: string) => providers.data?.find((p) => p.id === id)?.businessName;
  const count = activeFilterCount(filters);
  const title = q ? `Results for “${q}”` : 'All services';
  usePageMeta({ title, description: 'Compare prices, ratings and what’s included across every service on Servio.' });

  return (
    <PageBody>
      <PageHero
        title={title}
        subtitle={query.data ? `${query.data.length} services · compare prices & reviews` : 'Compare prices & reviews'}
        icon="grid"
        hue="highlight"
        satellites={['sparkles', 'snowflake', 'scissors', 'droplet']}
        back="/explore"
        actions={<IconButton icon="sliders" label={`Filters${count ? `, ${count} active` : ''}`} variant="glass" badge={count} onClick={() => setOpen(true)} />}
      />
      <ChipRow className="mb-4" wrap label="Sort by">
        {SORTS.map((s) => (
          <Chip key={s.value} label={s.label} selected={(filters.sort ?? 'relevance') === s.value} onClick={() => setFilters({ ...filters, sort: s.value })} />
        ))}
      </ChipRow>
      {query.isPending ? (
        <ListSkeleton rows={5} height={112} />
      ) : query.isError ? (
        <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />
      ) : query.data.length ? (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {query.data.map((s) => (
              <ServiceRow key={s.id} service={s} providerName={nameOf(s.providerId)} right={<AddToCartControl service={s} onAdd={addService} />} />
            ))}
          </div>
          <p className="mt-6 text-center text-caption text-ink-muted">You’ve reached the end</p>
        </>
      ) : (
        <EmptyState icon="funnel" title="No services match" message="Try removing some filters or searching for something else." actionLabel={count ? 'Clear filters' : undefined} onAction={() => setFilters({ sort: 'relevance' })} />
      )}
      <FilterSheet open={open} onClose={() => setOpen(false)} value={filters} onApply={setFilters} />
      <CartBar />
      {dialog}
    </PageBody>
  );
}

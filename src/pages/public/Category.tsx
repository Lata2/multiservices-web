import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AddToCartControl, CartBar, CategoryIconBadge, ProviderCard, ServiceRow, useAddToCart } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Chip, ChipRow, EmptyState, ErrorState, IconButton, ListSkeleton, PageHeader, SectionHeader, Select } from '@/components/ui';
import { activeFilterCount, FilterSheet, SORTS, type FilterState } from '@/features/FilterSheet';
import { useCategory, useProviders, useServices } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { SortOption } from '@/services/api';

export default function CategoryPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const subId = params.get('sub') ?? undefined;
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({ sort: 'popular' });
  const [open, setOpen] = useState(false);
  const cat = useCategory(id);
  const services = useServices({ categoryId: id, subcategoryId: subId, ...filters });
  const providers = useProviders({ categoryId: id });
  const { addService, dialog } = useAddToCart();
  const nameOf = (pid: string) => providers.data?.find((p) => p.id === pid)?.businessName;
  const count = activeFilterCount(filters);
  const name = cat.data?.category.name ?? 'Category';
  usePageMeta({ title: `${name} services`, description: cat.data?.category.description ? `${cat.data.category.description}. Book ${name.toLowerCase()} services with verified professionals on Servio.` : undefined });

  const setSub = (v?: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set('sub', v);
    else next.delete('sub');
    setParams(next, { replace: true });
  };

  if (cat.isError) return <PageBody><ErrorState message={errorMessage(cat.error)} onRetry={() => void cat.refetch()} /></PageBody>;

  return (
    <PageBody>
      <PageHeader
        title={name}
        back="/explore"
        actions={
          <>
            <IconButton icon="search" label="Search" variant="plain" onClick={() => navigate('/search')} className="lg:hidden" />
            <IconButton icon="sliders" label={`Filters${count ? `, ${count} active` : ''}`} variant={count ? 'solid' : 'outline'} badge={count} onClick={() => setOpen(true)} />
          </>
        }
      />
      {cat.data ? (
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-border/80 bg-surface p-4 shadow-sm">
          <CategoryIconBadge categoryId={id} size={52} />
          <div className="min-w-0 flex-1">
            <p className="text-body-sm text-ink-secondary">{cat.data.category.description}</p>
            <p className="mt-0.5 text-caption text-ink-muted">{services.data ? `${services.data.length} services available` : ' '}</p>
          </div>
          <div className="hidden w-56 sm:block">
            <Select<SortOption> value={filters.sort ?? 'popular'} onChange={(v) => setFilters({ ...filters, sort: v })} options={SORTS} placeholder="Sort by" />
          </div>
        </div>
      ) : null}

      <ChipRow className="mb-5" wrap label="Sub-categories">
        <Chip label="All" selected={!subId} onClick={() => setSub(undefined)} />
        {cat.data?.subcategories.map((s) => (
          <Chip key={s.id} label={s.name} selected={subId === s.id} onClick={() => setSub(s.id)} />
        ))}
      </ChipRow>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Services">
          {services.isPending ? (
            <ListSkeleton rows={4} height={112} />
          ) : services.data?.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {services.data.map((s) => (
                <ServiceRow key={s.id} service={s} providerName={nameOf(s.providerId)} right={<AddToCartControl service={s} onAdd={addService} />} />
              ))}
            </div>
          ) : (
            <EmptyState compact icon="construct" title="No services match" message={count ? 'Try removing some filters.' : 'We’re onboarding professionals for this category in your city.'} actionLabel={count ? 'Clear filters' : undefined} onAction={() => setFilters({ sort: 'popular' })} />
          )}
        </section>
        {providers.data?.length ? (
          <aside>
            <SectionHeader title="Providers in this category" as="h2" />
            <div className="flex flex-col gap-3">
              {providers.data.slice(0, 4).map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      <FilterSheet open={open} onClose={() => setOpen(false)} value={filters} onApply={setFilters} />
      <CartBar />
      {dialog}
    </PageBody>
  );
}

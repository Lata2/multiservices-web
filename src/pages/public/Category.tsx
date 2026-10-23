import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { AddToCartControl, CartBar, PageHero, ProviderCard, ServiceRow, useAddToCart, useCategoryVisual } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Chip, ChipRow, EmptyState, ErrorState, IconButton, ListSkeleton, SectionHeader, Select } from '@/components/ui';
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
  const visual = useCategoryVisual(id);
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
      <PageHero
        title={name}
        subtitle={cat.data ? `${cat.data.category.description}${services.data ? ` · ${services.data.length} services` : ''}` : ' '}
        icon={visual.icon}
        hue={visual.hue}
        scene={visual.scene}
        back="/explore"
        actions={
          <>
            <IconButton icon="search" label="Search" variant="glass" onClick={() => navigate('/search')} />
            <IconButton icon="sliders" label={`Filters${count ? `, ${count} active` : ''}`} variant="glass" badge={count} onClick={() => setOpen(true)} />
          </>
        }
      >
        <div className="hidden w-60 sm:block">
          <Select<SortOption> value={filters.sort ?? 'popular'} onChange={(v) => setFilters({ ...filters, sort: v })} options={SORTS} placeholder="Sort by" />
        </div>
      </PageHero>
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

import { useState } from 'react';
import { PageHero, ProviderCard } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Chip, ChipRow, EmptyState, ErrorState, ListSkeleton, SearchBar } from '@/components/ui';
import { useCategories, useProviders } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { useDebounced } from '@/hooks/useDebounced';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { ProviderFilters } from '@/services/api';

export default function Providers() {
  usePageMeta({ title: 'Professionals near you', description: 'Browse verified, top-rated home service professionals near you — compare ratings, jobs completed and distance.' });
  const [text, setText] = useState('');
  const query = useDebounced(text);
  const [filters, setFilters] = useState<ProviderFilters>({ sort: 'rating' });
  const q = useProviders({ ...filters, query });
  const cats = useCategories(null);

  return (
    <PageBody>
      <PageHero title="Professionals" subtitle={q.data ? `${q.data.length} verified pros near you` : 'Verified pros near you'} icon="users" hue="success" satellites={['verified', 'star', 'briefcase', 'pin']} back="/">
        <SearchBar value={text} onChange={setText} placeholder="Search by business name" className="max-w-md border-0 shadow-float" />
      </PageHero>
      <div className="mb-5 flex flex-col gap-3">
        <ChipRow wrap label="Sort and filter">
          <Chip label="Top rated" icon="star" selected={filters.sort === 'rating'} onClick={() => setFilters({ ...filters, sort: 'rating' })} />
          <Chip label="Nearest" icon="navigate" selected={filters.sort === 'distance'} onClick={() => setFilters({ ...filters, sort: 'distance' })} />
          <Chip label="Most jobs" icon="briefcase" selected={filters.sort === 'jobs'} onClick={() => setFilters({ ...filters, sort: 'jobs' })} />
          <Chip label="4.5+ rating" selected={filters.minRating === 4.5} onClick={() => setFilters({ ...filters, minRating: filters.minRating ? undefined : 4.5 })} />
          <Chip label="Within 5 km" selected={filters.maxDistance === 5} onClick={() => setFilters({ ...filters, maxDistance: filters.maxDistance ? undefined : 5 })} />
        </ChipRow>
        <ChipRow label="Category" className="lg:flex-wrap lg:overflow-visible">
          <Chip label="All categories" selected={!filters.categoryId} onClick={() => setFilters({ ...filters, categoryId: undefined })} />
          {cats.data?.map((cat) => (
            <Chip key={cat.id} label={cat.name} selected={filters.categoryId === cat.id} onClick={() => setFilters({ ...filters, categoryId: cat.id })} />
          ))}
        </ChipRow>
      </div>
      {q.isPending ? (
        <ListSkeleton rows={6} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : q.data.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {q.data.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon="users" title="No providers found" message="Try a different filter or search." actionLabel="Reset filters" onAction={() => (setFilters({ sort: 'rating' }), setText(''))} />
      )}
    </PageBody>
  );
}

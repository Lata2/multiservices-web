import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { AddToCartControl, CategoryIconBadge, ProviderCard, ServiceRow, useAddToCart } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Chip, EmptyState, Icon, IconButton, ListSkeleton, SearchBar, SectionHeader } from '@/components/ui';
import { useCategories, useSearch } from '@/hooks/api';
import { useDebounced } from '@/hooks/useDebounced';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAppStore } from '@/store/app.store';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [text, setText] = useState(params.get('q') ?? '');
  const query = useDebounced(text.trim());
  const results = useSearch(query);
  const categories = useCategories(null);
  const recents = useAppStore((s) => s.recentSearches);
  const addRecent = useAppStore((s) => s.addRecentSearch);
  const clearRecents = useAppStore((s) => s.clearRecentSearches);
  const { addService, dialog } = useAddToCart();
  usePageMeta({ title: query ? `Search: ${query}` : 'Search', noindex: true });

  // Keep the URL shareable (?q=) without adding history entries per keystroke.
  useEffect(() => {
    const cur = params.get('q') ?? '';
    if (cur !== query) setParams(query ? { q: query } : {}, { replace: true });
  }, [query, params, setParams]);

  const remember = () => query.length >= 2 && addRecent(query);
  const hasQuery = query.length >= 2;
  const r = results.data;
  const empty = hasQuery && r && !r.services.length && !r.providers.length && !r.categories.length;

  return (
    <PageBody narrow>
      <h1 className="sr-only">{hasQuery ? `Search results for “${query}”` : 'Search'}</h1>
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex items-center gap-1 bg-background/95 px-2 py-2 backdrop-blur sm:-mx-6 sm:px-4 lg:top-16 lg:mx-0 lg:px-0">
        <IconButton icon="chevron-left" label="Go back" variant="plain" onClick={() => navigate(-1)} className="lg:hidden" />
        <SearchBar value={text} onChange={setText} placeholder="Search services, categories or providers" autoFocus onSubmit={remember} className="flex-1" />
      </div>

      {!hasQuery ? (
        <>
          {recents.length ? (
            <section className="mb-7">
              <SectionHeader title="Recent searches" action="Clear" onAction={clearRecents} />
              <div className="flex flex-wrap gap-2">
                {recents.map((q) => (
                  <Chip key={q} label={q} icon="clock" onClick={() => setText(q)} />
                ))}
              </div>
            </section>
          ) : null}
          <SectionHeader title="Browse categories" />
          <ul className="grid gap-1 sm:grid-cols-2">
            {categories.data?.map((cat) => (
              <li key={cat.id}>
                <Link to={`/category/${cat.id}`} className="focus-ring flex items-center gap-3 rounded-lg p-2 hover:bg-surface">
                  <CategoryIconBadge categoryId={cat.id} size={40} />
                  <span className="flex-1 font-medium">{cat.name}</span>
                  <Icon name="arrow-right" size={15} className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : results.isPending ? (
        <ListSkeleton rows={5} height={100} />
      ) : empty ? (
        <EmptyState icon="search" title={`No results for “${query}”`} message="Try a different keyword like ‘cleaning’, ‘AC’ or ‘salon’." />
      ) : r ? (
        <div className="flex flex-col gap-7" aria-live="polite">
          {r.categories.length ? (
            <section>
              <SectionHeader title="Categories" />
              <div className="flex flex-wrap gap-2">
                {r.categories.map((cat) => (
                  <Chip key={cat.id} label={cat.name} icon={cat.icon as never} onClick={() => (remember(), navigate(cat.parentId ? `/category/${cat.parentId}?sub=${cat.id}` : `/category/${cat.id}`))} />
                ))}
              </div>
            </section>
          ) : null}
          {r.services.length ? (
            <section>
              <SectionHeader title={`Services (${r.services.length})`} action={r.services.length > 6 ? 'See all' : undefined} to={`/services?q=${encodeURIComponent(query)}`} />
              <div className="flex flex-col gap-3" onClickCapture={remember}>
                {r.services.slice(0, 6).map((s) => (
                  <ServiceRow key={s.id} service={s} right={<AddToCartControl service={s} onAdd={addService} />} />
                ))}
              </div>
            </section>
          ) : null}
          {r.providers.length ? (
            <section>
              <SectionHeader title="Providers" />
              <div className="flex flex-col gap-3">
                {r.providers.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
      {dialog}
    </PageBody>
  );
}

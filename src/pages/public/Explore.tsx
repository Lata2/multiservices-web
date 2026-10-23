import { useMemo } from 'react';
import { Link } from 'react-router';
import { CartBar, PageHero, ServiceThumb } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { QueryView, SearchLink, Skeleton } from '@/components/ui';
import { useAllCategories, useCategories } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Explore() {
  usePageMeta({ title: 'Explore services', description: 'Browse every home service category on Servio — cleaning, AC & appliances, electricians, plumbing, salon, grooming, painting, pest control, laundry, car care and more.' });
  const parents = useCategories(null);
  const all = useAllCategories();
  const subsByParent = useMemo(() => {
    const m = new Map<string, { id: string; name: string }[]>();
    all.data?.forEach((cat) => cat.parentId && m.set(cat.parentId, [...(m.get(cat.parentId) ?? []), cat]));
    return m;
  }, [all.data]);

  return (
    <PageBody>
      <PageHero title="Explore services" subtitle={parents.data ? `${parents.data.length} categories · verified pros in each` : 'Every home service in one place'} icon="compass" hue="primary" satellites={['sparkles', 'zap', 'scissors', 'car']}>
        <SearchLink placeholder="What do you need help with?" className="max-w-md border-0 shadow-float" />
      </PageHero>
      <QueryView
        query={parents}
        loading={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        }
      >
        {(cats) => (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {cats.map((cat) => {
              const subs = subsByParent.get(cat.id) ?? [];
              return (
                <li key={cat.id} className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-sm">
                  <div className="p-1.5 pb-0">
                    <ServiceThumb categoryId={cat.id} variant="scene" className="h-24 w-full rounded-xl sm:h-28" iconSize={26} />
                  </div>
                  <div className="flex flex-1 flex-col p-3 sm:p-4 sm:pt-3">
                    <h2 className="text-body font-bold leading-5">
                      <Link to={`/category/${cat.id}`} className="focus-ring rounded after:absolute after:inset-0 after:rounded-2xl group-hover:text-primary-700">
                        {cat.name}
                      </Link>
                    </h2>
                    <p className="mt-1 text-caption text-ink-muted">
                      {cat.serviceCount} service{cat.serviceCount === 1 ? '' : 's'}
                    </p>
                    {subs.length ? (
                      <div className="relative z-10 mt-3 hidden flex-wrap gap-1.5 sm:flex">
                        {subs.slice(0, 3).map((sub) => (
                          <Link key={sub.id} to={`/category/${cat.id}?sub=${sub.id}`} className="focus-ring rounded-full bg-surface-muted px-2.5 py-1 text-caption font-medium text-ink-secondary transition-colors hover:bg-primary-50 hover:text-primary-700">
                            {sub.name}
                          </Link>
                        ))}
                        {subs.length > 3 ? <span className="rounded-full px-1.5 py-1 text-caption font-medium text-ink-muted">+{subs.length - 3}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
      <CartBar />
    </PageBody>
  );
}

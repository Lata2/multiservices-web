import { useMemo } from 'react';
import { Link } from 'react-router';
import { CartBar } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { cn, Icon, ListSkeleton, QueryView, SearchLink } from '@/components/ui';
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
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-h1 font-bold">Explore services</h1>
          <p className="mt-1 text-ink-secondary">{parents.data ? `${parents.data.length} categories · verified professionals in every one` : 'Loading categories…'}</p>
        </div>
        <SearchLink placeholder="What do you need help with?" className="lg:w-96" />
      </div>
      <QueryView query={parents} loading={<ListSkeleton rows={6} height={110} />}>
        {(cats) => (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cats.map((cat, i) => {
              const subs = subsByParent.get(cat.id) ?? [];
              return (
                <li key={cat.id} className="relative flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
                  <div className="flex items-center gap-3.5">
                    <span className={cn(`tint-${i % 6}`, 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl')}>
                      <Icon name={cat.icon} size={23} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold">
                        <Link to={`/category/${cat.id}`} className="focus-ring rounded after:absolute after:inset-0 after:rounded-card">
                          {cat.name}
                        </Link>
                      </h2>
                      <p className="truncate text-caption text-ink-muted">{cat.description}</p>
                    </div>
                    <span className="text-caption font-medium text-ink-secondary">
                      {cat.serviceCount} service{cat.serviceCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  {subs.length ? (
                    <div className="relative z-10 flex flex-wrap gap-2">
                      {subs.map((s) => (
                        <Link key={s.id} to={`/category/${cat.id}?sub=${s.id}`} className="focus-ring rounded-full border border-border bg-surface-muted px-3 py-1.5 text-caption font-medium text-ink-secondary hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
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

import { useState } from 'react';
import { Link } from 'react-router';
import { Price, ServiceThumb } from '@/components/domain';
import { Badge, ConfirmDialog, EmptyState, IconButton, LinkButton, ListSkeleton, PageHeader, QueryView, SearchBar, Switch } from '@/components/ui';
import { useProviderServices } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import type { Service } from '@/types/models';
import { formatDuration } from '@/utils/format';

export default function ProviderServices() {
  usePageMeta({ title: 'My services', noindex: true });
  const q = useProviderServices();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<Service | null>(null);
  const toggle = useApiMutation((id: string) => providerApi.toggleService(id), { invalidate: [qk.provider_.services, ['services']], successMessage: (s) => (s.active ? 'Service is live' : 'Service hidden from customers') });
  const remove = useApiMutation((id: string) => providerApi.deleteService(id), { invalidate: [qk.provider_.services, ['services']], successMessage: 'Service deleted', onSuccess: () => setToDelete(null), onError: () => setToDelete(null) });
  const list = (q.data ?? []).filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <PageHeader
        title="My services"
        subtitle={q.data ? `${q.data.filter((s) => s.active).length} live · ${q.data.length} total` : undefined}
        actions={
          <LinkButton to="/provider/services/new" size="sm" leftIcon="plus">
            Add service
          </LinkButton>
        }
      />
      <SearchBar value={query} onChange={setQuery} placeholder="Search your services" className="mb-4 lg:max-w-md" />
      <QueryView query={q} loading={<ListSkeleton rows={4} height={120} />} empty={<EmptyState icon="wrench" title="No services yet" message="Add your first service so customers can book you." actionLabel="Add service" actionTo="/provider/services/new" />}>
        {() =>
          list.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {list.map((s) => (
                <li key={s.id} className="flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm">
                  <Link to={`/provider/services/${s.id}/edit`} className="focus-ring flex gap-3 rounded-lg">
                    <ServiceThumb categoryId={s.categoryId} subcategoryId={s.subcategoryId} image={s.image} className="h-16 w-16 rounded-lg" iconSize={22} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 font-semibold hover:text-primary-700">{s.title}</span>
                      <span className="block text-caption text-ink-muted">
                        {formatDuration(s.durationMin)} · ★ {s.rating ? s.rating.toFixed(1) : 'New'} · {s.reviewCount} reviews
                      </span>
                      <span className="mt-1 block">
                        <Price price={s.price} discountPrice={s.discountPrice} size="sm" />
                      </span>
                    </span>
                  </Link>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={s.active} onChange={() => toggle.mutate(s.id)} label={`${s.title} visible to customers`} tone="success" />
                      <Badge label={s.active ? 'Live' : 'Hidden'} tone={s.active ? 'success' : 'neutral'} />
                      {s.requiresPickup ? <Badge label="Pickup" tone="info" icon="bike" /> : null}
                    </div>
                    <div className="flex gap-1">
                      <LinkButton to={`/provider/services/${s.id}/edit`} variant="ghost" size="sm" leftIcon="pencil">
                        Edit
                      </LinkButton>
                      <IconButton icon="trash" label={`Delete ${s.title}`} variant="plain" size="sm" iconClassName="text-danger-500" onClick={() => setToDelete(s)} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon="search" title="No matches" message="Try a different search." />
          )
        }
      </QueryView>
      <ConfirmDialog
        open={!!toDelete}
        tone="danger"
        icon="trash"
        title="Delete service?"
        message={`“${toDelete?.title}” will be removed permanently. Consider hiding it instead.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}

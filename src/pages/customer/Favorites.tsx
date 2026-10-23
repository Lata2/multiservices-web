import { useState } from 'react';
import { ProviderCard, ServiceRow } from '@/components/domain';
import { EmptyState, IconButton, ListSkeleton, PageHeader, QueryView, SegmentedTabs } from '@/components/ui';
import { useFavorites } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { favoritesApi } from '@/services/api';

export default function Favorites() {
  usePageMeta({ title: 'Favourites', noindex: true });
  const q = useFavorites();
  const [tab, setTab] = useState<'services' | 'providers'>('services');
  const remove = useApiMutation((id: string) => favoritesApi.toggle(id), { invalidate: [qk.favorites], successMessage: 'Removed from favourites' });
  return (
    <>
      <PageHeader title="Favourites" back="/account" />
      <SegmentedTabs
        className="mb-4 lg:max-w-sm"
        value={tab}
        onChange={setTab}
        label="Favourite type"
        tabs={[
          { value: 'services', label: 'Services', count: q.data?.services.length },
          { value: 'providers', label: 'Providers', count: q.data?.providers.length },
        ]}
      />
      <QueryView query={q} loading={<ListSkeleton rows={3} />}>
        {(d) =>
          tab === 'services' ? (
            d.services.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {d.services.map((s) => (
                  <ServiceRow key={s.id} service={s} right={<IconButton icon="heart" filled label={`Remove ${s.title} from favourites`} variant="plain" iconClassName="text-danger-500" onClick={() => remove.mutate(s.id)} />} />
                ))}
              </div>
            ) : (
              <EmptyState icon="heart" title="No saved services" message="Tap the heart on any service to save it here." actionLabel="Explore services" actionTo="/explore" />
            )
          ) : d.providers.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {d.providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <EmptyState icon="users" title="No saved providers" message="Save providers you love to rebook quickly." actionLabel="Browse professionals" actionTo="/professionals" />
          )
        }
      </QueryView>
    </>
  );
}

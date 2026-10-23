import { Card, cn, EmptyState, Icon, ListSkeleton, PageHeader, QueryView, Switch } from '@/components/ui';
import { useAdminBanners, useCategories } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';

const tones = ['from-primary-500 to-primary-800', 'from-accent-500 to-accent-700', 'from-highlight-500 to-highlight-700'];

export default function AdminBanners() {
  usePageMeta({ title: 'Home banners', noindex: true });
  const q = useAdminBanners();
  const cats = useCategories(null);
  const toggle = useApiMutation((id: string) => adminApi.toggleBanner(id), { invalidate: [qk.admin.banners, ['banners']], successMessage: (b) => (b.active ? 'Banner is live on home' : 'Banner hidden') });
  return (
    <>
      <PageHeader title="Home banners" subtitle="Promotional carousel on the customer home page" back="/admin/more" />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={150} />} empty={<EmptyState icon="images" title="No banners" />}>
        {(list) => (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((b, i) => {
              const cat = cats.data?.find((c) => c.id === b.categoryId);
              return (
                <li key={b.id}>
                  <Card padded={false} className="overflow-hidden">
                    <div className={cn('relative h-32 bg-gradient-to-br p-5 text-white transition-opacity', tones[i % 3], !b.active && 'opacity-45 grayscale')}>
                      <Icon name={cat?.icon ?? 'sparkles'} size={70} strokeWidth={1.4} className="absolute bottom-2 right-3 opacity-25" />
                      <p className="max-w-[80%] text-title font-bold">{b.title}</p>
                      <p className="mt-1 max-w-[80%] text-body-sm text-white/85">{b.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                      <p className="text-body-sm text-ink-secondary">
                        “{b.cta}” → {cat?.name ?? 'Explore'}
                      </p>
                      <Switch checked={b.active} onChange={() => toggle.mutate(b.id)} label={`${b.title} visible`} tone="success" />
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
    </>
  );
}

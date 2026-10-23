import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Avatar, Badge, Button, Chip, ChipRow, EmptyState, Icon, LinkButton, ListSkeleton, PageHeader, QueryView, SearchBar, type IconName } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { useAdminProviders } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useDebounced } from '@/hooks/useDebounced';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { ProviderStatus } from '@/types/models';

const FILTERS: (ProviderStatus | 'all')[] = ['pending', 'approved', 'suspended', 'rejected', 'all'];

function Meta({ icon, text }: { icon: IconName; text: string }) {
  return (
    <span className="flex items-center gap-1 text-caption text-ink-secondary">
      <Icon name={icon} size={13} className="text-ink-muted" />
      {text}
    </span>
  );
}

export default function AdminProviders() {
  usePageMeta({ title: 'Providers', noindex: true });
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as ProviderStatus | 'all' | null) ?? 'pending';
  const [text, setText] = useState('');
  const query = useDebounced(text);
  const q = useAdminProviders(status, query);
  const pending = useAdminProviders('pending', '');
  const approve = useApiMutation((id: string) => adminApi.setProviderStatus(id, 'approved'), { invalidate: [qk.admin.all, ['providers']], successMessage: 'Provider approved' });

  return (
    <>
      <PageHeader title="Providers" subtitle="Approvals, commission & compliance" />
      <SearchBar value={text} onChange={setText} placeholder="Search providers" className="mb-3 lg:max-w-md" />
      <ChipRow className="mb-4" wrap label="Filter by status">
        {FILTERS.map((f) => (
          <Chip key={f} label={f === 'all' ? 'All' : PROVIDER_STATUS[f].label} selected={status === f} onClick={() => setParams({ status: f }, { replace: true })} count={f === 'pending' && pending.data?.length ? pending.data.length : undefined} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={110} />} empty={<EmptyState icon="store" title={status === 'pending' ? 'No pending approvals' : 'No providers'} message={status === 'pending' ? 'New applications will appear here.' : undefined} />}>
        {(list) => (
          <ul className="grid gap-3 lg:grid-cols-2">
            {list.map((p) => {
              const s = PROVIDER_STATUS[p.status];
              const docsOk = p.documents.filter((d) => d.status !== 'missing').length;
              return (
                <li key={p.id} className="relative flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar src={p.avatar} name={p.businessName} size={46} rounded="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">
                        <Link to={`/admin/providers/${p.id}`} className="focus-ring rounded after:absolute after:inset-0 after:rounded-card">
                          {p.businessName}
                        </Link>
                      </h2>
                      <p className="text-caption capitalize text-ink-muted">
                        {p.ownerName} · {p.type} · {p.city}
                      </p>
                    </div>
                    <Badge label={s.label} tone={s.tone} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <Meta icon="document" text={`${docsOk}/${p.documents.length} docs`} />
                    <Meta icon="star" text={p.rating ? p.rating.toFixed(1) : 'New'} />
                    <Meta icon="pie" text={`${p.commissionRate}% fee`} />
                  </div>
                  {p.status === 'pending' ? (
                    <div className="relative z-10 flex gap-3">
                      <LinkButton to={`/admin/providers/${p.id}`} variant="outline" size="sm" className="flex-1">
                        Review
                      </LinkButton>
                      <Button variant="success" size="sm" leftIcon="check" className="flex-1" loading={approve.isPending && approve.variables === p.id} onClick={() => approve.mutate(p.id)}>
                        Approve
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
    </>
  );
}

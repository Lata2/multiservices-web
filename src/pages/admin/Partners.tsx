import { useState } from 'react';
import { Avatar, Badge, Button, ConfirmDialog, EmptyState, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { useAdminPartners } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { DeliveryPartner, ProviderStatus } from '@/types/models';
import { formatDate } from '@/utils/format';

export default function AdminPartners() {
  usePageMeta({ title: 'Delivery partners', noindex: true });
  const q = useAdminPartners();
  const [pending, setPending] = useState<{ p: DeliveryPartner; status: ProviderStatus } | null>(null);
  const update = useApiMutation(() => adminApi.setPartnerStatus(pending!.p.id, pending!.status), {
    invalidate: [qk.admin.all, qk.delivery.all],
    successMessage: (p) => `${p.name} ${PROVIDER_STATUS[p.status].label.toLowerCase()}`,
    onSuccess: () => setPending(null),
  });
  const verb = pending?.status === 'approved' ? (pending.p.status === 'pending' ? 'Approve' : 'Reinstate') : pending?.status === 'rejected' ? 'Reject' : 'Suspend';

  return (
    <>
      <PageHeader title="Delivery partners" subtitle={q.data ? `${q.data.filter((p) => p.online).length} online now` : undefined} back="/admin/more" />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={140} />} empty={<EmptyState icon="bike" title="No partners yet" />}>
        {(list) => (
          <ul className="grid gap-3 lg:grid-cols-2">
            {list.map((p) => {
              const s = PROVIDER_STATUS[p.status];
              return (
                <li key={p.id} className="flex flex-col gap-3 rounded-card border border-border/80 bg-surface p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="relative">
                      <Avatar src={p.avatar} name={p.name} size={46} />
                      {p.online ? <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success-500" aria-label="Online" /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-caption capitalize text-ink-muted">
                        {p.vehicleType} · {p.vehicleNumber} · {p.city}
                      </p>
                    </div>
                    <Badge label={s.label} tone={s.tone} />
                  </div>
                  <p className="text-caption text-ink-secondary">
                    Licence {p.licenseNumber} · {p.completedTasks} tasks · {p.rating ? `${p.rating}★` : 'No rating'} · joined {formatDate(p.joinedAt)}
                  </p>
                  {p.status === 'pending' ? (
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setPending({ p, status: 'rejected' })}>
                        Reject
                      </Button>
                      <Button variant="success" size="sm" leftIcon="check" className="flex-1" onClick={() => setPending({ p, status: 'approved' })}>
                        Approve
                      </Button>
                    </div>
                  ) : p.status === 'approved' ? (
                    <Button variant="outline" size="sm" onClick={() => setPending({ p, status: 'suspended' })}>
                      Suspend
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => setPending({ p, status: 'approved' })}>
                      Reinstate
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
      <ConfirmDialog open={!!pending} tone={pending?.status === 'approved' ? 'success' : 'danger'} title={`${verb} ${pending?.p.name}?`} message="The partner will be notified immediately." confirmLabel={verb} loading={update.isPending} onCancel={() => setPending(null)} onConfirm={() => update.mutate()} />
    </>
  );
}

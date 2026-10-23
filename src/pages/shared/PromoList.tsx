import { useState } from 'react';
import { Link } from 'react-router';
import { PromoCard } from '@/components/domain';
import { Badge, ConfirmDialog, EmptyState, IconButton, LinkButton, ListSkeleton, PageHeader, QueryView, Switch } from '@/components/ui';
import { useAdminPromos, useProviderPromos } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { adminApi, providerApi } from '@/services/api';
import type { PromoCode } from '@/types/models';

function stripPromo(p: PromoCode): Omit<PromoCode, 'id' | 'usageCount' | 'providerId'> {
  const { id: _id, usageCount: _u, providerId: _p, ...rest } = p;
  void _id;
  void _u;
  void _p;
  return rest;
}

/** Promo code management — providers manage their own codes, admins manage all. */
export default function PromoList() {
  usePageMeta({ title: 'Promo codes', noindex: true });
  const { role, base } = useRoleBase();
  const isAdmin = role === 'admin';
  const providerQ = useProviderPromos(!isAdmin);
  const adminQ = useAdminPromos(isAdmin);
  const q = isAdmin ? adminQ : providerQ;
  const [toDelete, setToDelete] = useState<PromoCode | null>(null);
  const invalidate = [qk.provider_.promos, qk.admin.promos, ['offers']];
  const toggle = useApiMutation((p: PromoCode) => (isAdmin ? adminApi.togglePromo(p.id) : providerApi.savePromo({ ...stripPromo(p), active: !p.active }, p.id)), { invalidate, successMessage: (p) => (p.active ? 'Code activated' : 'Code paused') });
  const remove = useApiMutation((id: string) => (isAdmin ? adminApi.deletePromo(id) : providerApi.deletePromo(id)), { invalidate, successMessage: 'Promo deleted', onSuccess: () => setToDelete(null) });

  return (
    <>
      <PageHeader title="Promo codes" subtitle={isAdmin ? 'Platform & provider campaigns' : 'Discounts for your customers'} back={isAdmin ? '/admin/more' : '/provider/account'} actions={<LinkButton to={`${base}/promos/new`} size="sm" leftIcon="plus">New code</LinkButton>} />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={130} />} empty={<EmptyState icon="tags" title="No promo codes" message="Create a code to attract more bookings." actionLabel="Create code" actionTo={`${base}/promos/new`} />}>
        {(list) => (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => {
              const expired = new Date(p.expiresAt).getTime() < Date.now();
              return (
                <li key={p.id} className="flex flex-col gap-2">
                  <Link to={`${base}/promos/${p.id}/edit`} className="focus-ring rounded-card" aria-label={`Edit ${p.code}`}>
                    <PromoCard promo={p} />
                  </Link>
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={p.active && !expired} disabled={expired || toggle.isPending} onChange={() => toggle.mutate(p)} label={`${p.code} active`} tone="success" />
                      <Badge label={expired ? 'Expired' : p.active ? 'Active' : 'Paused'} tone={expired ? 'danger' : p.active ? 'success' : 'neutral'} />
                      {isAdmin ? <Badge label={p.providerId ? 'Provider' : 'Platform'} tone="primary" /> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-caption text-ink-muted">
                        Used {p.usageCount}/{p.usageLimit}
                      </span>
                      <IconButton icon="trash" label={`Delete ${p.code}`} variant="plain" size="sm" iconClassName="text-danger-500" onClick={() => setToDelete(p)} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </QueryView>
      <ConfirmDialog open={!!toDelete} tone="danger" icon="trash" title={`Delete ${toDelete?.code}?`} message="Customers will no longer be able to use this code." confirmLabel="Delete" loading={remove.isPending} onCancel={() => setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} />
    </>
  );
}

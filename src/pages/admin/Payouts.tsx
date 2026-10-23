import { useState } from 'react';
import { Badge, Button, Card, Chip, ChipRow, ConfirmDialog, EmptyState, Input, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { PAYOUT_STATUS } from '@/constants/status';
import { useAdminPayouts } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { Payout, PayoutStatus } from '@/types/models';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function AdminPayouts() {
  usePageMeta({ title: 'Payouts', noindex: true });
  const q = useAdminPayouts();
  const [filter, setFilter] = useState<PayoutStatus | 'all'>('requested');
  const [action, setAction] = useState<{ p: Payout; status: 'paid' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');
  const process = useApiMutation(() => adminApi.processPayout(action!.p.id, action!.status, note || undefined), {
    invalidate: [qk.admin.all, qk.provider_.all, qk.delivery.all],
    successMessage: (p) => (p.status === 'paid' ? `${formatMoney(p.amount)} marked as paid` : 'Payout rejected'),
    onSuccess: () => (setAction(null), setNote('')),
  });
  const list = (q.data ?? []).filter((p) => filter === 'all' || p.status === filter);
  const pendingTotal = (q.data ?? []).filter((p) => p.status === 'requested').reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <PageHeader title="Payouts" subtitle={`${formatMoney(pendingTotal)} awaiting approval`} back="/admin/more" />
      <ChipRow className="mb-4" label="Filter payouts">
        {(['requested', 'paid', 'rejected', 'all'] as const).map((f) => (
          <Chip key={f} label={f === 'all' ? 'All' : PAYOUT_STATUS[f].label} selected={filter === f} onClick={() => setFilter(f)} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={120} />}>
        {() =>
          list.length ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {list.map((p) => (
                <li key={p.id}>
                  <Card className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{p.payeeName}</p>
                        <p className="text-caption capitalize text-ink-muted">
                          {p.payeeRole} · requested {formatDateTime(p.requestedAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-h3 font-bold">{formatMoney(p.amount)}</p>
                        <Badge label={PAYOUT_STATUS[p.status].label} tone={PAYOUT_STATUS[p.status].tone} />
                      </div>
                    </div>
                    {p.status === 'requested' ? (
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setAction({ p, status: 'rejected' })}>
                          Reject
                        </Button>
                        <Button variant="success" size="sm" leftIcon="check" className="flex-1" onClick={() => setAction({ p, status: 'paid' })}>
                          Mark as paid
                        </Button>
                      </div>
                    ) : p.note ? (
                      <p className="text-caption text-danger-600">Note: {p.note}</p>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="cash" title="No payouts here" message="Withdrawal requests from providers and partners appear here." />
          )
        }
      </QueryView>
      <ConfirmDialog
        open={!!action}
        tone={action?.status === 'paid' ? 'success' : 'danger'}
        icon={action?.status === 'paid' ? 'cash' : 'x-circle'}
        title={action?.status === 'paid' ? `Pay ${action ? formatMoney(action.p.amount) : ''}?` : 'Reject payout?'}
        message={action?.status === 'paid' ? `Confirm the bank transfer to ${action?.p.payeeName} has been initiated.` : 'The amount returns to their available balance.'}
        confirmLabel={action?.status === 'paid' ? 'Mark as paid' : 'Reject'}
        loading={process.isPending}
        onCancel={() => setAction(null)}
        onConfirm={() => process.mutate()}
      >
        {action?.status === 'rejected' ? <Input aria-label="Reason" placeholder="Reason for rejection" value={note} onValueChange={setNote} /> : null}
      </ConfirmDialog>
    </>
  );
}

import { ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { EarningsView } from '@/features/EarningsView';
import { useDeliveryEarnings } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { deliveryApi } from '@/services/api';

export default function DeliveryEarnings() {
  usePageMeta({ title: 'Earnings & payouts', noindex: true });
  const q = useDeliveryEarnings();
  const payout = useApiMutation((v: { amount: number; done: () => void }) => deliveryApi.requestPayout(v.amount), { invalidate: [qk.delivery.all], successMessage: 'Payout requested', onSuccess: (_, v) => v.done() });
  return (
    <>
      <PageHeader title="Earnings" />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={160} />}>
        {(d) => <EarningsView summary={d.summary} payouts={d.payouts} requesting={payout.isPending} onRequestPayout={(amount, done) => payout.mutate({ amount, done })} bankLabel="your linked bank account" />}
      </QueryView>
    </>
  );
}

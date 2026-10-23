import { TaskCard } from '@/components/domain';
import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '@/components/ui';
import { useDeliveryHistory } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatMoney } from '@/utils/format';

export default function DeliveryHistory() {
  usePageMeta({ title: 'Task history', noindex: true });
  const q = useDeliveryHistory();
  const total = q.data?.filter((t) => t.status === 'delivered').reduce((s, t) => s + t.fee, 0) ?? 0;
  return (
    <>
      <PageHeader title="Task history" subtitle={q.data ? `${q.data.length} tasks · ${formatMoney(total)} earned` : undefined} />
      {q.isPending ? (
        <ListSkeleton rows={4} height={150} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : q.data.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {q.data.map((t) => (
            <TaskCard key={t.id} task={t} to={`/delivery/tasks/${t.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState icon="clock" title="No completed tasks" message="Delivered tasks will be listed here." />
      )}
    </>
  );
}

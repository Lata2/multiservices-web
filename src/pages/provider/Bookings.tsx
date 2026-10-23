import { useSearchParams } from 'react-router';
import { BookingCard } from '@/components/domain';
import { Chip, ChipRow, EmptyState, ErrorState, ListSkeleton, PageHeader } from '@/components/ui';
import { RequestActions } from '@/features/RequestActions';
import { useProviderBookings } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';

type Tab = 'requests' | 'upcoming' | 'past' | 'cancelled';
const TABS: { value: Tab; label: string; empty: string }[] = [
  { value: 'requests', label: 'Requests', empty: 'No pending requests right now.' },
  { value: 'upcoming', label: 'Upcoming', empty: 'Accepted jobs will appear here.' },
  { value: 'past', label: 'Completed', empty: 'Completed jobs will appear here.' },
  { value: 'cancelled', label: 'Cancelled', empty: 'No cancelled or declined bookings.' },
];

export default function ProviderBookings() {
  usePageMeta({ title: 'Bookings', noindex: true });
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.value === params.get('tab'))?.value ?? 'requests') as Tab;
  const q = useProviderBookings(tab);
  const requests = useProviderBookings('requests');
  return (
    <>
      <PageHeader title="Bookings" />
      <ChipRow className="mb-4" label="Booking status">
        {TABS.map((t) => (
          <Chip key={t.value} label={t.label} selected={tab === t.value} onClick={() => setParams(t.value === 'requests' ? {} : { tab: t.value }, { replace: true })} count={t.value === 'requests' && requests.data?.length ? requests.data.length : undefined} />
        ))}
      </ChipRow>
      {q.isPending ? (
        <ListSkeleton rows={3} height={170} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : q.data.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {q.data.map((b) => (
            <BookingCard key={b.id} booking={b} perspective="provider" to={`/provider/bookings/${b.id}`} footer={tab === 'requests' ? <RequestActions booking={b} compact /> : undefined} />
          ))}
        </div>
      ) : (
        <EmptyState icon="calendar-x" title="Nothing here" message={TABS.find((t) => t.value === tab)?.empty} />
      )}
    </>
  );
}

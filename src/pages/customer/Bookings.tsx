import { useSearchParams } from 'react-router';
import { BookingCard } from '@/components/domain';
import { EmptyState, ErrorState, IconButton, ListSkeleton, PageHeader, SegmentedTabs } from '@/components/ui';
import { useMyBookings } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { BookingTab } from '@/services/api';
import { useNavigate } from 'react-router';

type Tab = Exclude<BookingTab, 'all'>;
const EMPTY: Record<Tab, { title: string; message: string }> = {
  upcoming: { title: 'No upcoming bookings', message: 'Book a service and it will appear here.' },
  past: { title: 'No completed bookings', message: 'Your service history will show up here.' },
  cancelled: { title: 'No cancellations', message: 'Nothing cancelled so far.' },
};

export default function Bookings() {
  usePageMeta({ title: 'My bookings', noindex: true });
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const raw = params.get('tab');
  const tab: Tab = raw === 'past' || raw === 'cancelled' ? raw : 'upcoming';
  const q = useMyBookings(tab);

  return (
    <>
      <PageHeader title="My bookings" actions={<IconButton icon="chats" label="Messages" variant="plain" onClick={() => navigate('/account/messages')} />} />
      <SegmentedTabs
        className="mb-4 lg:max-w-md"
        value={tab}
        onChange={(t) => setParams(t === 'upcoming' ? {} : { tab: t }, { replace: true })}
        label="Booking status"
        tabs={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
      />
      {q.isPending ? (
        <ListSkeleton rows={3} height={170} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : q.data.length ? (
        <div className="grid gap-3 xl:grid-cols-2">
          {q.data.map((b) => (
            <BookingCard key={b.id} booking={b} to={`/bookings/${b.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState icon="calendar-x" title={EMPTY[tab].title} message={EMPTY[tab].message} actionLabel={tab === 'upcoming' ? 'Book a service' : undefined} actionTo="/explore" />
      )}
    </>
  );
}

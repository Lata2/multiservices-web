import { useParams } from 'react-router';
import { PageBody } from '@/components/layout/SiteLayout';
import { Card, Icon, KeyValue, LinkButton, Skeleton } from '@/components/ui';
import { paymentLabel } from '@/constants/status';
import { useBooking } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDay, formatMoney, formatTime } from '@/utils/format';

export default function BookingSuccess() {
  usePageMeta({ title: 'Booking placed', noindex: true });
  const { id = '' } = useParams();
  const q = useBooking(id);
  const b = q.data;
  return (
    <PageBody narrow className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <span className="flex h-28 w-28 animate-check-pop items-center justify-center rounded-full bg-success-50">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-500 text-white shadow-md">
          <Icon name="check" size={44} strokeWidth={3} />
        </span>
      </span>
      <h1 className="mt-6 text-h1 font-bold">Booking placed!</h1>
      <p className="mt-2 max-w-sm text-ink-secondary" aria-live="polite">
        {b ? `${b.providerName} will confirm your booking shortly. We’ll notify you at every step.` : 'Fetching your booking details…'}
      </p>
      <Card elevation="md" className="mt-8 w-full max-w-md text-left">
        {b ? (
          <dl>
            <KeyValue label="Booking ID" value={`#${b.code}`} />
            <KeyValue label="Date & time" value={`${formatDay(b.scheduledDate)}, ${formatTime(b.slot)}`} />
            <KeyValue label="Payment" value={`${paymentLabel(b.payment.method)} · ${b.payment.status === 'paid' ? 'Paid' : 'Pay after service'}`} />
            <KeyValue label="Amount" value={formatMoney(b.pricing.total)} bold />
          </dl>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        )}
      </Card>
      <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <LinkButton to={`/bookings/${id}`} size="lg" className="flex-1" replace>
          Track booking
        </LinkButton>
        <LinkButton to="/" variant="outline" size="lg" className="flex-1">
          Back to home
        </LinkButton>
      </div>
    </PageBody>
  );
}

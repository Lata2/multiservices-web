import { useState } from 'react';
import { useParams } from 'react-router';
import { BookingStatusBadge, BookingTimeline, PriceSummary } from '@/components/domain';
import { ActionBar, Button, Card, ConfirmDialog, Divider, ErrorState, Input, KeyValue, ListItem, LoadingState, PageHeader, SectionHeader } from '@/components/ui';
import { paymentLabel } from '@/constants/status';
import { useBooking } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { bookingsApi } from '@/services/api';
import { formatDateTime, formatDay, formatMoney, formatTime } from '@/utils/format';

export default function AdminBookingDetail() {
  const { id = '' } = useParams();
  const q = useBooking(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const cancel = useApiMutation(() => bookingsApi.cancel(id, reason || 'Cancelled by admin'), { invalidate: [qk.bookings.all, qk.admin.all], successMessage: 'Booking cancelled & refunded', onSuccess: () => setCancelOpen(false) });
  usePageMeta({ title: q.data ? `Booking #${q.data.code}` : 'Booking', noindex: true });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <><PageHeader title="Booking" back="/admin/bookings" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></>;
  const b = q.data;
  const cancellable = ['pending', 'confirmed', 'on_the_way'].includes(b.status);
  const action = cancellable ? (
    <Button variant="danger" leftIcon="x-circle" fullWidth onClick={() => setCancelOpen(true)}>
      Cancel & refund
    </Button>
  ) : null;

  return (
    <>
      <PageHeader title={`Booking #${b.code}`} subtitle={`Created ${formatDateTime(b.createdAt)}`} back="/admin/bookings" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-title font-semibold">
                {formatDay(b.scheduledDate)} · {formatTime(b.slot)}
              </p>
              <BookingStatusBadge status={b.status} size="md" />
            </div>
            {b.cancelReason ? <p className="text-body-sm text-danger-600">Reason: {b.cancelReason}</p> : null}
          </Card>
          <section>
            <SectionHeader title="Parties" />
            <Card className="py-1">
              <ListItem icon="user" title={b.customerName} subtitle={`Customer · ${b.customerPhone}`} to={`/admin/users/${b.customerId}`} />
              <Divider className="ml-14" />
              <ListItem icon="store" title={b.providerName} subtitle="Provider" to={`/admin/providers/${b.providerId}`} />
              <Divider className="ml-14" />
              <ListItem icon="pin" title={b.address.label} subtitle={`${b.address.line1}, ${b.address.city} ${b.address.pincode}`} chevron={false} />
            </Card>
          </section>
          <section>
            <SectionHeader title="Items" />
            <Card>
              <dl>
                {b.items.map((it) => (
                  <KeyValue key={it.serviceId} label={`${it.title} × ${it.quantity}`} value={formatMoney(it.unitPrice * it.quantity)} />
                ))}
              </dl>
              {b.notes ? <p className="mt-2 rounded-lg bg-surface-muted p-3 text-body-sm">Customer note: {b.notes}</p> : null}
            </Card>
          </section>
        </div>
        <aside className="flex flex-col gap-6">
          <section>
            <SectionHeader title="Payment" />
            <Card>
              <dl>
                <KeyValue label="Method" value={paymentLabel(b.payment.method)} />
                <KeyValue label="Status" value={<span className="capitalize">{b.payment.status}</span>} />
                {b.payment.transactionId ? <KeyValue label="Transaction" value={b.payment.transactionId} /> : null}
              </dl>
              <Divider className="my-2" />
              <PriceSummary pricing={b.pricing} promoCode={b.promoCode} />
            </Card>
          </section>
          <section>
            <SectionHeader title="Timeline" />
            <Card>
              <BookingTimeline booking={b} />
            </Card>
          </section>
          {action ? <Card className="hidden lg:block">{action}</Card> : null}
        </aside>
      </div>
      {action ? (
        <div className="lg:hidden">
          <ActionBar>{action}</ActionBar>
        </div>
      ) : null}
      <ConfirmDialog open={cancelOpen} tone="danger" icon="shield" title="Cancel as admin?" message="Both customer and provider will be notified. Paid amounts are refunded to the customer’s wallet." confirmLabel="Cancel booking" loading={cancel.isPending} onCancel={() => setCancelOpen(false)} onConfirm={() => cancel.mutate()}>
        <Input aria-label="Reason" placeholder="Reason (visible to both parties)" value={reason} onValueChange={setReason} />
      </ConfirmDialog>
    </>
  );
}

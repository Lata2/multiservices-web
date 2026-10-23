import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { BookingStatusBadge, BookingTimeline, PriceSummary, ReviewCard, SchedulePicker, ServiceThumb, StopRow } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, Avatar, Button, Card, Chip, ConfirmDialog, Divider, ErrorState, Icon, IconButton, Input, KeyValue, LinkButton, LoadingState, Modal, PageHeader, SectionHeader } from '@/components/ui';
import { CANCEL_REASONS, paymentLabel, TASK_STATUS } from '@/constants/status';
import { useBooking, useDeliveryForBooking, useReview } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { bookingsApi, chatApi } from '@/services/api';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';
import { formatDateTime, formatDay, formatMoney, formatTime } from '@/utils/format';

export default function BookingDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const q = useBooking(id);
  const review = useReview(q.data?.reviewId);
  const task = useDeliveryForBooking(id);
  const setCart = useCartStore((s) => s.setAll);
  usePageMeta({ title: q.data ? `Booking #${q.data.code}` : 'Booking', noindex: true });

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [otherReason, setOtherReason] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<string | null>(null);

  const invalidate = [qk.bookings.all, qk.notifications, qk.wallet];
  const cancel = useApiMutation(() => bookingsApi.cancel(id, reason === 'Other' ? otherReason || 'Other' : reason), { invalidate, successMessage: 'Booking cancelled', onSuccess: () => setCancelOpen(false) });
  const reschedule = useApiMutation(() => bookingsApi.reschedule(id, newDate!, newSlot!), { invalidate: [...invalidate, ['slots']], successMessage: 'Booking rescheduled', onSuccess: () => setRescheduleOpen(false) });
  const chat = useApiMutation(() => chatApi.open(q.data!.providerId, id), { invalidate: [qk.chat.threads], onSuccess: (t) => navigate(`/account/messages/${t.id}`) });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <PageBody><PageHeader title="Booking" back="/bookings" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></PageBody>;
  const b = q.data;
  const canModify = ['pending', 'confirmed'].includes(b.status);
  const showOtp = ['confirmed', 'on_the_way'].includes(b.status);
  const isFinal = ['completed', 'cancelled', 'rejected'].includes(b.status);

  const rebook = () => {
    setCart(b.providerId, b.items.map((it) => ({ serviceId: it.serviceId, quantity: it.quantity })));
    toast.success('Services added to cart');
    navigate('/cart');
  };

  const actions = canModify ? (
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(true)}>
        Cancel booking
      </Button>
      <Button variant="secondary" leftIcon="calendar" className="flex-1" disabled={b.rescheduleCount >= 2} onClick={() => (setNewDate(b.scheduledDate), setNewSlot(null), setRescheduleOpen(true))}>
        Reschedule
      </Button>
    </div>
  ) : b.status === 'completed' && !b.reviewId ? (
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1" onClick={rebook}>
        Book again
      </Button>
      <LinkButton to={`/bookings/${b.id}/review`} leftIcon="star" className="flex-1">
        Rate service
      </LinkButton>
    </div>
  ) : isFinal ? (
    <Button leftIcon="refresh" fullWidth onClick={rebook}>
      Book again
    </Button>
  ) : null;

  return (
    <PageBody>
      <PageHeader
        title={`Booking #${b.code}`}
        subtitle={`Placed ${formatDateTime(b.createdAt)}`}
        back="/bookings"
        actions={<IconButton icon="help" label="Get help with this booking" variant="plain" onClick={() => navigate(`/account/support/new?bookingId=${b.code}&subject=${encodeURIComponent(`Help with booking ${b.code}`)}`)} />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-title font-semibold">{formatDay(b.scheduledDate)}</p>
              <BookingStatusBadge status={b.status} size="md" />
            </div>
            <p className="text-ink-secondary">
              Arrival at {formatTime(b.slot)}
              {b.rescheduleCount ? ` · rescheduled ${b.rescheduleCount}×` : ''}
            </p>
            {showOtp ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-primary-300 bg-primary-50 p-4">
                <div>
                  <p className="text-body-sm font-semibold text-primary-700">Start code</p>
                  <p className="text-caption text-ink-secondary">Share with the professional when they arrive to start the job.</p>
                </div>
                <p className="text-h1 font-extrabold tracking-[0.3em] text-primary-700" aria-label={`Start code ${b.startOtp.split('').join(' ')}`}>
                  {b.startOtp}
                </p>
              </div>
            ) : null}
            {b.status === 'cancelled' && b.cancelReason ? (
              <div className="rounded-lg bg-danger-50 p-3">
                <p className="text-body-sm text-danger-700">Reason: {b.cancelReason}</p>
                {b.payment.status === 'refunded' ? (
                  <p className="mt-1 text-caption text-ink-secondary">
                    Refund of {formatMoney(b.pricing.total)} initiated to your {b.payment.method === 'wallet' ? 'Servio wallet' : 'original payment method'}.
                  </p>
                ) : null}
              </div>
            ) : null}
          </Card>

          <section>
            <SectionHeader title="Provider" />
            <Card className="flex items-center gap-3">
              <Avatar name={b.providerName} size={46} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.providerName}</p>
                <Link to={`/professionals/${b.providerId}`} className="focus-ring rounded text-caption font-semibold text-primary-600 hover:underline">
                  View profile
                </Link>
              </div>
              {!isFinal ? (
                <>
                  <IconButton icon="chat" label="Chat with provider" onClick={() => chat.mutate()} disabled={chat.isPending} />
                  <IconButton icon="phone" label="Call provider" onClick={() => toast.info('Calls connect through a masked number once telephony is live.')} />
                </>
              ) : null}
            </Card>
          </section>

          {task.data ? (
            <section>
              <SectionHeader title="Pickup & delivery" />
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold capitalize">
                    {task.data.type} · #{task.data.id.slice(-5).toUpperCase()}
                  </p>
                  <span className="text-caption font-semibold text-primary-600">{TASK_STATUS[task.data.status].label}</span>
                </div>
                <StopRow kind="from" name={task.data.pickup.name} address={task.data.pickup.address} />
                <StopRow kind="to" name={task.data.drop.name} address={task.data.drop.address} />
                {task.data.partner ? (
                  <div className="flex items-center gap-3 rounded-lg bg-surface-muted p-3">
                    <Avatar src={task.data.partner.avatar} name={task.data.partner.name} size={36} />
                    <div>
                      <p className="text-body-sm font-semibold">{task.data.partner.name}</p>
                      <p className="text-caption text-ink-muted">
                        {task.data.partner.vehicleNumber} · ★ {task.data.partner.rating}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-caption text-ink-muted">A delivery partner will be assigned shortly.</p>
                )}
                {task.data.status === 'picked_up' ? (
                  <div className="flex items-center justify-between rounded-lg bg-success-50 p-3">
                    <span className="text-body-sm font-semibold text-success-700">Delivery code</span>
                    <span className="text-h3 font-bold tracking-[0.25em] text-success-700">{task.data.otp}</span>
                  </div>
                ) : null}
              </Card>
            </section>
          ) : null}

          <section>
            <SectionHeader title="Services" />
            <Card className="flex flex-col gap-3">
              {b.items.map((it) => (
                <Link key={it.serviceId} to={`/service/${it.serviceId}`} className="focus-ring flex items-center gap-3 rounded-lg">
                  <ServiceThumb categoryId={it.categoryId} image={it.image} className="h-11 w-11 rounded-lg" iconSize={18} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-body-sm font-semibold">{it.title}</span>
                    <span className="text-caption text-ink-muted">
                      {formatMoney(it.unitPrice)} × {it.quantity}
                    </span>
                  </span>
                  <span className="font-semibold">{formatMoney(it.unitPrice * it.quantity)}</span>
                </Link>
              ))}
              {b.notes ? (
                <div className="rounded-lg bg-surface-muted p-3">
                  <p className="text-caption text-ink-muted">Your instructions</p>
                  <p className="text-body-sm">{b.notes}</p>
                </div>
              ) : null}
            </Card>
          </section>

          <section>
            <SectionHeader title="Address" />
            <Card className="flex gap-3">
              <Icon name="pin" size={19} className="text-primary-500" />
              <div>
                <p className="font-semibold">{b.address.label}</p>
                <p className="text-body-sm text-ink-secondary">
                  {b.address.line1}
                  {b.address.line2 ? `, ${b.address.line2}` : ''}, {b.address.city} {b.address.pincode}
                </p>
              </div>
            </Card>
          </section>

          {review.data ? (
            <section>
              <SectionHeader title="Your review" />
              <Card className="py-0">
                <ReviewCard review={review.data} />
              </Card>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <section>
            <SectionHeader title="Status timeline" />
            <Card>
              <BookingTimeline booking={b} />
            </Card>
          </section>
          <section>
            <SectionHeader title="Payment" action={b.status === 'completed' ? 'View invoice' : undefined} to={`/bookings/${b.id}/invoice`} />
            <Card>
              <dl>
                <KeyValue label="Method" value={paymentLabel(b.payment.method)} />
                <KeyValue label="Status" value={b.payment.status === 'paid' ? 'Paid' : b.payment.status === 'refunded' ? 'Refunded' : 'Pay after service'} tone={b.payment.status === 'paid' ? 'success' : undefined} />
                {b.payment.transactionId ? <KeyValue label="Transaction ID" value={b.payment.transactionId} /> : null}
              </dl>
              <Divider className="my-2" />
              <PriceSummary pricing={b.pricing} promoCode={b.promoCode} />
            </Card>
          </section>
          {actions ? (
            <Card elevation="md" className="hidden lg:block">
              {actions}
            </Card>
          ) : null}
        </aside>
      </div>
      {actions ? (
        <div className="lg:hidden">
          <ActionBar>{actions}</ActionBar>
        </div>
      ) : null}

      <ConfirmDialog
        open={cancelOpen}
        tone="danger"
        icon="x-circle"
        title="Cancel this booking?"
        message={b.payment.status === 'paid' ? `${formatMoney(b.pricing.total)} will be refunded.` : 'No charges apply.'}
        confirmLabel="Cancel booking"
        cancelLabel="Keep it"
        loading={cancel.isPending}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => cancel.mutate()}
      >
        <p className="mb-2 text-body-sm font-medium text-ink-secondary">Reason</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cancellation reason">
          {CANCEL_REASONS.map((r) => (
            <Chip key={r} label={r} selected={reason === r} onClick={() => setReason(r)} />
          ))}
        </div>
        {reason === 'Other' ? <Input containerClassName="mt-3" aria-label="Tell us more" placeholder="Tell us more (optional)" value={otherReason} onValueChange={setOtherReason} /> : null}
      </ConfirmDialog>

      <Modal
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        size="lg"
        title="Reschedule booking"
        subtitle={`${2 - b.rescheduleCount} reschedule${2 - b.rescheduleCount === 1 ? '' : 's'} left · free of charge`}
        footer={
          <Button fullWidth disabled={!newDate || !newSlot} loading={reschedule.isPending} onClick={() => reschedule.mutate()}>
            Confirm new slot
          </Button>
        }
      >
        <SchedulePicker providerId={b.providerId} date={newDate} slot={newSlot} onChange={(d, s) => (setNewDate(d), setNewSlot(s))} />
      </Modal>
    </PageBody>
  );
}

import { useState } from 'react';
import { useParams } from 'react-router';
import { BookingStatusBadge, BookingTimeline, PriceSummary, ServiceThumb, StopRow } from '@/components/domain';
import { ActionBar, Avatar, Button, Card, Chip, ConfirmDialog, Divider, ErrorState, Icon, IconButton, Input, KeyValue, LoadingState, OtpInput, PageHeader, SectionHeader } from '@/components/ui';
import { paymentLabel, TASK_STATUS } from '@/constants/status';
import { RequestActions } from '@/features/RequestActions';
import { useBooking, useDeliveryForBooking, useProviderProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { bookingsApi, providerNet } from '@/services/api';
import type { BookingStatus } from '@/types/models';
import { formatDay, formatDuration, formatMoney, formatTime } from '@/utils/format';
import { callPhone, openDirections } from '@/utils/linking';

export default function ProviderBookingDetail() {
  const { id = '' } = useParams();
  const q = useBooking(id);
  const me = useProviderProfile();
  const task = useDeliveryForBooking(id);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  usePageMeta({ title: q.data ? `Job #${q.data.code}` : 'Job details', noindex: true });

  const invalidate = [qk.bookings.all, qk.provider_.all];
  const advance = useApiMutation((v: { status: BookingStatus; otp?: string }) => bookingsApi.updateStatus(id, v.status, { otp: v.otp }), {
    invalidate,
    silentError: true,
    successMessage: (b) => (b.status === 'completed' ? 'Job completed 🎉' : b.status === 'in_progress' ? 'Job started' : 'Status updated'),
    onSuccess: (_b, v) => {
      if (v.status !== 'in_progress') return;
      setOtpOpen(false);
      setOtp('');
    },
    onError: (e) => setOtpError(e.message),
  });
  const collect = useApiMutation(() => bookingsApi.markPaid(id), { invalidate, successMessage: 'Cash payment recorded' });
  const cancel = useApiMutation(() => bookingsApi.cancel(id, cancelReason || 'Provider unavailable'), { invalidate, successMessage: 'Booking cancelled', onSuccess: () => setCancelOpen(false) });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <><PageHeader title="Job details" back="/provider/bookings" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></>;
  const b = q.data;
  const rate = me.data?.commissionRate ?? 15;
  const net = providerNet(b, rate);
  const commission = b.pricing.subtotal - b.pricing.discount + b.pricing.visitingCharge - net;
  const fullAddress = `${b.address.line1}${b.address.line2 ? `, ${b.address.line2}` : ''}, ${b.address.city} ${b.address.pincode}`;

  const actions =
    b.status === 'pending' ? (
      <RequestActions booking={b} />
    ) : b.status === 'confirmed' ? (
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(true)}>
          Cancel job
        </Button>
        <Button leftIcon="navigate" className="flex-[2]" loading={advance.isPending} onClick={() => advance.mutate({ status: 'on_the_way' })}>
          I’m on my way
        </Button>
      </div>
    ) : b.status === 'on_the_way' ? (
      <Button leftIcon="play" size="lg" fullWidth onClick={() => (setOtpError(null), setOtpOpen(true))}>
        Start job (enter code)
      </Button>
    ) : b.status === 'in_progress' ? (
      <div className="flex gap-3">
        {b.payment.status !== 'paid' ? (
          <Button variant="outline" className="flex-1" loading={collect.isPending} onClick={() => collect.mutate()}>
            Cash received
          </Button>
        ) : null}
        <Button variant="success" leftIcon="check-double" className="flex-[1.5]" loading={advance.isPending} onClick={() => advance.mutate({ status: 'completed' })}>
          Mark complete
        </Button>
      </div>
    ) : null;

  return (
    <>
      <PageHeader title={`Job #${b.code}`} subtitle={b.customerName} back="/provider/bookings" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-title font-semibold">
                {formatDay(b.scheduledDate)} · {formatTime(b.slot)}
              </p>
              <BookingStatusBadge status={b.status} size="md" />
            </div>
            <p className="text-body-sm text-ink-secondary">
              Est. duration {formatDuration(b.items.reduce((m, i) => m + i.durationMin, 0))} · {b.items.reduce((n, i) => n + i.quantity, 0)} unit(s)
            </p>
          </Card>

          <section>
            <SectionHeader title="Customer" />
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={b.customerName} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{b.customerName}</p>
                  <p className="text-caption text-ink-muted">{b.customerPhone}</p>
                </div>
                <IconButton icon="phone" label="Call customer" onClick={() => callPhone(b.customerPhone)} />
                <IconButton icon="navigate" label="Get directions" onClick={() => openDirections(fullAddress)} />
              </div>
              <p className="flex gap-2 rounded-lg bg-surface-muted p-3 text-body-sm text-ink-secondary">
                <Icon name="pin" size={15} className="mt-0.5" />
                <span>
                  {fullAddress}
                  {b.address.landmark ? (
                    <>
                      <br />
                      Landmark: {b.address.landmark}
                    </>
                  ) : null}
                </span>
              </p>
              {b.notes ? (
                <p className="flex gap-2 rounded-lg bg-warning-50 p-3 text-body-sm">
                  <Icon name="chat" size={15} className="mt-0.5 text-warning-600" />
                  {b.notes}
                </p>
              ) : null}
            </Card>
          </section>

          <section>
            <SectionHeader title="Services" />
            <Card className="flex flex-col gap-3">
              {b.items.map((it) => (
                <div key={it.serviceId} className="flex items-center gap-3">
                  <ServiceThumb categoryId={it.categoryId} className="h-11 w-11 rounded-lg" iconSize={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold">{it.title}</p>
                    <p className="text-caption text-ink-muted">
                      {formatMoney(it.unitPrice)} × {it.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatMoney(it.unitPrice * it.quantity)}</p>
                </div>
              ))}
            </Card>
          </section>

          {task.data ? (
            <section>
              <SectionHeader title="Pickup / delivery" />
              <Card className="flex flex-col gap-3">
                <p className="text-body-sm font-semibold">
                  {TASK_STATUS[task.data.status].label}
                  {task.data.partner ? ` · ${task.data.partner.name}` : ' · awaiting partner'}
                </p>
                <StopRow kind="from" name={task.data.pickup.name} address={task.data.pickup.address} />
                <StopRow kind="to" name={task.data.drop.name} address={task.data.drop.address} />
              </Card>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-6">
          <section>
            <SectionHeader title="Payment & earnings" />
            <Card>
              <dl>
                <KeyValue label="Method" value={paymentLabel(b.payment.method)} />
                <KeyValue label="Status" value={b.payment.status === 'paid' ? 'Paid' : b.payment.status === 'refunded' ? 'Refunded' : 'Collect on completion'} tone={b.payment.status === 'paid' ? 'success' : undefined} />
              </dl>
              <Divider className="my-2" />
              <PriceSummary pricing={b.pricing} promoCode={b.promoCode} />
              <Divider className="my-2" />
              <dl>
                <KeyValue label={`Platform commission (${rate}%)`} value={`− ${formatMoney(commission)}`} tone="danger" />
                <KeyValue label="Your earning" value={formatMoney(net)} bold />
              </dl>
            </Card>
          </section>
          <section>
            <SectionHeader title="Timeline" />
            <Card>
              <BookingTimeline booking={b} />
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
        open={otpOpen}
        icon="key"
        title="Enter start code"
        message="Ask the customer for the 4-digit code shown in their booking."
        confirmLabel="Start job"
        loading={advance.isPending}
        onCancel={() => setOtpOpen(false)}
        onConfirm={() => (otp.length === 4 ? advance.mutate({ status: 'in_progress', otp }) : setOtpError('Enter the 4-digit code'))}
      >
        <OtpInput length={4} value={otp} onChange={(v) => (setOtp(v), setOtpError(null))} error={!!otpError} label="Start code" />
        <p className={otpError ? 'mt-2 text-caption text-danger-600' : 'mt-2 text-caption text-ink-muted'} role={otpError ? 'alert' : undefined}>
          {otpError ?? `Demo code: ${b.startOtp}`}
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        tone="danger"
        icon="x-circle"
        title="Cancel this job?"
        message="Frequent cancellations lower your ranking. The customer will be refunded in full."
        confirmLabel="Cancel job"
        loading={cancel.isPending}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => cancel.mutate()}
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {['Emergency', 'Staff unavailable', 'Customer unreachable'].map((r) => (
            <Chip key={r} label={r} selected={cancelReason === r} onClick={() => setCancelReason(r)} />
          ))}
        </div>
        <Input aria-label="Note" placeholder="Add a note (optional)" value={cancelReason} onValueChange={setCancelReason} />
      </ConfirmDialog>
    </>
  );
}

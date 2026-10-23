import { useState } from 'react';
import { useParams } from 'react-router';
import { StopRow } from '@/components/domain';
import { ActionBar, Badge, Button, Card, cn, ConfirmDialog, ErrorState, Icon, IconButton, KeyValue, LoadingState, OtpInput, PageHeader, SectionHeader } from '@/components/ui';
import { TASK_STATUS } from '@/constants/status';
import { useDeliveryTask } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { deliveryApi } from '@/services/api';
import type { DeliveryStop, DeliveryTask } from '@/types/models';
import { formatDateTime, formatMoney } from '@/utils/format';
import { callPhone, openDirections } from '@/utils/linking';

const STEPS: { key: DeliveryTask['status']; label: string }[] = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'delivered', label: 'Delivered' },
];

function StopBlock({ kind, label, stop, active }: { kind: 'from' | 'to'; label: string; stop: DeliveryStop; active: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className={cn('text-caption font-semibold', active ? 'text-primary-600' : 'text-ink-muted')}>
          {label}
          {active ? ' · next stop' : ''}
        </p>
        <div className="flex gap-2">
          <IconButton icon="phone" label={`Call ${stop.name}`} onClick={() => callPhone(stop.phone)} size="sm" />
          <IconButton icon="navigate" label={`Directions to ${stop.name}`} onClick={() => openDirections(stop.address)} size="sm" />
        </div>
      </div>
      <StopRow kind={kind} name={stop.name} address={stop.address} />
    </div>
  );
}

export default function TaskDetail() {
  const { id = '' } = useParams();
  const q = useDeliveryTask(id);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const invalidate = [qk.delivery.all, qk.bookings.all];
  const accept = useApiMutation(() => deliveryApi.accept(id), { invalidate, successMessage: 'Task accepted' });
  const picked = useApiMutation(() => deliveryApi.markPickedUp(id), { invalidate, successMessage: 'Marked as picked up' });
  const delivered = useApiMutation(() => deliveryApi.markDelivered(id, otp), {
    invalidate,
    silentError: true,
    successMessage: 'Delivered! Earnings added 🎉',
    onSuccess: () => (setOtpOpen(false), setOtp('')),
    onError: (e) => setOtpError(e.message),
  });
  usePageMeta({ title: q.data ? `Task #${q.data.bookingCode}` : 'Task', noindex: true });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <><PageHeader title="Task" back="/delivery" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></>;
  const t = q.data;
  const reached = STEPS.findIndex((s) => s.key === t.status);
  const s = TASK_STATUS[t.status];

  const action =
    t.status === 'available' ? (
      <Button variant="success" size="lg" fullWidth loading={accept.isPending} onClick={() => accept.mutate()}>
        Accept task · {formatMoney(t.fee)}
      </Button>
    ) : t.status === 'accepted' ? (
      <Button leftIcon="package" size="lg" fullWidth loading={picked.isPending} onClick={() => picked.mutate()}>
        Confirm pickup
      </Button>
    ) : t.status === 'picked_up' ? (
      <Button leftIcon="check-double" variant="success" size="lg" fullWidth onClick={() => (setOtpError(null), setOtpOpen(true))}>
        Complete delivery
      </Button>
    ) : null;

  return (
    <div className="max-w-4xl">
      <PageHeader title={`${t.type === 'parts' ? 'Parts delivery' : t.type === 'drop' ? 'Drop' : 'Pickup'} · #${t.bookingCode}`} back="/delivery" actions={<Badge label={s.label} tone={s.tone} size="md" />} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {t.status !== 'available' && t.status !== 'cancelled' ? (
            <Card>
              <ol className="flex items-center" aria-label="Task progress">
                {STEPS.map((st, i) => (
                  <li key={st.key} className="flex flex-1 items-center last:flex-none" aria-current={i === reached ? 'step' : undefined}>
                    <span className="flex flex-col items-center">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-full', i <= reached ? 'bg-success-500 text-white' : 'bg-neutral-200 text-ink-muted')}>
                        <Icon name={i <= reached ? 'check' : 'circle'} size={i <= reached ? 15 : 8} strokeWidth={3} />
                      </span>
                      <span className="mt-1 text-caption font-medium">{st.label}</span>
                    </span>
                    {i < STEPS.length - 1 ? <span className={cn('mx-1 mb-5 h-0.5 flex-1', i < reached ? 'bg-success-500' : 'bg-neutral-200')} /> : null}
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
          <button type="button" onClick={() => openDirections(t.status === 'picked_up' ? t.drop.address : t.pickup.address)} className="focus-ring flex h-40 flex-col items-center justify-center rounded-card border border-border bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-info-50))] text-primary-600 hover:border-primary-300">
            <Icon name="map" size={34} />
            <span className="mt-2 text-body-sm font-medium text-ink-secondary">{t.distanceKm} km route · open in Google Maps</span>
          </button>
          <section>
            <SectionHeader title="Route" />
            <Card className="flex flex-col gap-4">
              <StopBlock kind="from" label="Pickup" stop={t.pickup} active={t.status === 'accepted' || t.status === 'available'} />
              <hr className="border-border" />
              <StopBlock kind="to" label="Drop" stop={t.drop} active={t.status === 'picked_up'} />
            </Card>
          </section>
        </div>
        <aside className="flex flex-col gap-4">
          <section>
            <SectionHeader title="Details" />
            <Card>
              <dl>
                <KeyValue label="Items" value={t.itemsSummary} />
                <KeyValue label="Scheduled" value={formatDateTime(t.scheduledFor)} />
                <KeyValue label="Distance" value={`${t.distanceKm} km`} />
                {t.codAmount ? <KeyValue label="Cash to collect" value={formatMoney(t.codAmount)} tone="danger" /> : null}
                <KeyValue label="Your earning" value={formatMoney(t.fee)} bold tone="success" />
              </dl>
            </Card>
          </section>
          {action ? (
            <Card elevation="md" className="hidden lg:block">
              {action}
            </Card>
          ) : null}
        </aside>
      </div>
      {action ? (
        <div className="lg:hidden">
          <ActionBar>{action}</ActionBar>
        </div>
      ) : null}
      <ConfirmDialog
        open={otpOpen}
        tone="success"
        icon="key"
        title="Enter delivery code"
        message="Ask the recipient for the 4-digit code shown in their app."
        confirmLabel="Confirm delivery"
        loading={delivered.isPending}
        onCancel={() => setOtpOpen(false)}
        onConfirm={() => (otp.length === 4 ? delivered.mutate() : setOtpError('Enter the 4-digit code'))}
      >
        <OtpInput length={4} value={otp} onChange={(v) => (setOtp(v), setOtpError(null))} error={!!otpError} label="Delivery code" />
        <p className={otpError ? 'mt-2 text-caption text-danger-600' : 'mt-2 text-caption text-ink-muted'} role={otpError ? 'alert' : undefined}>
          {otpError ?? `Demo code: ${t.otp}`}
        </p>
      </ConfirmDialog>
    </div>
  );
}

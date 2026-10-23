import { useState } from 'react';
import { PROVIDER_REJECT_REASONS } from '@/constants/status';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { bookingsApi } from '@/services/api';
import type { Booking } from '@/types/models';
import { Button, Chip, ConfirmDialog } from '@/components/ui';

/** Accept / decline buttons for a pending booking request (used in lists & detail). */
export function RequestActions({ booking, compact }: { booking: Booking; compact?: boolean }) {
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState(PROVIDER_REJECT_REASONS[0]);
  const invalidate = [qk.bookings.all, qk.provider_.all];
  const accept = useApiMutation(() => bookingsApi.updateStatus(booking.id, 'confirmed', { note: 'Accepted by provider' }), { invalidate, successMessage: `Booking ${booking.code} accepted` });
  const decline = useApiMutation(() => bookingsApi.updateStatus(booking.id, 'rejected', { note: reason }), { invalidate, successMessage: 'Booking declined', onSuccess: () => setDeclineOpen(false) });
  return (
    <>
      <div className="flex gap-3">
        <Button variant="outline" size={compact ? 'sm' : 'md'} className="flex-1" onClick={() => setDeclineOpen(true)}>
          Decline
        </Button>
        <Button variant="success" size={compact ? 'sm' : 'md'} leftIcon="check" className="flex-1" loading={accept.isPending} onClick={() => accept.mutate()}>
          Accept
        </Button>
      </div>
      <ConfirmDialog
        open={declineOpen}
        tone="danger"
        icon="ban"
        title="Decline this request?"
        message="The customer will be notified and refunded if they paid online."
        confirmLabel="Decline"
        loading={decline.isPending}
        onCancel={() => setDeclineOpen(false)}
        onConfirm={() => decline.mutate()}
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Reason">
          {PROVIDER_REJECT_REASONS.map((r) => (
            <Chip key={r} label={r} selected={reason === r} onClick={() => setReason(r)} />
          ))}
        </div>
      </ConfirmDialog>
    </>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { ActionBar, Button, Card, FormInput, FormTextarea, Icon, PageHeader, Select } from '@/components/ui';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { supportApi } from '@/services/api';
import { ticketSchema, type TicketForm } from '@/utils/validation';

export default function NewTicket() {
  usePageMeta({ title: 'Raise a ticket', noindex: true });
  const { base } = useRoleBase();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId') ?? '';
  const { control, handleSubmit } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: params.get('subject') ?? '', category: bookingId ? 'booking' : 'other', message: '', bookingId },
  });
  const create = useApiMutation((v: TicketForm) => supportApi.create(v), {
    invalidate: [qk.tickets.all],
    successMessage: 'Ticket raised. We’ll get back to you soon.',
    onSuccess: (t) => navigate(`${base}/support/${t.id}`, { replace: true }),
  });
  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title="Raise a ticket" back={`${base}/support`} />
      <form id="ticket-form" noValidate onSubmit={handleSubmit((v) => create.mutate(v))}>
        <Card className="flex flex-col gap-4">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                label="Category"
                required
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'booking', label: 'Booking issue', icon: 'calendar' },
                  { value: 'payment', label: 'Payment & refunds', icon: 'card' },
                  { value: 'provider', label: 'Service quality', icon: 'wrench' },
                  { value: 'account', label: 'Account & profile', icon: 'user' },
                  { value: 'other', label: 'Something else', icon: 'help' },
                ]}
              />
            )}
          />
          {bookingId ? (
            <p className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-body-sm font-medium text-primary-700">
              <Icon name="link" size={15} />
              Linked to booking {bookingId}
            </p>
          ) : null}
          <FormInput control={control} name="subject" label="Subject" placeholder="Briefly describe the issue" required maxLength={90} />
          <FormTextarea control={control} name="message" label="Details" placeholder="Tell us what happened, including dates and amounts if relevant." rows={6} required />
          <p className="flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-caption text-ink-secondary">
            <Icon name="shield-check" size={15} className="mt-px" />
            Never share card numbers, CVV or OTPs. Our team will never ask for them.
          </p>
        </Card>
      </form>
      <ActionBar>
        <Button type="submit" form="ticket-form" size="lg" fullWidth loading={create.isPending}>
          Submit ticket
        </Button>
      </ActionBar>
    </div>
  );
}

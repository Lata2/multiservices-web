import { useEffect } from 'react';
import { SchedulePicker } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, EmptyState, Icon, LinkButton, PageHeader } from '@/components/ui';
import { useProvider } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCartStore } from '@/store/cart.store';
import { formatDay, formatTime, todayKey } from '@/utils/format';
import { CheckoutSteps } from './CheckoutSteps';

export default function Schedule() {
  usePageMeta({ title: 'Choose a slot', noindex: true });
  const { providerId, date, slot, setSchedule, items } = useCartStore();
  const provider = useProvider(providerId ?? '');

  useEffect(() => {
    if (!date || date < todayKey()) setSchedule(todayKey(), null);
  }, [date, setSchedule]);

  if (!items.length || !providerId) {
    return (
      <PageBody narrow>
        <PageHeader title="Choose a slot" back="/cart" />
        <EmptyState icon="cart" title="Your cart is empty" actionLabel="Browse services" actionTo="/explore" />
      </PageBody>
    );
  }

  return (
    <PageBody narrow>
      <PageHeader title="Choose a slot" subtitle={provider.data?.provider.businessName} back="/cart" />
      <CheckoutSteps current={1} />
      <p className="mb-6 flex items-start gap-2 rounded-lg bg-info-50 p-3 text-body-sm text-ink-secondary">
        <Icon name="info" size={17} className="mt-px text-info-600" />
        Slots reflect the provider’s live availability. Your professional arrives within 30 minutes of the chosen time.
      </p>
      <SchedulePicker providerId={providerId} date={date} slot={slot} onChange={(d, s) => setSchedule(d, s)} advanceDays={provider.data?.provider.advanceBookingDays ?? 14} />
      <ActionBar>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center justify-center gap-1.5 text-body-sm font-semibold text-primary-600" aria-live="polite">
            <Icon name="calendar" size={14} />
            {date && slot ? `${formatDay(date)} at ${formatTime(slot)}` : 'Pick a date and time'}
          </p>
          <LinkButton to="/checkout" size="lg" rightIcon="arrow-right" disabled={!date || !slot} className="sm:min-w-64">
            Continue to checkout
          </LinkButton>
        </div>
      </ActionBar>
    </PageBody>
  );
}

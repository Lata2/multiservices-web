import { useMemo, useState } from 'react';
import { BOOKING_STATUS } from '@/constants/status';
import { useSlots } from '@/hooks/api';
import type { Booking, PriceBreakdown, TimeSlot } from '@/types/models';
import { addDays, formatDateTime, formatMoney, toDateKey } from '@/utils/format';
import { cn, Divider, EmptyState, Icon, KeyValue, Skeleton, type IconName } from '../ui';

/* ───────── Price summary ───────── */

export function PriceSummary({ pricing, taxPercent = 18, promoCode }: { pricing: PriceBreakdown; taxPercent?: number; promoCode?: string | null }) {
  return (
    <div>
      <dl>
        <KeyValue label="Item total" value={formatMoney(pricing.subtotal)} />
        {pricing.discount ? <KeyValue label={`Discount${promoCode ? ` (${promoCode})` : ''}`} value={`− ${formatMoney(pricing.discount)}`} tone="success" /> : null}
        <KeyValue label="Visiting charge" value={pricing.visitingCharge ? formatMoney(pricing.visitingCharge) : 'Free'} tone={pricing.visitingCharge ? undefined : 'success'} />
        <KeyValue label={`Taxes & fees (${taxPercent}% GST)`} value={formatMoney(pricing.tax)} />
        <Divider className="my-2" />
        <KeyValue label="Total" value={formatMoney(pricing.total)} bold />
      </dl>
      {pricing.discount ? (
        <p className="mt-2 flex items-center gap-2 rounded-lg bg-success-50 px-3 py-2 text-body-sm font-semibold text-success-700">
          <Icon name="smile" size={16} />
          You save {formatMoney(pricing.discount)} on this booking
        </p>
      ) : null}
    </div>
  );
}

/* ───────── Timeline ───────── */

const STEPS: Booking['status'][] = ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed'];
const stepLabel: Record<string, string> = {
  pending: 'Booking placed',
  confirmed: 'Confirmed by provider',
  on_the_way: 'Professional on the way',
  in_progress: 'Service started',
  completed: 'Service completed',
};

export function BookingTimeline({ booking }: { booking: Booking }) {
  if (booking.status === 'cancelled' || booking.status === 'rejected') {
    return (
      <ol className="flex flex-col gap-3">
        {booking.timeline.map((e, i) => {
          const bad = e.status === 'cancelled' || e.status === 'rejected';
          return (
            <li key={i} className="flex gap-3">
              <Icon name={bad ? 'x-circle' : 'check-circle'} size={19} className={bad ? 'text-danger-500' : 'text-success-500'} />
              <div>
                <p className="text-body-sm font-medium first-letter:uppercase">{e.note ?? e.status}</p>
                <p className="text-caption text-ink-muted">{formatDateTime(e.at)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }
  const reached = STEPS.indexOf(booking.status);
  return (
    <div>
      <ol>
        {STEPS.map((st, i) => {
          const done = i <= reached;
          const event = [...booking.timeline].reverse().find((e) => e.status === st);
          const isLast = i === STEPS.length - 1;
          return (
            <li key={st} className="flex gap-3" aria-current={i === reached ? 'step' : undefined}>
              <div className="flex flex-col items-center">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', done ? 'bg-success-500 text-white' : 'border-2 border-border-strong bg-surface')}>
                  {done ? <Icon name="check" size={13} strokeWidth={3} /> : null}
                </span>
                {!isLast ? <span className={cn('min-h-6 w-0.5 flex-1', i < reached ? 'bg-success-500' : 'bg-border')} /> : null}
              </div>
              <div className="flex-1 pb-4">
                <p className={cn('text-body-sm', done ? 'font-semibold' : 'text-ink-muted')}>{stepLabel[st]}</p>
                {event ? <p className="text-caption text-ink-muted">{formatDateTime(event.at)}</p> : i === reached + 1 ? <p className="text-caption font-medium text-primary-600">Up next</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {booking.timeline
        .filter((e) => e.status === 'rescheduled')
        .map((e, i) => (
          <p key={`r${i}`} className="mt-1 flex items-center gap-2 rounded-lg bg-info-50 px-3 py-2 text-caption text-ink-secondary">
            <Icon name="repeat" size={13} className="text-info-600" />
            Rescheduled · {e.note}
          </p>
        ))}
    </div>
  );
}

const bannerBg: Record<string, string> = { warning: 'bg-warning-50', primary: 'bg-primary-50', info: 'bg-info-50', highlight: 'bg-highlight-50', success: 'bg-success-50', danger: 'bg-danger-50' };

export function StatusBanner({ status }: { status: Booking['status'] }) {
  const s = BOOKING_STATUS[status];
  return (
    <div className={cn('flex items-center gap-2.5 rounded-lg px-3.5 py-3', bannerBg[s.tone] ?? 'bg-surface-muted')}>
      <Icon name={s.icon} size={19} />
      <span className="font-semibold">{s.label}</span>
    </div>
  );
}

/* ───────── Schedule picker ───────── */

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function DateStrip({ value, onChange, days = 14, disabledDates = [], label = 'Select date' }: { value: string | null; onChange: (d: string) => void; days?: number; disabledDates?: string[]; label?: string }) {
  const [start] = useState(() => new Date());
  const dates = useMemo(() => Array.from({ length: days }).map((_, i) => addDays(start, i)), [days, start]);
  return (
    <div role="radiogroup" aria-label={label} className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {dates.map((d, i) => {
        const key = toDateKey(d);
        const selected = key === value;
        const disabled = disabledDates.includes(key);
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`}
            disabled={disabled}
            onClick={() => onChange(key)}
            className={cn(
              'focus-ring flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-colors disabled:opacity-40',
              selected ? 'border-primary-500 bg-primary-500 text-white shadow-brand' : 'border-border bg-surface hover:border-primary-300',
            )}
          >
            <span className={cn('text-caption', selected ? 'text-white/80' : 'text-ink-muted')}>{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : DAY[d.getDay()]}</span>
            <span className="text-h3 font-bold">{d.getDate()}</span>
            <span className={cn('text-caption', selected ? 'text-white/80' : 'text-ink-muted')}>{MON[d.getMonth()]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SlotGrid({ slots, value, onChange }: { slots: TimeSlot[]; value: string | null; onChange: (s: string) => void }) {
  const groups: { label: string; icon: IconName; items: TimeSlot[] }[] = [
    { label: 'Morning', icon: 'sunrise' as const, items: slots.filter((s) => Number(s.time.slice(0, 2)) < 12) },
    { label: 'Afternoon', icon: 'sun' as const, items: slots.filter((s) => Number(s.time.slice(0, 2)) >= 12 && Number(s.time.slice(0, 2)) < 17) },
    { label: 'Evening', icon: 'sunset' as const, items: slots.filter((s) => Number(s.time.slice(0, 2)) >= 17) },
  ].filter((g) => g.items.length);
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <fieldset key={g.label}>
          <legend className="mb-2 flex items-center gap-1.5 text-body-sm font-medium text-ink-secondary">
            <Icon name={g.icon} size={14} />
            {g.label}
          </legend>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {g.items.map((s) => {
              const selected = s.time === value;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  aria-pressed={selected}
                  aria-label={s.available ? s.label : `${s.label}, unavailable`}
                  onClick={() => onChange(s.time)}
                  className={cn(
                    'focus-ring rounded-lg border px-2 py-2.5 text-body-sm font-semibold transition-colors',
                    selected ? 'border-primary-500 bg-primary-500 text-white' : s.available ? 'border-border bg-surface hover:border-primary-300 hover:bg-primary-50' : 'cursor-not-allowed border-border bg-surface-muted text-ink-muted line-through',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Date + slot picker bound to a provider's live availability. */
export function SchedulePicker({ providerId, date, slot, onChange, advanceDays = 14 }: { providerId: string; date: string | null; slot: string | null; onChange: (date: string, slot: string | null) => void; advanceDays?: number }) {
  const slots = useSlots(providerId, date);
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-3 text-title font-semibold">Select date</h3>
        <DateStrip value={date} onChange={(d) => onChange(d, null)} days={advanceDays} />
      </section>
      <section>
        <h3 className="mb-3 text-title font-semibold">Select time slot</h3>
        {!date ? (
          <p className="text-ink-muted">Pick a date to see available slots.</p>
        ) : slots.isPending ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : slots.data?.length === 0 || slots.data?.every((s) => !s.available) ? (
          <EmptyState compact icon="calendar-x" title="No slots available" message="The provider is unavailable on this date. Try another day." />
        ) : (
          <SlotGrid slots={slots.data ?? []} value={slot} onChange={(s) => onChange(date, s)} />
        )}
      </section>
    </div>
  );
}

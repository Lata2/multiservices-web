import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DateStrip } from '@/components/domain';
import { ActionBar, Button, Card, Chip, cn, Icon, ListSkeleton, Modal, PageHeader, SectionHeader, Switch } from '@/components/ui';
import { useProviderProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import type { Provider, WeeklyHours } from '@/types/models';
import { formatDay, formatTime } from '@/utils/format';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = Array.from({ length: 31 }).map((_, i) => {
  const m = 6 * 60 + i * 30;
  return `${`${Math.floor(m / 60)}`.padStart(2, '0')}:${`${m % 60}`.padStart(2, '0')}`;
});

export default function Availability() {
  usePageMeta({ title: 'Availability', noindex: true });
  const q = useProviderProfile();
  if (!q.data)
    return (
      <>
        <PageHeader title="Availability" back="/provider/account" />
        <ListSkeleton rows={7} height={56} />
      </>
    );
  return <AvailabilityEditor provider={q.data} />;
}

function AvailabilityEditor({ provider }: { provider: Provider }) {
  const navigate = useNavigate();
  const [hours, setHours] = useState<WeeklyHours[]>(provider.hours);
  const [holidays, setHolidays] = useState<string[]>(provider.holidays);
  const [slot, setSlot] = useState(provider.slotDurationMin);
  const [advance, setAdvance] = useState(provider.advanceBookingDays);
  const [picker, setPicker] = useState<{ day: number; field: 'start' | 'end' } | null>(null);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState<string | null>(null);
  const invalid = hours.some((h) => h.open && h.start >= h.end);

  const save = useApiMutation(() => providerApi.updateAvailability({ hours, holidays, slotDurationMin: slot, advanceBookingDays: advance }), {
    invalidate: [qk.provider_.all, ['slots'], ['provider']],
    successMessage: 'Availability saved',
    onSuccess: () => navigate('/provider'),
  });
  const update = (day: number, patch: Partial<WeeklyHours>) => setHours((hs) => hs.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  const pill = 'focus-ring rounded-md border border-border bg-surface-muted px-2.5 py-1.5 text-body-sm font-medium hover:border-primary-300';

  return (
    <div className="max-w-3xl">
      <PageHeader title="Availability" subtitle="Controls which slots customers can book" back="/provider/account" />
      <section className="mb-6">
        <SectionHeader title="Weekly hours" />
        <Card padded={false}>
          <ul className="divide-y divide-border">
            {hours.map((h) => (
              <li key={h.day} className="flex items-center gap-3 px-4 py-3">
                <Switch checked={h.open} onChange={(v) => update(h.day, { open: v })} label={`Open on ${DAYS[h.day]}`} />
                <span className="w-24 font-medium">
                  <span className="sm:hidden">{DAYS[h.day].slice(0, 3)}</span>
                  <span className="hidden sm:inline">{DAYS[h.day]}</span>
                </span>
                {h.open ? (
                  <span className="flex flex-1 items-center justify-end gap-2">
                    <button type="button" className={pill} onClick={() => setPicker({ day: h.day, field: 'start' })} aria-label={`${DAYS[h.day]} opening time ${formatTime(h.start)}`}>
                      {formatTime(h.start)}
                    </button>
                    <span className="text-ink-muted">–</span>
                    <button type="button" className={cn(pill, h.start >= h.end && 'border-danger-500 text-danger-600')} onClick={() => setPicker({ day: h.day, field: 'end' })} aria-label={`${DAYS[h.day]} closing time ${formatTime(h.end)}`}>
                      {formatTime(h.end)}
                    </button>
                  </span>
                ) : (
                  <span className="flex-1 text-right text-ink-muted">Closed</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
        {invalid ? (
          <p className="mt-2 text-caption text-danger-600" role="alert">
            Closing time must be after opening time.
          </p>
        ) : null}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <SectionHeader title="Slot length" />
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90, 120].map((m) => (
              <Chip key={m} label={m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? 's' : ''}`} selected={slot === m} onClick={() => setSlot(m)} />
            ))}
          </div>
        </section>
        <section>
          <SectionHeader title="Advance booking window" />
          <div className="flex flex-wrap gap-2">
            {[3, 7, 14, 30].map((d) => (
              <Chip key={d} label={`${d} days`} selected={advance === d} onClick={() => setAdvance(d)} />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <SectionHeader title="Holidays & leave" action="Add day off" onAction={() => (setHolidayDate(null), setHolidayOpen(true))} />
        {holidays.length ? (
          <ul className="flex flex-wrap gap-2">
            {[...holidays].sort().map((d) => (
              <li key={d}>
                <button type="button" onClick={() => setHolidays((hs) => hs.filter((x) => x !== d))} className="focus-ring flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1.5 text-body-sm font-medium text-danger-700 hover:bg-danger-100" aria-label={`Remove holiday ${formatDay(d)}`}>
                  {formatDay(d)}
                  <Icon name="x" size={13} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-muted">No days off scheduled.</p>
        )}
      </section>

      <ActionBar>
        <Button size="lg" fullWidth loading={save.isPending} disabled={invalid} onClick={() => save.mutate()}>
          Save availability
        </Button>
      </ActionBar>

      <Modal open={!!picker} onClose={() => setPicker(null)} title={picker ? `${DAYS[picker.day]} · ${picker.field === 'start' ? 'Opens at' : 'Closes at'}` : ''}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {TIMES.map((t) => {
            const cur = picker ? hours.find((h) => h.day === picker.day)?.[picker.field] : null;
            return <Chip key={t} label={formatTime(t)} selected={cur === t} onClick={() => (picker && update(picker.day, { [picker.field]: t }), setPicker(null))} />;
          })}
        </div>
      </Modal>
      <Modal
        open={holidayOpen}
        onClose={() => setHolidayOpen(false)}
        title="Mark a day off"
        size="lg"
        footer={
          <Button fullWidth disabled={!holidayDate} onClick={() => (holidayDate && setHolidays((hs) => Array.from(new Set([...hs, holidayDate]))), setHolidayOpen(false))}>
            Add holiday
          </Button>
        }
      >
        <DateStrip value={holidayDate} onChange={setHolidayDate} days={30} disabledDates={holidays} />
        <p className="mt-3 text-caption text-ink-muted">Customers won’t be able to book you on this date. Existing bookings aren’t affected.</p>
      </Modal>
    </div>
  );
}

import type { Booking, Provider, TimeSlot } from '@/types/models';
import { formatTime, parseDateKey, todayKey } from './format';

/**
 * Generates bookable slots for a provider on a given date, removing slots
 * already taken by active bookings and past slots for today.
 * Mirrors what the backend should compute.
 */
export function generateSlots(provider: Provider, dateKey: string, bookings: Booking[], now = new Date()): TimeSlot[] {
  const day = parseDateKey(dateKey).getDay();
  const hours = provider.hours.find((h) => h.day === day);
  if (!hours?.open || provider.holidays.includes(dateKey)) return [];

  const [sh, sm] = hours.start.split(':').map(Number);
  const [eh, em] = hours.end.split(':').map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const step = provider.slotDurationMin || 60;

  const taken = new Map<string, number>();
  bookings
    .filter((b) => b.providerId === provider.id && b.scheduledDate === dateKey && !['cancelled', 'rejected'].includes(b.status))
    .forEach((b) => taken.set(b.slot, (taken.get(b.slot) ?? 0) + 1));

  const capacity = provider.type === 'organization' ? 2 : 1;
  const isToday = dateKey === todayKey();
  const nowMin = now.getHours() * 60 + now.getMinutes() + 60; // 1h lead time

  const slots: TimeSlot[] = [];
  for (let t = start; t + step <= end; t += step) {
    const time = `${`${Math.floor(t / 60)}`.padStart(2, '0')}:${`${t % 60}`.padStart(2, '0')}`;
    const full = (taken.get(time) ?? 0) >= capacity;
    const past = isToday && t < nowMin;
    slots.push({ time, label: formatTime(time), available: !full && !past });
  }
  return slots;
}

import { describe, it, expect } from 'vitest';
import { db } from '@/mocks/db';
import { formatMoney, formatTime, toDateKey } from '@/utils/format';
import { generateSlots } from '@/utils/slots';
import { addressSchema, customerSignupSchema, loginSchema, serviceSchema } from '@/utils/validation';

describe('validation schemas', () => {
  it('validates login', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('requires matching passwords and accepted terms on signup', () => {
    const ok = { name: 'Jane Doe', email: 'jane@x.com', phone: '9876543210', password: 'secret123', confirmPassword: 'secret123', acceptTerms: true };
    expect(customerSignupSchema.safeParse(ok).success).toBe(true);
    const mismatch = customerSignupSchema.safeParse({ ...ok, confirmPassword: 'nope1234' });
    expect(mismatch.success).toBe(false);
    expect(customerSignupSchema.safeParse({ ...ok, acceptTerms: false }).success).toBe(false);
    expect(customerSignupSchema.safeParse({ ...ok, password: 'short' }).success).toBe(false);
  });

  it('validates address PIN codes', () => {
    const a = { label: 'Home', contactName: 'Jane', phone: '9876543210', line1: '12 Street', city: 'Pune', state: 'MH', pincode: '4110', isDefault: false } as const;
    expect(addressSchema.safeParse(a).success).toBe(false);
    expect(addressSchema.safeParse({ ...a, pincode: '411001' }).success).toBe(true);
  });

  it('rejects an offer price higher than the price', () => {
    const s = { title: 'Deep clean', description: 'A thorough deep cleaning service.', categoryId: 'c', price: '500', discountPrice: '600', durationMin: '60', membersRequired: '1', requiresPickup: false, active: true };
    expect(serviceSchema.safeParse(s).success).toBe(false);
    expect(serviceSchema.safeParse({ ...s, discountPrice: '400' }).success).toBe(true);
  });
});

describe('slot generation', () => {
  const provider = db.providers.find((p) => p.id === 'prov_4')!; // individual → capacity 1

  it('returns no slots on closed days and holidays', () => {
    const sunday = new Date();
    while (sunday.getDay() !== 0) sunday.setDate(sunday.getDate() + 1);
    expect(generateSlots(provider, toDateKey(sunday), [])).toEqual([]);
    expect(generateSlots({ ...provider, holidays: ['2099-01-05'] }, '2099-01-05', [])).toEqual([]);
  });

  it('marks booked slots unavailable for individuals', () => {
    const monday = new Date(2099, 0, 5); // a Monday
    const key = toDateKey(monday);
    const booking = { ...db.bookings[0], providerId: provider.id, scheduledDate: key, slot: '10:00', status: 'confirmed' as const };
    const slots = generateSlots(provider, key, [booking]);
    expect(slots.find((s) => s.time === '10:00')?.available).toBe(false);
    expect(slots.find((s) => s.time === '11:00')?.available).toBe(true);
    expect(slots[0].label).toBe('9:00 AM');
  });
});

describe('formatters', () => {
  it('formats money and time', () => {
    expect(formatMoney(1299)).toMatch(/1,299/);
    expect(formatTime('14:30')).toBe('2:30 PM');
    expect(formatTime('00:15')).toBe('12:15 AM');
  });
});

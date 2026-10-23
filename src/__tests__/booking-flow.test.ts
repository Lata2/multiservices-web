import { describe, it, expect } from 'vitest';
/**
 * End-to-end mock backend flow across roles:
 * customer books → provider accepts → starts with OTP → completes → customer reviews.
 */
import { authApi, bookingsApi, DEMO_PASSWORD, reviewsApi, catalogApi } from '@/services/api';
import { session } from '@/services/session';
import { useCartStore } from '@/store/cart.store';
import { toDateKey } from '@/utils/format';

async function loginAs(email: string, role: 'customer' | 'provider') {
  const { user, token } = await authApi.login(email, DEMO_PASSWORD, role);
  session.set(user, token);
  return user;
}

function nextWeekday(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return toDateKey(d);
}

describe('cart store', () => {
  it('enforces one provider per cart', () => {
    const cart = useCartStore.getState();
    cart.clear();
    expect(cart.add('svc_1', 'prov_1')).toBe('added');
    expect(useCartStore.getState().add('svc_1', 'prov_1')).toBe('added');
    expect(useCartStore.getState().quantityOf('svc_1')).toBe(2);
    expect(useCartStore.getState().add('svc_7', 'prov_2')).toBe('conflict');
    useCartStore.getState().replaceWith('svc_7', 'prov_2');
    expect(useCartStore.getState().providerId).toBe('prov_2');
    expect(useCartStore.getState().items).toEqual([{ serviceId: 'svc_7', quantity: 1 }]);
  });
});

describe('auth', () => {
  it('rejects wrong role and wrong password', async () => {
    await expect(authApi.login('customer@servio.app', DEMO_PASSWORD, 'provider')).rejects.toThrow(/registered as a customer/);
    await expect(authApi.login('customer@servio.app', 'nope', 'customer')).rejects.toThrow(/Incorrect password/);
  });
});

describe('booking lifecycle', () => {
  it('runs from checkout to review', async () => {
    await loginAs('customer@servio.app', 'customer');
    const date = nextWeekday();
    const slots = await catalogApi.getSlots('prov_1', date);
    const slot = slots.find((s) => s.available)!;
    expect(slot).toBeDefined();

    const quote = await bookingsApi.quote([{ serviceId: 'svc_2', quantity: 3 }], 'CLEAN20');
    expect(quote.promoValid).toBe(true);
    expect(quote.pricing.discount).toBeGreaterThan(0);

    const booking = await bookingsApi.create({ items: [{ serviceId: 'svc_2', quantity: 3 }], addressId: 'addr_1', date, slot: slot.time, paymentMethod: 'upi', promoCode: 'CLEAN20' });
    expect(booking.status).toBe('pending');
    expect(booking.pricing.total).toBe(quote.pricing.total);

    // Same slot is now consumed for the individual capacity check (organisation has capacity 2)
    const again = await catalogApi.getSlots('prov_1', date);
    expect(again.find((s) => s.time === slot.time)).toBeDefined();

    await loginAs('provider@servio.app', 'provider');
    await bookingsApi.updateStatus(booking.id, 'confirmed');
    await bookingsApi.updateStatus(booking.id, 'on_the_way');
    await expect(bookingsApi.updateStatus(booking.id, 'in_progress', { otp: '0000' })).rejects.toThrow(/start code/);
    await bookingsApi.updateStatus(booking.id, 'in_progress', { otp: booking.startOtp });
    const done = await bookingsApi.updateStatus(booking.id, 'completed');
    expect(done.status).toBe('completed');
    await expect(bookingsApi.updateStatus(booking.id, 'cancelled')).rejects.toThrow();

    await loginAs('customer@servio.app', 'customer');
    const review = await reviewsApi.create({ bookingId: booking.id, rating: 5, comment: 'Great job' });
    expect(review.rating).toBe(5);
    await expect(reviewsApi.create({ bookingId: booking.id, rating: 4, comment: 'again' })).rejects.toThrow(/already reviewed/);
  });

  it('refunds wallet payments on cancellation', async () => {
    await loginAs('customer@servio.app', 'customer');
    const date = nextWeekday();
    const slot = (await catalogApi.getSlots('prov_6', date)).find((s) => s.available)!;
    const b = await bookingsApi.create({ items: [{ serviceId: 'svc_28', quantity: 1 }], addressId: 'addr_1', date, slot: slot.time, paymentMethod: 'wallet' });
    expect(b.payment.status).toBe('paid');
    const cancelled = await bookingsApi.cancel(b.id, 'Change of plans');
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.payment.status).toBe('refunded');
  });
});

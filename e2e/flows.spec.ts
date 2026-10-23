import { expect, test } from '@playwright/test';
import { clickVisible, login, trackErrors } from './helpers';

// The mock backend lives in memory, so each flow navigates client-side after its first load.

test('guest browses, adds to cart, signs in and books a service end to end', async ({ page }) => {
  const done = trackErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Trusted pros/ })).toBeVisible();
  await page.goto('/category/cat_men');
  await page.getByRole('button', { name: /Add Haircut \+ Styling to cart/ }).click();
  await expect(page.getByText('Added to cart')).toBeVisible();
  await page.getByRole('link', { name: 'View cart' }).click();
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByText('Haircut + Styling').first()).toBeVisible();

  // Promo engine: valid provider-agnostic code below min order → message
  await page.getByLabel('Promo code').fill('WELCOME500');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText(/Add items worth/)).toBeVisible();

  await clickVisible(page, 'Sign in to book');
  await expect(page).toHaveURL(/\/login\?role=customer/);
  await page.getByRole('button', { name: /click to fill/ }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/checkout\/schedule/);

  // Pick tomorrow's first free slot
  await page.getByRole('radio').nth(1).click();
  const slot = page.locator('button[aria-pressed="false"]:not([disabled])').filter({ hasText: /AM|PM/ }).first();
  await slot.click();
  await clickVisible(page, 'Continue to checkout');
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('radio', { name: /Pay after service/ }).click();
  await clickVisible(page, 'Confirm booking');
  await expect(page).toHaveURL(/\/booking-success\//, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Booking placed!' })).toBeVisible();
  await clickVisible(page, 'Track booking');
  await expect(page.getByText('Awaiting confirmation').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Status timeline' })).toBeVisible();
  done();
});

test('customer cancels an upcoming booking and gets a refund note', async ({ page }) => {
  const done = trackErrors(page);
  await login(page, 'customer');
  await page.goto('/bookings');
  await page.getByRole('link', { name: /Intense Bathroom Cleaning/ }).first().click();
  await clickVisible(page, 'Cancel booking');
  await page.getByRole('button', { name: 'Booked by mistake' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel booking' }).click();
  await expect(page.getByText('Booking cancelled').first()).toBeVisible();
  await expect(page.getByText(/Reason: Booked by mistake/)).toBeVisible();
  done();
});

test('provider accepts a request and runs the job with the start code', async ({ page }) => {
  const done = trackErrors(page);
  await login(page, 'provider');
  await expect(page.getByRole('heading', { name: 'SparkleClean Co.' })).toBeVisible();
  await page.goto('/provider/bookings');
  const card = page.locator('article').filter({ has: page.getByRole('button', { name: 'Accept' }) }).first();
  const title = (await card.getByRole('heading', { level: 3 }).innerText()).trim();
  await card.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByText(/accepted/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Upcoming' }).click();
  await page.getByRole('link', { name: title }).first().click();
  await clickVisible(page, 'I’m on my way');
  await expect(page.getByText('Status updated')).toBeVisible();
  await clickVisible(page, 'Start job (enter code)');
  const demo = await page.getByText(/Demo code: \d{4}/).innerText();
  await page.getByLabel('Start code').fill(demo.replace(/\D/g, ''));
  await page.getByRole('button', { name: 'Start job', exact: true }).click();
  await expect(page.getByText('In progress').first()).toBeVisible();
  await clickVisible(page, 'Mark complete');
  await expect(page.getByText('Completed').first()).toBeVisible();
  done();
});

test('delivery partner accepts, picks up and delivers with OTP', async ({ page }) => {
  const done = trackErrors(page);
  await login(page, 'delivery');
  await expect(page.getByText('You are online')).toBeVisible();
  await page.getByRole('button', { name: /Accept · earn/ }).first().click();
  await expect(page).toHaveURL(/\/delivery\/tasks\//);
  await clickVisible(page, 'Confirm pickup');
  await expect(page.getByText('Marked as picked up')).toBeVisible();
  await clickVisible(page, 'Complete delivery');
  const demo = await page.getByText(/Demo code: \d{4}/).innerText();
  await page.getByLabel('Delivery code').fill(demo.replace(/\D/g, ''));
  await page.getByRole('button', { name: 'Confirm delivery' }).click();
  await expect(page.getByText(/Delivered! Earnings added/)).toBeVisible();
  done();
});

test('admin approves a provider and pays out a request', async ({ page }) => {
  const done = trackErrors(page);
  await login(page, 'admin');
  await expect(page.getByRole('heading', { name: 'Marketplace overview' })).toBeVisible();
  await page.goto('/admin/providers');
  await page.locator('li').filter({ hasText: 'SafeHome Pest Solutions' }).getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('Provider approved')).toBeVisible();
  await page.goto('/admin/payouts');
  await page.getByRole('button', { name: 'Mark as paid' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Mark as paid' }).click();
  await expect(page.getByText(/marked as paid/)).toBeVisible();
  done();
});

test('form validation shows errors and role guard redirects', async ({ page }) => {
  const done = trackErrors(page);
  await page.goto('/signup?role=customer');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('Please accept the terms to continue')).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?role=admin/);
  await login(page, 'customer');
  await page.goto('/provider');
  await expect(page).toHaveURL('/');
  done();
});

import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

const isPhone = (w: number) => w < 640;

test('header shows sign in and create account at every width', async ({ page }) => {
  const done = trackErrors(page);
  await page.goto('/');
  const header = page.locator('header').first();
  const signIn = header.getByRole('link', { name: 'Sign in', exact: true });
  const signUp = header.getByRole('link', { name: /^(Sign up|Create account)$/ });
  await expect(signIn).toBeVisible();
  await expect(signUp).toBeVisible();
  await signUp.click();
  await expect(page).toHaveURL(/\/signup/);
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  await page.goto('/offers');
  await page.locator('header').first().getByRole('link', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  done();
});

test('mobile menu drawer opens, navigates and offers account actions', async ({ page }) => {
  const width = page.viewportSize()!.width;
  test.skip(width >= 1280, 'Desktop shows the full navigation instead of the drawer');
  const done = trackErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Create account' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  await drawer.getByRole('link', { name: 'Professionals' }).click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/professionals/);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
  done();
});

test('hero slider: dots, arrows, pause and CTA', async ({ page }) => {
  const done = trackErrors(page);
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Featured services' });
  await expect(hero.getByRole('heading', { name: 'Spotless homes, zero effort' })).toBeInViewport();

  await hero.getByRole('button', { name: 'Pause slideshow' }).click();
  await expect(hero.getByRole('button', { name: 'Play slideshow' })).toBeVisible();

  await hero.getByRole('button', { name: 'Go to slide 3' }).click();
  await expect(hero.getByRole('heading', { name: 'Salon glow, at home' })).toBeInViewport();
  await expect(hero.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true');

  if (!isPhone(page.viewportSize()!.width) && page.viewportSize()!.width >= 768) {
    await hero.getByRole('button', { name: 'Next slide' }).click();
    await expect(hero.getByRole('heading', { name: 'Shine without the queue' })).toBeInViewport();
    await hero.getByRole('button', { name: 'Previous slide' }).click();
    await expect(hero.getByRole('heading', { name: 'Salon glow, at home' })).toBeInViewport();
  } else {
    // Phones: swipe with the keyboard equivalent
    await hero.getByRole('button', { name: 'Go to slide 3' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(hero.getByRole('heading', { name: 'Shine without the queue' })).toBeInViewport();
  }

  await hero.getByRole('link', { name: 'Book car wash' }).click();
  await expect(page).toHaveURL(/\/category\/cat_car/);
  await expect(page.getByRole('heading', { name: 'Car Care', level: 1 })).toBeVisible();
  done();
});

test('hero autoplay advances on its own', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Featured services' });
  await expect(hero.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');
  await page.mouse.move(0, 0);
  await expect(hero.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true', { timeout: 12_000 });
});

test('sign up from the header creates an account', async ({ page }) => {
  const done = trackErrors(page);
  await page.goto('/');
  await page.locator('header').first().getByRole('link', { name: /^(Sign up|Create account)$/ }).click();
  const stamp = Date.now();
  await page.getByLabel('Full name').fill('Test User');
  await page.getByLabel('Email').fill(`test${stamp}@example.com`);
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByLabel(/^Password/).fill('Secret@123');
  await page.getByLabel('Confirm password').fill('Secret@123');
  await page.locator('label', { has: page.getByRole('checkbox') }).click({ position: { x: 10, y: 10 } });
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).not.toHaveURL(/\/signup/, { timeout: 10_000 });
  await expect(page.locator('header').first().getByRole('link', { name: 'Sign in', exact: true })).toHaveCount(0);
  done();
});

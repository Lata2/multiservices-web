import { expect, type Page } from '@playwright/test';

export type Role = 'customer' | 'provider' | 'delivery' | 'admin';
export const EMAIL: Record<Role, string> = {
  customer: 'customer@servio.app',
  provider: 'provider@servio.app',
  delivery: 'delivery@servio.app',
  admin: 'admin@servio.app',
};

/** Fails the test on any uncaught page error. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return () => expect(errors, errors.join('\n')).toEqual([]);
}

export async function login(page: Page, role: Role, next?: string) {
  await page.goto(`/login?role=${role}${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  await page.getByLabel('Email').fill(EMAIL[role]);
  await page.getByLabel('Password', { exact: true }).fill('Demo@1234');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/** Desktop shows inline action cards, phones show the fixed ActionBar — click whichever is visible. */
export async function clickVisible(page: Page, name: string | RegExp, timeout = 10_000) {
  const controls = page.getByRole('button', { name }).or(page.getByRole('link', { name }));
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const n = await controls.count();
    for (let i = 0; i < n; i++) {
      const c = controls.nth(i);
      if (await c.isVisible()) return c.click();
    }
    await page.waitForTimeout(150);
  }
  throw new Error(`No visible control named ${String(name)}`);
}

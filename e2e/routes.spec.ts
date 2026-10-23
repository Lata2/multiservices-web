import { expect, test } from '@playwright/test';
import { login, trackErrors, type Role } from './helpers';

/** Every page renders a heading, no runtime errors and no horizontal overflow. */
const ROUTES: Record<Role | 'guest', string[]> = {
  guest: ['/', '/explore', '/category/cat_clean', '/services?sort=popular', '/search?q=clean', '/service/svc_1', '/professionals', '/professionals/prov_1', '/offers', '/legal/terms', '/cart', '/welcome', '/login', '/login/otp', '/signup?role=provider', '/signup?role=delivery', '/forgot-password', '/does-not-exist'],
  customer: ['/account', '/bookings', '/bookings/bk_1', '/bookings/bk_4/invoice', '/bookings/bk_5/review', '/account/addresses', '/account/addresses/new', '/account/addresses/addr_1', '/account/wallet', '/account/favorites', '/account/refer', '/account/notifications', '/account/messages', '/account/messages/ch_1', '/account/support', '/account/support/new', '/account/support/tk_1', '/account/profile', '/account/password', '/account/settings'],
  provider: ['/provider', '/provider/bookings', '/provider/bookings/bk_8', '/provider/services', '/provider/services/new', '/provider/services/svc_1/edit', '/provider/availability', '/provider/reviews', '/provider/earnings', '/provider/business', '/provider/documents', '/provider/promos', '/provider/promos/new', '/provider/account', '/provider/messages', '/provider/notifications', '/provider/support', '/provider/settings'],
  delivery: ['/delivery', '/delivery/history', '/delivery/tasks/dt_1', '/delivery/earnings', '/delivery/vehicle', '/delivery/account', '/delivery/notifications', '/delivery/support', '/delivery/settings'],
  admin: ['/admin', '/admin/bookings', '/admin/bookings/bk_1', '/admin/providers', '/admin/providers/prov_10', '/admin/users', '/admin/users/u_c1', '/admin/more', '/admin/categories', '/admin/partners', '/admin/payouts', '/admin/support', '/admin/support/tk_3', '/admin/promos', '/admin/promos/new', '/admin/banners', '/admin/reviews', '/admin/platform', '/admin/cities', '/admin/broadcast', '/admin/reports', '/admin/notifications', '/admin/settings'],
};

for (const [who, routes] of Object.entries(ROUTES)) {
  test(`all ${who} pages render`, async ({ page }) => {
    const done = trackErrors(page);
    if (who !== 'guest') await login(page, who as Role);
    for (const path of routes) {
      await page.goto(path);
      await expect(page.locator('h1').first(), path).toBeAttached();
      await expect(page.getByRole('alert').filter({ hasText: /couldn.t load/ }), path).toHaveCount(0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(1);
    }
    done();
  });
}

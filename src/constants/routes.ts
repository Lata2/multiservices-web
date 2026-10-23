import type { Role } from '@/types/models';

/** Base path for screens every role has (notifications, support, messages, profile, settings). */
export const roleBase = (role: Role) => (role === 'customer' ? '/account' : `/${role}`);

/** Where each role lands after signing in. */
export const roleHome = (role: Role) => (role === 'customer' ? '/' : `/${role}`);

/**
 * Notification links are produced by the backend in the mobile app's deep-link format
 * (e.g. `/customer/booking/bk_1`) so one backend can serve both apps. This maps them to
 * website routes.
 */
export function toWebHref(href: string): string {
  const rules: [RegExp, string][] = [
    [/^\/customer\/booking\/([^/?]+)$/, '/bookings/$1'],
    [/^\/customer\/offers$/, '/offers'],
    [/^\/customer\/(ticket)\/([^/?]+)$/, '/account/support/$2'],
    [/^\/customer\/?$/, '/'],
    [/^\/customer\/(.+)$/, '/account/$1'],
    [/^\/provider\/booking\/([^/?]+)$/, '/provider/bookings/$1'],
    [/^\/delivery\/task\/([^/?]+)$/, '/delivery/tasks/$1'],
    [/^\/(provider|delivery|admin)\/ticket\/([^/?]+)$/, '/$1/support/$2'],
  ];
  for (const [re, to] of rules) if (re.test(href)) return href.replace(re, to);
  return href;
}

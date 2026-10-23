import { Outlet } from 'react-router';
import { Icon } from '../ui';
import { Logo } from './Logo';

const points = [
  { icon: 'shield-check' as const, text: 'Background-verified professionals' },
  { icon: 'calendar-check' as const, text: 'Live slots and instant confirmation' },
  { icon: 'repeat' as const, text: '7-day re-work guarantee on every booking' },
];

/** Split layout for sign-in / sign-up: brand panel on desktop, focused form on phones. */
export function AuthLayout() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent-500/25 blur-2xl" aria-hidden />
        <Logo light />
        <div className="relative mt-auto max-w-md">
          <p className="text-display font-extrabold leading-tight">Home services, booked in a tap.</p>
          <ul className="mt-8 flex flex-col gap-4">
            {points.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Icon name={p.icon} size={17} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-12 text-caption text-white/60">Customers, service providers, delivery partners and admins all sign in here.</p>
      </aside>
      <main id="main" className="flex min-h-dvh flex-col">
        <div className="flex items-center px-4 pt-4 lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

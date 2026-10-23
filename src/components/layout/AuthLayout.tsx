import { Link, Outlet } from 'react-router';
import { Scene } from '../domain/Scenes';
import { FloatingChip } from '../domain/ServiceArt';
import { Icon, type IconName } from '../ui';
import { Logo } from './Logo';

const points: [IconName, string][] = [
  ['shield-check', 'Verified professionals'],
  ['calendar-check', 'Live slots, instant confirmation'],
  ['repeat', '7-day re-work guarantee'],
];

/** Split layout for sign-in / sign-up: illustrated brand panel on desktop, focused form card elsewhere. */
export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,var(--color-primary-800),var(--color-primary-600)_50%,var(--color-highlight-600))] text-white lg:block">
        <span className="dot-grid absolute inset-0 opacity-10" aria-hidden />
        <div className="sticky top-0 flex h-dvh flex-col p-10 xl:p-12">
          <Logo light className="relative" />
          <div className="relative my-auto flex flex-col items-start">
            {/* Collage of service scenes */}
            <div className="relative mb-10 aspect-[5/4] w-full max-w-[440px] self-center" aria-hidden>
              <span className="absolute left-[6%] top-[8%] w-[72%] -rotate-3 overflow-hidden rounded-2xl shadow-float ring-4 ring-white/25">
                <span className="block aspect-[4/3]">
                  <Scene scene="clean" hue="primary" />
                </span>
              </span>
              <span className="absolute right-0 top-0 w-[42%] rotate-[5deg] overflow-hidden rounded-xl shadow-float ring-4 ring-white/25">
                <span className="block aspect-[4/3]">
                  <Scene scene="salon" hue="highlight" />
                </span>
              </span>
              <span className="absolute bottom-0 right-[8%] w-[46%] rotate-[-2deg] overflow-hidden rounded-xl shadow-float ring-4 ring-white/25">
                <span className="block aspect-[4/3]">
                  <Scene scene="ac" hue="info" />
                </span>
              </span>
              <FloatingChip chip={{ icon: 'star', label: '4.8 · 12k+ homes' }} className="absolute bottom-[14%] left-0" />
            </div>
            <p className="text-display font-extrabold leading-tight">Home services, booked in a tap.</p>
            <ul className="mt-6 flex flex-col gap-3">
              {points.map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-white/90">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    <Icon name={icon} size={16} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      <main id="main" className="flex min-h-dvh flex-col">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:hidden">
          <Logo />
          <Link to="/" className="focus-ring flex items-center gap-1 rounded-full px-3 py-2 text-body-sm font-semibold text-ink-secondary hover:bg-surface-muted">
            <Icon name="home" size={16} />
            Home
          </Link>
        </div>
        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <Link to="/" className="focus-ring flex items-center gap-1 rounded-full px-3 py-2 text-body-sm font-semibold text-ink-secondary hover:bg-surface">
            <Icon name="chevron-left" size={16} />
            Back to home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-4 pb-10 pt-2 sm:px-6 lg:pt-0">
          <div className="animate-rise sm:rounded-[28px] sm:border sm:border-border/70 sm:bg-surface sm:p-8 sm:shadow-lg">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

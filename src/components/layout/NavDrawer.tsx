import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ROLES } from '@/constants/roles';
import { roleHome } from '@/constants/routes';
import { useSignOut } from '@/hooks/useSignOut';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, cn, Icon, IconButton, LinkButton, Modal, type IconName } from '../ui';
import { CityPicker } from './CityPicker';
import { Logo } from './Logo';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const BROWSE: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/explore', label: 'Explore services', icon: 'compass' },
  { to: '/professionals', label: 'Professionals', icon: 'users' },
  { to: '/offers', label: 'Offers', icon: 'badge-percent' },
  { to: '/search', label: 'Search', icon: 'search' },
];

const CUSTOMER: NavItem[] = [
  { to: '/bookings', label: 'My bookings', icon: 'calendar' },
  { to: '/account/wallet', label: 'Wallet', icon: 'wallet' },
  { to: '/account/favorites', label: 'Favourites', icon: 'heart' },
  { to: '/account/messages', label: 'Messages', icon: 'chats' },
  { to: '/account/notifications', label: 'Notifications', icon: 'bell' },
];

const WORK: NavItem[] = [
  { to: '/signup?role=provider', label: 'Become a service provider', icon: 'briefcase' },
  { to: '/signup?role=delivery', label: 'Become a delivery partner', icon: 'bike' },
  { to: '/login?role=provider', label: 'Partner sign in', icon: 'key' },
];

function Group({ title, items, onNavigate }: { title?: string; items: NavItem[]; onNavigate: () => void }) {
  return (
    <div className="py-2">
      {title ? <p className="px-3 pb-1.5 pt-2 text-caption font-semibold text-ink-muted">{title}</p> : null}
      <ul>
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn('focus-ring flex min-h-12 items-center gap-3 rounded-xl px-3 text-body font-medium transition-colors', isActive ? 'bg-primary-50 text-primary-700' : 'text-ink hover:bg-surface-muted')
              }
            >
              <Icon name={it.icon} size={19} className="shrink-0 opacity-80" />
              <span className="flex-1">{it.label}</span>
              <Icon name="chevron-right" size={16} className="text-ink-muted" />
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mobile / tablet navigation drawer: account entry points, browsing, partner links. */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  const { pathname } = useLocation();

  // Close when the route changes (e.g. back button).
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Modal open={open} onClose={onClose} variant="drawer" ariaLabel="Menu" hideClose className="[&>div:last-child]:px-3">
      <div className="sticky top-0 z-10 -mx-3 flex items-center justify-between bg-surface px-4 pb-3 pt-3">
        <Logo />
        <IconButton icon="x" label="Close menu" onClick={onClose} />
      </div>

      {user ? (
        <div className="rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-highlight-50))] p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size={46} ring />
            <div className="min-w-0">
              <p className="truncate font-bold">{user.name}</p>
              <p className="truncate text-caption text-ink-secondary">{user.email}</p>
            </div>
          </div>
          <LinkButton to={user.role === 'customer' ? '/account' : roleHome(user.role)} onClick={onClose} size="md" fullWidth className="mt-3.5 rounded-full" leftIcon={user.role === 'customer' ? 'user' : 'dashboard'}>
            {user.role === 'customer' ? 'My account' : `${ROLES[user.role].short} dashboard`}
          </LinkButton>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-600),var(--color-highlight-600))] p-4 text-white">
          <span className="dot-grid absolute inset-0 opacity-10" aria-hidden />
          <p className="relative text-title font-bold">Welcome to Servio</p>
          <p className="relative mt-0.5 text-body-sm text-white/80">Book trusted pros in minutes.</p>
          <div className="relative mt-3.5 grid grid-cols-2 gap-2">
            <LinkButton to="/signup" onClick={onClose} variant="white" size="md" className="rounded-full">
              Create account
            </LinkButton>
            <Link to="/login" onClick={onClose} className="focus-ring inline-flex h-11 items-center justify-center rounded-full font-semibold ring-1 ring-white/50 hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl border border-border/70 px-3 py-2.5">
        <CityPicker />
      </div>

      <Group items={BROWSE} onNavigate={onClose} />
      {user?.role === 'customer' ? <Group title="Your account" items={CUSTOMER} onNavigate={onClose} /> : null}
      <Group title="Work with Servio" items={user ? WORK.slice(0, 2) : WORK} onNavigate={onClose} />
      <Group items={[{ to: '/account/support', label: 'Help & support', icon: 'headset' }]} onNavigate={onClose} />

      {user ? (
        <button type="button" onClick={() => (onClose(), signOut())} className="focus-ring mb-2 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-medium text-danger-600 hover:bg-danger-50">
          <Icon name="logout" size={19} />
          Sign out
        </button>
      ) : null}
    </Modal>
  );
}

import { NavLink, Outlet } from 'react-router';
import { useNotifications } from '@/hooks/api';
import { useSignOut } from '@/hooks/useSignOut';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, cn, Icon, type IconName } from '../ui';

const groups: { title: string; items: { to: string; label: string; icon: IconName; end?: boolean }[] }[] = [
  {
    title: 'Bookings',
    items: [
      { to: '/account', label: 'Overview', icon: 'dashboard', end: true },
      { to: '/bookings', label: 'My bookings', icon: 'calendar' },
      { to: '/account/messages', label: 'Messages', icon: 'chats' },
      { to: '/account/notifications', label: 'Notifications', icon: 'bell' },
    ],
  },
  {
    title: 'My account',
    items: [
      { to: '/account/addresses', label: 'Saved addresses', icon: 'pin' },
      { to: '/account/wallet', label: 'Wallet & payments', icon: 'wallet' },
      { to: '/account/favorites', label: 'Favourites', icon: 'heart' },
      { to: '/account/refer', label: 'Refer & earn', icon: 'gift' },
    ],
  },
  {
    title: 'Support & settings',
    items: [
      { to: '/account/support', label: 'Help & support', icon: 'help' },
      { to: '/account/profile', label: 'Edit profile', icon: 'pencil' },
      { to: '/account/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

/** Customer account area: a sidebar of account sections on desktop, full-width pages on phones. */
export function AccountLayout() {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOut();
  const unread = useNotifications().data?.filter((n) => !n.read).length ?? 0;
  return (
    <div className="container-page py-4 lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8 lg:py-8">
      <aside className="hidden lg:block" aria-label="Account sections">
        <div className="sticky top-24 flex flex-col gap-5">
          {user ? (
            <div className="flex items-center gap-3 rounded-card border border-border/80 bg-surface p-3 shadow-sm">
              <Avatar src={user.avatar} name={user.name} size={42} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-caption text-ink-muted">{user.email}</p>
              </div>
            </div>
          ) : null}
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <p className="mb-1.5 px-3 text-caption font-semibold text-ink-muted">{g.title}</p>
              <ul className="flex flex-col gap-0.5">
                {g.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      end={it.end}
                      className={({ isActive }) => cn('focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors', isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-secondary hover:bg-surface hover:text-ink')}
                    >
                      <Icon name={it.icon} size={17} />
                      <span className="flex-1">{it.label}</span>
                      {it.to === '/account/notifications' && unread ? <span className="rounded-full bg-primary-500 px-1.5 text-2xs font-bold text-white">{unread}</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <button type="button" onClick={signOut} className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium text-danger-600 hover:bg-danger-50">
            <Icon name="logout" size={17} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

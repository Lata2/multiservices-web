import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { ROLES } from '@/constants/roles';
import { useNotifications } from '@/hooks/api';
import { useSignOut } from '@/hooks/useSignOut';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/models';
import { Avatar, cn, Icon, IconButton, type IconName } from '../ui';
import { BottomTabs, type TabItem } from './BottomTabs';
import { Logo } from './Logo';

export interface NavGroup {
  title?: string;
  items: { to: string; label: string; icon: IconName; badge?: number; end?: boolean }[];
}

export interface DashboardConfig {
  role: Exclude<Role, 'customer'>;
  groups: NavGroup[];
  tabs: TabItem[];
}

/**
 * Shell for the provider, delivery-partner and admin consoles: a grouped sidebar on desktop
 * and the app's bottom tab bar on phones/tablets (shown on the tab root pages).
 */
export function DashboardLayout({ config }: { config: DashboardConfig }) {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const unread = useNotifications().data?.filter((n) => !n.read).length ?? 0;
  const tabRoot = config.tabs.some((t) => t.to === pathname);
  const base = `/${config.role}`;

  return (
    <div className={cn('min-h-dvh lg:grid lg:grid-cols-[264px_minmax(0,1fr)]', tabRoot && 'max-lg:[--bottom-nav-h:calc(64px+env(safe-area-inset-bottom))]')}>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface lg:flex" aria-label={`${ROLES[config.role].title} navigation`}>
        <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
          <Logo to={base} subtitle={ROLES[config.role].title} />
          <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" size="sm" badge={unread} onClick={() => navigate(`${base}/notifications`)} />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {config.groups.map((g, gi) => (
            <div key={g.title ?? gi} className="mt-3 first:mt-0">
              {g.title ? <p className="mb-1 px-3 text-caption font-semibold text-ink-muted">{g.title}</p> : null}
              <ul className="flex flex-col gap-0.5">
                {g.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      end={it.end ?? it.to === base}
                      className={({ isActive }) => cn('focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors', isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-secondary hover:bg-surface-muted hover:text-ink')}
                    >
                      <Icon name={it.icon} size={17} />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge ? <span className="rounded-full bg-danger-500 px-1.5 text-2xs font-bold text-white">{it.badge}</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3 border-t border-border p-4">
            <Avatar src={user.avatar} name={user.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold">{user.name}</p>
              <p className="truncate text-caption text-ink-muted">{user.email}</p>
            </div>
            <IconButton icon="logout" label="Sign out" variant="plain" size="sm" onClick={signOut} />
          </div>
        ) : null}
      </aside>
      <main id="main" className="min-w-0">
        <div className="mx-auto w-full max-w-[1160px] px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
      {tabRoot ? <BottomTabs tabs={config.tabs} /> : null}
    </div>
  );
}

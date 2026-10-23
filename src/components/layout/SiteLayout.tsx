import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useCallback, useId, useState } from 'react';
import { roleHome } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { useCategories, useNotifications } from '@/hooks/api';
import { useSignOut } from '@/hooks/useSignOut';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { Avatar, cn, Icon, IconButton, LinkButton, SearchBar, type IconName } from '../ui';
import { BottomTabs } from './BottomTabs';
import { CityPicker } from './CityPicker';
import { Logo } from './Logo';
import { Menu } from './Menu';
import { NavDrawer } from './NavDrawer';

const TAB_ROOTS = ['/', '/explore', '/bookings', '/cart', '/account'];
/** Public browsing pages keep the site header (menu + sign in) on phones too. */
const BROWSE_ROUTES = /^\/(category|services|professionals|offers|service)(\/|$)/;

function useCartCount() {
  return useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
}

function HeaderSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <SearchBar
      value={q}
      onChange={setQ}
      placeholder="Search for ‘AC service’, ‘deep cleaning’…"
      onSubmit={() => q.trim() && navigate(`/search?q=${encodeURIComponent(q.trim())}`)}
      className="w-full max-w-md shadow-none"
    />
  );
}

function UserMenu() {
  const user = useAuthStore((s) => s.user)!;
  const signOut = useSignOut();
  const items: { to: string; label: string; icon: IconName }[] = [
    { to: '/account', label: 'My account', icon: 'user' },
    { to: '/bookings', label: 'My bookings', icon: 'calendar' },
    { to: '/account/wallet', label: 'Wallet', icon: 'wallet' },
    { to: '/account/favorites', label: 'Favourites', icon: 'heart' },
    { to: '/account/messages', label: 'Messages', icon: 'chats' },
    { to: '/account/support', label: 'Help & support', icon: 'help' },
  ];
  return (
    <Menu
      label="Account menu"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-expanded={open} aria-haspopup="menu" className="focus-ring flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 hover:border-primary-300">
          <Avatar src={user.avatar} name={user.name} size={30} />
          <span className="max-w-28 truncate text-body-sm font-semibold">{user.name.split(' ')[0]}</span>
          <Icon name="chevron-down" size={14} className="text-ink-muted" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="border-b border-border px-3 pb-2.5 pt-2">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-caption text-ink-muted">{user.email}</p>
          </div>
          <div className="py-1">
            {items.map((it) => (
              <Link key={it.to} to={it.to} role="menuitem" onClick={close} className="focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-body-sm hover:bg-surface-muted">
                <Icon name={it.icon} size={16} className="text-ink-secondary" />
                {it.label}
              </Link>
            ))}
          </div>
          <button type="button" role="menuitem" onClick={() => (close(), signOut())} className="focus-ring flex w-full items-center gap-3 rounded-md border-t border-border px-3 py-2.5 text-body-sm text-danger-600 hover:bg-danger-50">
            <Icon name="logout" size={16} />
            Sign out
          </button>
        </>
      )}
    </Menu>
  );
}

function SiteHeader({ mobileVisible }: { mobileVisible: boolean }) {
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartCount();
  const notifications = useNotifications();
  const unread = user?.role === 'customer' ? (notifications.data?.filter((n) => !n.read).length ?? 0) : 0;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn('focus-ring rounded-full px-3.5 py-2 text-body-sm font-semibold transition-colors', isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-secondary hover:bg-surface-muted hover:text-ink');

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/60 bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/75', !mobileVisible && 'max-lg:hidden')}>
      <div className="container-page flex h-16 items-center gap-2 sm:gap-3 xl:gap-5">
        <IconButton icon="menu" label="Open menu" variant="plain" onClick={() => setMenuOpen(true)} className="-ml-2 xl:hidden" aria-haspopup="dialog" aria-expanded={menuOpen} />
        <Logo className="hidden sm:flex" />
        <div className="flex min-w-0 flex-1 items-center sm:hidden">
          <CityPicker className="min-w-0 max-w-full" />
        </div>
        <div className="hidden min-w-0 sm:block lg:shrink-0">
          <CityPicker compact className="max-w-[160px]" />
        </div>
        <div className="hidden min-w-0 flex-1 lg:flex">
          <HeaderSearch />
        </div>
        <div className="hidden flex-1 sm:block lg:hidden" />
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          <NavLink to="/explore" className={navCls}>
            Explore
          </NavLink>
          <NavLink to="/professionals" className={navCls}>
            Professionals
          </NavLink>
          <NavLink to="/offers" className={navCls}>
            Offers
          </NavLink>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <IconButton icon="search" label="Search" variant="outline" className={cn('lg:hidden', !user && 'max-[379px]:hidden')} onClick={() => navigate('/search')} />
          {user?.role === 'customer' ? (
            <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" badge={unread} onClick={() => navigate('/account/notifications')} />
          ) : null}
          <IconButton icon="cart" label={`Cart${cartCount ? `, ${cartCount} items` : ''}`} variant="outline" badge={cartCount} onClick={() => navigate('/cart')} className="hidden lg:inline-flex" />
          {user?.role === 'customer' ? (
            <div className="hidden lg:block">
              <UserMenu />
            </div>
          ) : user ? (
            <LinkButton to={roleHome(user.role)} size="sm" leftIcon="dashboard" className="rounded-full">
              <span className="hidden sm:inline">{ROLES[user.role].short} dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm" className="rounded-full px-2.5 max-sm:h-9 sm:px-3">
                Sign in
              </LinkButton>
              <LinkButton to="/signup" size="sm" className="rounded-full max-sm:h-9 max-sm:px-3.5">
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Create account</span>
              </LinkButton>
            </>
          )}
        </div>
      </div>
      <NavDrawer open={menuOpen} onClose={closeMenu} />
    </header>
  );
}

function FooterGroup({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <nav aria-label={title} className="border-b border-white/10 md:border-0">
      <h2 className="text-body-sm font-semibold text-white">
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="focus-ring flex min-h-12 w-full items-center justify-between rounded md:pointer-events-none md:min-h-0 md:pb-3">
          {title}
          <Icon name="chevron-down" size={16} className={cn('text-white/60 transition-transform md:hidden', open && 'rotate-180')} />
        </button>
      </h2>
      <ul id={id} className={cn('flex-col gap-2.5 pb-4 text-body-sm md:flex md:pb-0', open ? 'flex' : 'hidden')}>
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="focus-ring inline-block rounded py-0.5 text-white/65 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SiteFooter() {
  const cats = useCategories(null);
  const [year] = useState(() => new Date().getFullYear());
  return (
    <footer className="relative mt-16 overflow-hidden bg-neutral-900 text-white">
      <span className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" aria-hidden />
      <div className="container-page relative grid gap-8 pb-8 pt-12 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:gap-10 md:py-14">
        <div className="max-w-sm">
          <Logo light />
          <p className="mt-4 text-body-sm text-white/65">Trusted pros for every corner of your home.</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ['shield-check', 'Verified pros'],
                ['tag', 'Upfront prices'],
                ['repeat', '7-day re-work'],
              ] as [IconName, string][]
            ).map(([icon, label]) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-caption font-medium text-white/80 ring-1 ring-white/10">
                <Icon name={icon} size={13} className="text-accent-300" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:contents">
          <FooterGroup title="Services" links={(cats.data ?? []).slice(0, 6).map((c) => ({ to: `/category/${c.id}`, label: c.name }))} />
          <FooterGroup
            title="Work with us"
            links={[
              { to: '/signup?role=provider', label: 'Become a provider' },
              { to: '/signup?role=delivery', label: 'Become a delivery partner' },
              { to: '/login?role=provider', label: 'Partner sign in' },
              { to: '/login?role=admin', label: 'Admin console' },
            ]}
          />
          <FooterGroup
            title="Company"
            links={[
              { to: '/legal/about', label: 'About Servio' },
              { to: '/offers', label: 'Offers' },
              { to: '/account/support', label: 'Help & support' },
              { to: '/legal/terms', label: 'Terms' },
              { to: '/legal/privacy', label: 'Privacy' },
            ]}
          />
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col gap-1 py-5 text-caption text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Servio Technologies</p>
          <p>Prices include all charges · GST invoice on every booking</p>
        </div>
      </div>
    </footer>
  );
}

/** Public website + customer area shell: header, footer and the app's bottom tabs on phones. */
export function SiteLayout() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartCount();
  const tabRoot = TAB_ROOTS.includes(pathname);
  // App-like private flows hide the marketing footer on phones.
  const privateRoute = /^\/(account|bookings|checkout|booking-success|cart)/.test(pathname);
  return (
    <div className={cn('flex min-h-dvh flex-col', tabRoot && 'max-lg:[--bottom-nav-h:calc(64px+env(safe-area-inset-bottom))]')}>
      <SiteHeader mobileVisible={tabRoot || BROWSE_ROUTES.test(pathname)} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <div className={cn(tabRoot && 'max-lg:pb-20', privateRoute && 'max-lg:hidden')}>
        <SiteFooter />
      </div>
      {tabRoot ? (
        <BottomTabs
          tabs={[
            { to: '/', label: 'Home', icon: 'home' },
            { to: '/explore', label: 'Explore', icon: 'compass' },
            { to: '/bookings', label: 'Bookings', icon: 'calendar' },
            { to: '/cart', label: 'Cart', icon: 'cart', badge: cartCount },
            user ? { to: '/account', label: 'Account', icon: 'user', end: false } : { to: '/login', label: 'Sign in', icon: 'user' },
          ]}
        />
      ) : null}
    </div>
  );
}

/** Standard page body inside the site shell. */
export function PageBody({ children, className, narrow }: { children: React.ReactNode; className?: string; narrow?: boolean }) {
  return <div className={cn('container-page py-4 lg:py-8', narrow && 'max-w-[calc(var(--container-narrow)+64px)]', className)}>{children}</div>;
}

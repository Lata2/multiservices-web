import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
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

const TAB_ROOTS = ['/', '/explore', '/bookings', '/cart', '/account'];

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
  const navCls = ({ isActive }: { isActive: boolean }) => cn('focus-ring rounded-md px-3 py-2 text-body-sm font-semibold transition-colors', isActive ? 'text-primary-600' : 'text-ink-secondary hover:text-ink');

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur', !mobileVisible && 'max-lg:hidden')}>
      <div className="container-page flex h-16 items-center gap-3 lg:gap-6">
        <Logo className="hidden lg:flex" />
        <div className="flex min-w-0 flex-1 items-center lg:hidden">
          <CityPicker />
        </div>
        <div className="hidden lg:block">
          <CityPicker compact />
        </div>
        <div className="hidden flex-1 lg:flex">
          <HeaderSearch />
        </div>
        <nav aria-label="Main" className="hidden items-center xl:flex">
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
        <div className="flex items-center gap-2">
          <IconButton icon="search" label="Search" variant="outline" className="lg:hidden" onClick={() => navigate('/search')} />
          {user?.role === 'customer' ? (
            <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" badge={unread} onClick={() => navigate('/account/notifications')} />
          ) : null}
          <IconButton icon="cart" label={`Cart${cartCount ? `, ${cartCount} items` : ''}`} variant="outline" badge={cartCount} onClick={() => navigate('/cart')} className="hidden lg:inline-flex" />
          {user?.role === 'customer' ? (
            <div className="hidden lg:block">
              <UserMenu />
            </div>
          ) : user ? (
            <LinkButton to={roleHome(user.role)} size="sm" leftIcon="dashboard" className="hidden sm:inline-flex">
              {ROLES[user.role].short} dashboard
            </LinkButton>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <LinkButton to="/login" variant="ghost" size="sm">
                Sign in
              </LinkButton>
              <LinkButton to="/signup" size="sm">
                Create account
              </LinkButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  const cats = useCategories(null);
  const [year] = useState(() => new Date().getFullYear());
  const col = 'flex flex-col gap-2.5 text-body-sm';
  const link = 'focus-ring w-fit rounded text-white/70 hover:text-white';
  return (
    <footer className="mt-16 bg-neutral-900 text-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-4 text-body-sm text-white/70">Trusted professionals for cleaning, repairs, beauty, laundry and car care — booked in a tap, with upfront prices and a 7-day re-work guarantee.</p>
        </div>
        <nav aria-label="Popular services" className={col}>
          <h2 className="mb-1 text-body-sm font-semibold text-white">Popular services</h2>
          {cats.data?.slice(0, 6).map((c) => (
            <Link key={c.id} to={`/category/${c.id}`} className={link}>
              {c.name}
            </Link>
          ))}
        </nav>
        <nav aria-label="Work with Servio" className={col}>
          <h2 className="mb-1 text-body-sm font-semibold text-white">Work with Servio</h2>
          <Link to="/signup?role=provider" className={link}>
            Become a service provider
          </Link>
          <Link to="/signup?role=delivery" className={link}>
            Become a delivery partner
          </Link>
          <Link to="/login?role=provider" className={link}>
            Provider sign in
          </Link>
          <Link to="/login?role=admin" className={link}>
            Admin console
          </Link>
        </nav>
        <nav aria-label="Company" className={col}>
          <h2 className="mb-1 text-body-sm font-semibold text-white">Company</h2>
          <Link to="/legal/about" className={link}>
            About Servio
          </Link>
          <Link to="/offers" className={link}>
            Offers & coupons
          </Link>
          <Link to="/account/support" className={link}>
            Help & support
          </Link>
          <Link to="/legal/terms" className={link}>
            Terms of Service
          </Link>
          <Link to="/legal/privacy" className={link}>
            Privacy Policy
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-caption text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Servio Technologies. All rights reserved.</p>
          <p>Prices include all charges · GST invoices on every booking</p>
        </div>
      </div>
    </footer>
  );
}

/** Public website + customer area shell: header, footer and the app's bottom tabs on phones. */
export function SiteLayout() {
  const { pathname } = useLocation();
  const cartCount = useCartCount();
  const tabRoot = TAB_ROOTS.includes(pathname);
  // App-like private flows hide the marketing footer on phones.
  const privateRoute = /^\/(account|bookings|checkout|booking-success|cart)/.test(pathname);
  return (
    <div className={cn('flex min-h-dvh flex-col', tabRoot && 'max-lg:[--bottom-nav-h:calc(64px+env(safe-area-inset-bottom))]')}>
      <SiteHeader mobileVisible={tabRoot} />
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
            { to: '/account', label: 'Account', icon: 'user', end: false },
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

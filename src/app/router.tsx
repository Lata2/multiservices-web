import type { ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { AccountLayout } from '@/components/layout/AccountLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminConsole, DeliveryConsole, ProviderConsole } from '@/components/layout/Consoles';
import { GuestOnly, RequireRole } from '@/components/layout/Guards';
import { RootLayout } from '@/components/layout/RootLayout';
import { NotFoundPage, RouteError } from '@/components/layout/RouteError';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { navigation } from './navigation';

/** Route-level code splitting: every page is its own chunk, loaded on navigation. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });
const r = (path: string, load: () => Promise<{ default: ComponentType }>): RouteObject => ({ path, lazy: page(load) });

/** Screens every signed-in role has under its base path. */
const sharedRoutes = (opts: { chat?: boolean; supportHome?: boolean } = {}): RouteObject[] => [
  r('notifications', () => import('@/pages/shared/Notifications')),
  ...(opts.chat ? [r('messages', () => import('@/pages/shared/ChatList')), r('messages/:id', () => import('@/pages/shared/ChatRoom'))] : []),
  ...(opts.supportHome !== false ? [r('support', () => import('@/pages/shared/SupportHome')), r('support/new', () => import('@/pages/shared/NewTicket'))] : []),
  r('support/:id', () => import('@/pages/shared/TicketDetail')),
  r('profile', () => import('@/pages/shared/EditProfile')),
  r('password', () => import('@/pages/shared/ChangePassword')),
  r('settings', () => import('@/pages/shared/Settings')),
];

const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <SiteLayout />,
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('@/pages/public/Home')) },
          r('explore', () => import('@/pages/public/Explore')),
          r('category/:id', () => import('@/pages/public/Category')),
          r('services', () => import('@/pages/public/Services')),
          r('search', () => import('@/pages/public/Search')),
          r('service/:id', () => import('@/pages/public/ServiceDetail')),
          r('professionals', () => import('@/pages/public/Providers')),
          r('professionals/:id', () => import('@/pages/public/ProviderProfile')),
          r('offers', () => import('@/pages/public/Offers')),
          r('legal/:doc', () => import('@/pages/public/Legal')),
          r('cart', () => import('@/pages/customer/Cart')),
          {
            element: <RequireRole role="customer" />,
            children: [
              r('checkout/schedule', () => import('@/pages/customer/Schedule')),
              r('checkout', () => import('@/pages/customer/Checkout')),
              r('booking-success/:id', () => import('@/pages/customer/BookingSuccess')),
              r('bookings/:id', () => import('@/pages/customer/BookingDetail')),
              r('bookings/:id/review', () => import('@/pages/customer/Review')),
              r('bookings/:id/invoice', () => import('@/pages/customer/Invoice')),
              {
                element: <AccountLayout />,
                children: [
                  r('bookings', () => import('@/pages/customer/Bookings')),
                  {
                    path: 'account',
                    children: [
                      { index: true, lazy: page(() => import('@/pages/customer/AccountHome')) },
                      r('addresses', () => import('@/pages/customer/Addresses')),
                      r('addresses/new', () => import('@/pages/customer/AddressForm')),
                      r('addresses/:id', () => import('@/pages/customer/AddressForm')),
                      r('wallet', () => import('@/pages/customer/Wallet')),
                      r('favorites', () => import('@/pages/customer/Favorites')),
                      r('refer', () => import('@/pages/customer/Refer')),
                      ...sharedRoutes({ chat: true }),
                    ],
                  },
                ],
              },
            ],
          },
          ...(import.meta.env.DEV ? [r('__gallery', () => import('@/pages/dev/Gallery'))] : []),
          { path: '*', Component: NotFoundPage },
        ],
      },
      {
        element: <GuestOnly />,
        children: [
          {
            element: <AuthLayout />,
            errorElement: <RouteError />,
            children: [
              r('welcome', () => import('@/pages/auth/Welcome')),
              r('login', () => import('@/pages/auth/Login')),
              r('login/otp', () => import('@/pages/auth/Otp')),
              r('signup', () => import('@/pages/auth/Signup')),
              r('forgot-password', () => import('@/pages/auth/ForgotPassword')),
            ],
          },
        ],
      },
      {
        path: 'provider',
        element: (
          <RequireRole role="provider">
            <ProviderConsole />
          </RequireRole>
        ),
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('@/pages/provider/Dashboard')) },
          r('bookings', () => import('@/pages/provider/Bookings')),
          r('bookings/:id', () => import('@/pages/provider/BookingDetail')),
          r('services', () => import('@/pages/provider/Services')),
          r('services/new', () => import('@/pages/provider/ServiceForm')),
          r('services/:id/edit', () => import('@/pages/provider/ServiceForm')),
          r('availability', () => import('@/pages/provider/Availability')),
          r('reviews', () => import('@/pages/provider/Reviews')),
          r('earnings', () => import('@/pages/provider/Earnings')),
          r('business', () => import('@/pages/provider/Business')),
          r('documents', () => import('@/pages/provider/Documents')),
          r('promos', () => import('@/pages/shared/PromoList')),
          r('promos/new', () => import('@/pages/shared/PromoForm')),
          r('promos/:id/edit', () => import('@/pages/shared/PromoForm')),
          r('account', () => import('@/pages/provider/Account')),
          ...sharedRoutes({ chat: true }),
          { path: '*', Component: NotFoundPage },
        ],
      },
      {
        path: 'delivery',
        element: (
          <RequireRole role="delivery">
            <DeliveryConsole />
          </RequireRole>
        ),
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('@/pages/delivery/Home')) },
          r('history', () => import('@/pages/delivery/History')),
          r('tasks/:id', () => import('@/pages/delivery/TaskDetail')),
          r('earnings', () => import('@/pages/delivery/Earnings')),
          r('vehicle', () => import('@/pages/delivery/Vehicle')),
          r('account', () => import('@/pages/delivery/Account')),
          ...sharedRoutes(),
          { path: '*', Component: NotFoundPage },
        ],
      },
      {
        path: 'admin',
        element: (
          <RequireRole role="admin">
            <AdminConsole />
          </RequireRole>
        ),
        errorElement: <RouteError />,
        children: [
          { index: true, lazy: page(() => import('@/pages/admin/Dashboard')) },
          r('bookings', () => import('@/pages/admin/Bookings')),
          r('bookings/:id', () => import('@/pages/admin/BookingDetail')),
          r('providers', () => import('@/pages/admin/Providers')),
          r('providers/:id', () => import('@/pages/admin/ProviderDetail')),
          r('users', () => import('@/pages/admin/Users')),
          r('users/:id', () => import('@/pages/admin/UserDetail')),
          r('more', () => import('@/pages/admin/More')),
          r('categories', () => import('@/pages/admin/Categories')),
          r('partners', () => import('@/pages/admin/Partners')),
          r('payouts', () => import('@/pages/admin/Payouts')),
          r('support', () => import('@/pages/admin/Support')),
          r('promos', () => import('@/pages/shared/PromoList')),
          r('promos/new', () => import('@/pages/shared/PromoForm')),
          r('promos/:id/edit', () => import('@/pages/shared/PromoForm')),
          r('banners', () => import('@/pages/admin/Banners')),
          r('reviews', () => import('@/pages/admin/Reviews')),
          r('platform', () => import('@/pages/admin/Platform')),
          r('cities', () => import('@/pages/admin/Cities')),
          r('broadcast', () => import('@/pages/admin/Broadcast')),
          r('reports', () => import('@/pages/admin/Reports')),
          ...sharedRoutes({ supportHome: false }),
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
navigation.set((to, opts) => void router.navigate(to, opts));

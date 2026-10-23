import { useAdminDashboard, useDeliveryHome, useProviderBookings } from '@/hooks/api';
import { DashboardLayout } from './DashboardLayout';

export function ProviderConsole() {
  const requests = useProviderBookings('requests').data?.length;
  return (
    <DashboardLayout
      config={{
        role: 'provider',
        groups: [
          {
            items: [
              { to: '/provider', label: 'Dashboard', icon: 'dashboard' },
              { to: '/provider/bookings', label: 'Bookings', icon: 'calendar', badge: requests },
              { to: '/provider/services', label: 'My services', icon: 'wrench' },
              { to: '/provider/earnings', label: 'Earnings', icon: 'wallet' },
            ],
          },
          {
            title: 'Business',
            items: [
              { to: '/provider/availability', label: 'Availability & slots', icon: 'clock' },
              { to: '/provider/promos', label: 'Promo codes', icon: 'tags' },
              { to: '/provider/reviews', label: 'Ratings & reviews', icon: 'star' },
              { to: '/provider/business', label: 'Business profile', icon: 'store' },
              { to: '/provider/documents', label: 'Documents', icon: 'document' },
            ],
          },
          {
            title: 'Activity',
            items: [
              { to: '/provider/messages', label: 'Customer messages', icon: 'chats' },
              { to: '/provider/notifications', label: 'Notifications', icon: 'bell' },
            ],
          },
          {
            title: 'Account',
            items: [
              { to: '/provider/account', label: 'Account', icon: 'user' },
              { to: '/provider/support', label: 'Help & support', icon: 'help' },
              { to: '/provider/settings', label: 'Settings', icon: 'settings' },
            ],
          },
        ],
        tabs: [
          { to: '/provider', label: 'Dashboard', icon: 'dashboard' },
          { to: '/provider/bookings', label: 'Bookings', icon: 'calendar', badge: requests },
          { to: '/provider/services', label: 'Services', icon: 'wrench' },
          { to: '/provider/earnings', label: 'Earnings', icon: 'wallet' },
          { to: '/provider/account', label: 'Account', icon: 'user' },
        ],
      }}
    />
  );
}

export function DeliveryConsole() {
  const active = useDeliveryHome().data?.active.length;
  return (
    <DashboardLayout
      config={{
        role: 'delivery',
        groups: [
          {
            items: [
              { to: '/delivery', label: 'Tasks', icon: 'bike', badge: active },
              { to: '/delivery/history', label: 'History', icon: 'clock' },
              { to: '/delivery/earnings', label: 'Earnings & payouts', icon: 'wallet' },
              { to: '/delivery/vehicle', label: 'Vehicle & documents', icon: 'id-card' },
            ],
          },
          {
            title: 'Account',
            items: [
              { to: '/delivery/notifications', label: 'Notifications', icon: 'bell' },
              { to: '/delivery/account', label: 'Account', icon: 'user' },
              { to: '/delivery/support', label: 'Help & support', icon: 'help' },
              { to: '/delivery/settings', label: 'Settings', icon: 'settings' },
            ],
          },
        ],
        tabs: [
          { to: '/delivery', label: 'Tasks', icon: 'bike', badge: active },
          { to: '/delivery/history', label: 'History', icon: 'clock' },
          { to: '/delivery/earnings', label: 'Earnings', icon: 'wallet' },
          { to: '/delivery/account', label: 'Account', icon: 'user' },
        ],
      }}
    />
  );
}

export function AdminConsole() {
  const d = useAdminDashboard().data;
  return (
    <DashboardLayout
      config={{
        role: 'admin',
        groups: [
          {
            items: [
              { to: '/admin', label: 'Overview', icon: 'gauge' },
              { to: '/admin/bookings', label: 'Bookings', icon: 'receipt' },
              { to: '/admin/providers', label: 'Providers', icon: 'store', badge: d?.pendingProviders },
              { to: '/admin/users', label: 'Users', icon: 'users' },
            ],
          },
          {
            title: 'Catalogue',
            items: [
              { to: '/admin/categories', label: 'Categories', icon: 'grid' },
              { to: '/admin/promos', label: 'Promo codes', icon: 'tags' },
              { to: '/admin/banners', label: 'Home banners', icon: 'images' },
              { to: '/admin/reviews', label: 'Review moderation', icon: 'star' },
            ],
          },
          {
            title: 'Operations',
            items: [
              { to: '/admin/partners', label: 'Delivery partners', icon: 'bike', badge: d?.pendingPartners },
              { to: '/admin/payouts', label: 'Payouts', icon: 'cash', badge: d?.pendingPayouts },
              { to: '/admin/support', label: 'Support tickets', icon: 'chats', badge: d?.openTickets },
              { to: '/admin/broadcast', label: 'Broadcast', icon: 'megaphone' },
              { to: '/admin/reports', label: 'Reports', icon: 'chart' },
            ],
          },
          {
            title: 'Platform',
            items: [
              { to: '/admin/platform', label: 'Platform settings', icon: 'sliders' },
              { to: '/admin/cities', label: 'Cities', icon: 'building' },
              { to: '/admin/notifications', label: 'Notifications', icon: 'bell' },
              { to: '/admin/settings', label: 'Account settings', icon: 'settings' },
            ],
          },
        ],
        tabs: [
          { to: '/admin', label: 'Overview', icon: 'gauge' },
          { to: '/admin/bookings', label: 'Bookings', icon: 'receipt' },
          { to: '/admin/providers', label: 'Providers', icon: 'store', badge: d?.pendingProviders },
          { to: '/admin/users', label: 'Users', icon: 'users' },
          { to: '/admin/more', label: 'More', icon: 'menu' },
        ],
      }}
    />
  );
}

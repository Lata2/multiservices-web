import { PageHeader } from '@/components/ui';
import { MenuSection, ProfileHeaderCard, SignOutButton } from '@/features/account';
import { useAdminDashboard } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function AdminMore() {
  usePageMeta({ title: 'Manage', noindex: true });
  const d = useAdminDashboard().data;
  return (
    <div className="max-w-4xl">
      <PageHeader title="Manage" />
      <ProfileHeaderCard />
      <div className="grid gap-x-5 lg:grid-cols-2">
        <MenuSection
          title="Catalogue"
          items={[
            { icon: 'grid', title: 'Categories', subtitle: 'Categories, sub-categories & commission', to: '/admin/categories' },
            { icon: 'tags', title: 'Promo codes', to: '/admin/promos' },
            { icon: 'images', title: 'Home banners', to: '/admin/banners' },
            { icon: 'star', title: 'Review moderation', to: '/admin/reviews' },
          ]}
        />
        <MenuSection
          title="Operations"
          items={[
            { icon: 'bike', title: 'Delivery partners', subtitle: d?.pendingPartners ? `${d.pendingPartners} awaiting approval` : undefined, to: '/admin/partners' },
            { icon: 'cash', title: 'Payouts', subtitle: d?.pendingPayouts ? `${d.pendingPayouts} requests pending` : 'Provider & partner withdrawals', to: '/admin/payouts' },
            { icon: 'chats', title: 'Support tickets', subtitle: d?.openTickets ? `${d.openTickets} open` : undefined, to: '/admin/support' },
            { icon: 'megaphone', title: 'Broadcast notification', to: '/admin/broadcast' },
            { icon: 'chart', title: 'Reports & analytics', to: '/admin/reports' },
          ]}
        />
        <MenuSection
          title="Platform"
          items={[
            { icon: 'sliders', title: 'Platform settings', subtitle: 'Tax, commission, payments', to: '/admin/platform' },
            { icon: 'building', title: 'Cities', subtitle: 'Multi-city operations', to: '/admin/cities' },
            { icon: 'bell', title: 'Notifications', to: '/admin/notifications' },
            { icon: 'settings', title: 'Account settings', to: '/admin/settings' },
          ]}
        />
      </div>
      <SignOutButton />
    </div>
  );
}

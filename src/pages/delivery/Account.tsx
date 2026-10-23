import { Badge, PageHeader } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { MenuSection, ProfileHeaderCard, SignOutButton } from '@/features/account';
import { useDeliveryProfile } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function DeliveryAccount() {
  usePageMeta({ title: 'Account', noindex: true });
  const p = useDeliveryProfile();
  const status = p.data ? PROVIDER_STATUS[p.data.status] : null;
  return (
    <div className="max-w-3xl">
      <PageHeader title="Account" />
      <ProfileHeaderCard />
      <MenuSection
        title="Partner"
        items={[
          { icon: 'bike', title: 'Vehicle & documents', subtitle: p.data ? `${p.data.vehicleType} · ${p.data.vehicleNumber}` : undefined, to: '/delivery/vehicle', right: status ? <Badge label={status.label} tone={status.tone} /> : undefined },
          { icon: 'chart', title: 'Performance & earnings', subtitle: p.data ? `${p.data.completedTasks} tasks · ${p.data.rating || 'New'}★` : undefined, to: '/delivery/earnings' },
          { icon: 'bell', title: 'Notifications', to: '/delivery/notifications' },
        ]}
      />
      <MenuSection
        title="Support & settings"
        items={[
          { icon: 'help', title: 'Help & support', to: '/delivery/support' },
          { icon: 'settings', title: 'Settings', to: '/delivery/settings' },
        ]}
      />
      <SignOutButton />
    </div>
  );
}

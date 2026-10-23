import { Badge, PageHeader } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { MenuSection, ProfileHeaderCard, SignOutButton } from '@/features/account';
import { useProviderProfile } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function ProviderAccount() {
  usePageMeta({ title: 'Account', noindex: true });
  const p = useProviderProfile();
  const status = p.data ? PROVIDER_STATUS[p.data.status] : null;
  const docsPending = p.data?.documents.filter((d) => d.status !== 'verified').length ?? 0;
  return (
    <div className="max-w-3xl">
      <PageHeader title="Account" />
      <ProfileHeaderCard />
      <div className="grid gap-x-5 lg:grid-cols-2">
        <MenuSection
          title="Business"
          items={[
            { icon: 'store', title: 'Business profile', subtitle: p.data?.businessName, to: '/provider/business', right: status ? <Badge label={status.label} tone={status.tone} /> : undefined },
            { icon: 'document', title: 'Documents & verification', subtitle: docsPending ? `${docsPending} pending` : 'All verified', to: '/provider/documents' },
            { icon: 'clock', title: 'Availability & slots', to: '/provider/availability' },
            { icon: 'tags', title: 'Promo codes', to: '/provider/promos' },
            { icon: 'star', title: 'Ratings & reviews', to: '/provider/reviews' },
          ]}
        />
        <div>
          <MenuSection
            title="Activity"
            items={[
              { icon: 'chats', title: 'Customer messages', to: '/provider/messages' },
              { icon: 'bell', title: 'Notifications', to: '/provider/notifications' },
            ]}
          />
          <MenuSection
            title="Support & settings"
            items={[
              { icon: 'help', title: 'Help & support', to: '/provider/support' },
              { icon: 'settings', title: 'Settings', to: '/provider/settings' },
            ]}
          />
        </div>
      </div>
      <SignOutButton />
    </div>
  );
}

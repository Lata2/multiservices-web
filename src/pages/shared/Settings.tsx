import { useState } from 'react';
import { Card, ConfirmDialog, Divider, PageHeader, SwitchRow } from '@/components/ui';
import { MenuSection } from '@/features/account';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { useSignOut } from '@/hooks/useSignOut';
import { authApi } from '@/services/api';
import { useAppStore } from '@/store/app.store';
import { toast } from '@/store/toast.store';

export default function Settings() {
  usePageMeta({ title: 'Settings', noindex: true });
  const { base, role } = useRoleBase();
  const prefs = useAppStore((s) => s.prefs);
  const setPref = useAppStore((s) => s.setPref);
  const signOut = useSignOut();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useApiMutation(() => authApi.deleteAccount(), {
    onSuccess: () => {
      setConfirmDelete(false);
      toast.success('Your account deletion request was received.');
      signOut();
    },
  });

  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title="Settings" back={base === '/account' ? '/account' : role === 'admin' ? '/admin/more' : `${base}/account`} />
      <h2 className="mb-2 ml-1 text-caption font-semibold text-ink-muted">Notifications</h2>
      <Card className="mb-5 py-1">
        <SwitchRow icon="calendar" title={role === 'customer' ? 'Booking updates' : 'Job & task alerts'} subtitle="Status changes and reminders" value={prefs.pushBookings} onChange={(v) => setPref('pushBookings', v)} />
        <Divider className="ml-14" />
        <SwitchRow icon="tag" title="Offers & promotions" subtitle="Deals and seasonal discounts" value={prefs.pushOffers} onChange={(v) => setPref('pushOffers', v)} />
        <Divider className="ml-14" />
        <SwitchRow icon="mail" title="Email updates" value={prefs.email} onChange={(v) => setPref('email', v)} />
        <Divider className="ml-14" />
        <SwitchRow icon="smartphone" title="SMS alerts" value={prefs.sms} onChange={(v) => setPref('sms', v)} />
      </Card>
      <MenuSection
        title="Security"
        items={[
          { icon: 'key', title: 'Change password', to: `${base}/password` },
          { icon: 'pencil', title: 'Edit profile', to: `${base}/profile` },
          { icon: 'language', title: 'Language', subtitle: 'English (India)', onClick: () => toast.info('More languages are coming soon.') },
        ]}
      />
      <MenuSection
        title="Legal"
        items={[
          { icon: 'document', title: 'Terms of Service', to: '/legal/terms' },
          { icon: 'shield', title: 'Privacy Policy', to: '/legal/privacy' },
          { icon: 'info', title: 'About Servio', to: '/legal/about' },
        ]}
      />
      {role !== 'admin' ? <MenuSection items={[{ icon: 'trash', title: 'Delete account', subtitle: 'Permanently remove your data', onClick: () => setConfirmDelete(true), danger: true }]} /> : null}
      <ConfirmDialog
        open={confirmDelete}
        tone="danger"
        icon="alert"
        title="Delete your account?"
        message="Your profile, booking history and wallet balance will be permanently removed after 30 days. This can’t be undone."
        confirmLabel="Delete account"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => del.mutate()}
      />
    </div>
  );
}

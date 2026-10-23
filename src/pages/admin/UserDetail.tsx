import { useState } from 'react';
import { useParams } from 'react-router';
import { BookingCard } from '@/components/domain';
import { ActionBar, Avatar, Badge, Button, Card, ConfirmDialog, ErrorState, KeyValue, LinkButton, LoadingState, PageHeader, SectionHeader, type BadgeTone } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import { useAdminUser } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { AccountStatus } from '@/types/models';
import { formatDate, formatMoney } from '@/utils/format';

const TONE: Record<AccountStatus, BadgeTone> = { active: 'success', pending: 'warning', blocked: 'danger', rejected: 'neutral' };

export default function AdminUserDetail() {
  const { id = '' } = useParams();
  const q = useAdminUser(id);
  const [confirm, setConfirm] = useState(false);
  const toggle = useApiMutation(() => adminApi.setUserStatus(id, q.data?.user.status === 'blocked' ? 'active' : 'blocked'), { invalidate: [qk.admin.all], successMessage: (u) => (u.status === 'blocked' ? 'User blocked' : 'User unblocked'), onSuccess: () => setConfirm(false) });
  usePageMeta({ title: q.data?.user.name ?? 'User', noindex: true });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <><PageHeader title="User" back="/admin/users" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></>;
  const { user: u, bookings } = q.data;
  const blocked = u.status === 'blocked';
  const spend = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.pricing.total, 0);
  const action =
    u.role !== 'admin' ? (
      <Button variant={blocked ? 'success' : 'danger'} leftIcon={blocked ? 'unlock' : 'ban'} fullWidth onClick={() => setConfirm(true)}>
        {blocked ? 'Unblock user' : 'Block user'}
      </Button>
    ) : null;

  return (
    <>
      <PageHeader title="User details" back="/admin/users" />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col items-center gap-2 text-center">
            <Avatar src={u.avatar} name={u.name} size={72} />
            <h2 className="text-h3 font-semibold">{u.name}</h2>
            <div className="flex gap-2">
              <Badge label={ROLES[u.role].title} tone="primary" />
              <Badge label={u.status} tone={TONE[u.status]} className="capitalize" />
            </div>
          </Card>
          <Card>
            <dl>
              <KeyValue label="Email" value={<span className="break-all">{u.email}</span>} />
              <KeyValue label="Phone" value={u.phone || '—'} />
              <KeyValue label="City" value={u.city ?? '—'} />
              <KeyValue label="Joined" value={formatDate(u.createdAt)} />
              {u.role === 'customer' ? <KeyValue label="Lifetime spend" value={formatMoney(spend)} bold /> : null}
            </dl>
          </Card>
          {u.profileId && u.role === 'provider' ? (
            <LinkButton to={`/admin/providers/${u.profileId}`} variant="secondary">
              Open provider profile
            </LinkButton>
          ) : null}
          {action ? <div className="hidden lg:block">{action}</div> : null}
        </aside>
        <section className="min-w-0">
          <SectionHeader title={u.role === 'customer' ? `Bookings (${bookings.length})` : 'Activity'} />
          {u.role !== 'customer' ? (
            <p className="text-ink-muted">Booking history is shown for customer accounts.</p>
          ) : bookings.length ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} perspective="customer" to={`/admin/bookings/${b.id}`} />
              ))}
            </div>
          ) : (
            <p className="text-ink-muted">No bookings yet.</p>
          )}
        </section>
      </div>
      {action ? (
        <div className="lg:hidden">
          <ActionBar>{action}</ActionBar>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirm}
        tone={blocked ? 'success' : 'danger'}
        icon={blocked ? 'unlock' : 'ban'}
        title={blocked ? `Unblock ${u.name}?` : `Block ${u.name}?`}
        message={blocked ? 'They’ll be able to sign in again.' : 'They’ll be signed out and unable to sign in or book.'}
        confirmLabel={blocked ? 'Unblock' : 'Block'}
        loading={toggle.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => toggle.mutate()}
      />
    </>
  );
}

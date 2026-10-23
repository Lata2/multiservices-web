import { useState } from 'react';
import { useNavigate } from 'react-router';
import { NotificationItem } from '@/components/domain';
import { Card, Chip, ChipRow, ConfirmDialog, EmptyState, ErrorState, IconButton, ListSkeleton, PageHeader } from '@/components/ui';
import { toWebHref } from '@/constants/routes';
import { useNotifications } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { notificationsApi } from '@/services/api';
import type { AppNotification } from '@/types/models';

const FILTERS: { key: 'all' | 'unread' | AppNotification['type']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'booking', label: 'Bookings' },
  { key: 'task', label: 'Tasks' },
  { key: 'payment', label: 'Payments' },
  { key: 'promo', label: 'Offers' },
  { key: 'review', label: 'Reviews' },
  { key: 'system', label: 'Updates' },
];

export default function NotificationsPage() {
  usePageMeta({ title: 'Notifications', noindex: true });
  const { base } = useRoleBase();
  const navigate = useNavigate();
  const q = useNotifications();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [confirmClear, setConfirmClear] = useState(false);
  const markRead = useApiMutation((id: string) => notificationsApi.markRead(id), { invalidate: [qk.notifications], silentError: true });
  const markAll = useApiMutation(() => notificationsApi.markAllRead(), { invalidate: [qk.notifications], successMessage: 'All caught up!' });
  const clear = useApiMutation(() => notificationsApi.clear(), { invalidate: [qk.notifications], successMessage: 'Notifications cleared', onSuccess: () => setConfirmClear(false) });

  const all = q.data ?? [];
  const types = new Set(all.map((n) => n.type));
  const filters = FILTERS.filter((f) => f.key === 'all' || f.key === 'unread' || types.has(f.key as AppNotification['type']));
  const list = all.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.type === filter));
  const unread = all.filter((n) => !n.read).length;

  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You’re all caught up'}
        back={base === '/account' ? '/account' : base}
        actions={
          <>
            <IconButton icon="check-double" label="Mark all as read" variant="plain" iconClassName="text-primary-600" onClick={() => markAll.mutate()} disabled={!unread} />
            <IconButton icon="trash" label="Clear all notifications" variant="plain" onClick={() => setConfirmClear(true)} disabled={!all.length} />
          </>
        }
      />
      <ChipRow className="mb-3" label="Filter notifications">
        {filters.map((f) => (
          <Chip key={f.key} label={f.label} selected={filter === f.key} onClick={() => setFilter(f.key)} count={f.key === 'unread' && unread ? unread : undefined} />
        ))}
      </ChipRow>
      {q.isPending ? (
        <ListSkeleton rows={6} height={72} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : list.length ? (
        <Card padded={false} className="p-1.5">
          <ul className="flex flex-col gap-1">
            {list.map((n) => (
              <li key={n.id}>
                <NotificationItem
                  item={n}
                  onOpen={() => {
                    if (!n.read) markRead.mutate(n.id);
                    if (n.href) navigate(toWebHref(n.href));
                  }}
                />
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState icon="bell-off" title={filter === 'all' ? 'No notifications yet' : 'Nothing here'} message="Booking updates, offers and payment alerts will show up here." />
      )}
      <ConfirmDialog open={confirmClear} tone="danger" icon="trash" title="Clear all notifications?" message="This can’t be undone." confirmLabel="Clear all" loading={clear.isPending} onCancel={() => setConfirmClear(false)} onConfirm={() => clear.mutate()} />
    </div>
  );
}

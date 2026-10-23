import { useNavigate } from 'react-router';
import { TaskCard } from '@/components/domain';
import { Avatar, Button, Card, cn, EmptyState, ErrorState, Icon, IconButton, LinkButton, ListSkeleton, SectionHeader, StatCard, Switch } from '@/components/ui';
import { useDeliveryHome, useNotifications } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { deliveryApi } from '@/services/api';
import { formatMoney } from '@/utils/format';

export default function DeliveryHome() {
  usePageMeta({ title: 'Tasks', noindex: true });
  const navigate = useNavigate();
  const q = useDeliveryHome();
  const unread = useNotifications().data?.filter((n) => !n.read).length ?? 0;
  const setOnline = useApiMutation((v: boolean) => deliveryApi.setOnline(v), { invalidate: [qk.delivery.all], successMessage: (p) => (p.online ? 'You’re online — tasks incoming' : 'You’re offline') });
  const accept = useApiMutation((id: string) => deliveryApi.accept(id), { invalidate: [qk.delivery.all], successMessage: 'Task accepted', onSuccess: (t) => navigate(`/delivery/tasks/${t.id}`) });
  const d = q.data;
  const online = d?.partner.online ?? false;

  return (
    <>
      <header className="flex items-center gap-3 pb-4">
        <Avatar src={d?.partner.avatar} name={d?.partner.name ?? 'Partner'} size={46} />
        <div className="min-w-0 flex-1">
          <p className="text-caption text-ink-muted">Delivery partner</p>
          <h1 className="truncate text-title font-bold lg:text-h2">{d?.partner.name ?? '…'}</h1>
        </div>
        <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" badge={unread} onClick={() => navigate('/delivery/notifications')} className="lg:hidden" />
      </header>

      <Card elevation="md" className={cn('mb-5 flex items-center gap-3', online ? 'border-success-500/40 bg-success-50' : '')}>
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', online ? 'bg-success-500 text-white' : 'bg-neutral-200 text-ink-secondary')}>
          <Icon name={online ? 'radio' : 'moon'} size={21} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{online ? 'You are online' : 'You are offline'}</p>
          <p className="text-caption text-ink-secondary">{online ? 'Receiving nearby pickup & drop tasks' : 'Go online to start receiving tasks'}</p>
        </div>
        <Switch checked={online} disabled={setOnline.isPending || !d} onChange={(v) => setOnline.mutate(v)} label="Online status" tone="success" />
      </Card>

      {d?.partner.status === 'pending' ? (
        <p className="mb-5 flex gap-3 rounded-card bg-warning-50 p-4 text-body-sm">
          <Icon name="hourglass" size={19} className="text-warning-600" />
          Your documents are under review. You can go online once an admin approves your account.
        </p>
      ) : null}

      {q.isPending ? (
        <ListSkeleton rows={3} height={150} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : d ? (
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Today’s earnings" value={formatMoney(d.todayEarnings)} icon="cash" tone="success" to="/delivery/earnings" />
            <StatCard label="Delivered today" value={`${d.todayCount}`} icon="check-double" />
            <StatCard label="Rating" value={d.partner.rating ? `${d.partner.rating}★` : 'New'} icon="star" tone="accent" />
          </div>
          <div className="grid gap-7 xl:grid-cols-2">
            <section>
              <SectionHeader title="Active tasks" />
              {d.active.length ? (
                <div className="flex flex-col gap-3">
                  {d.active.map((t) => (
                    <TaskCard key={t.id} task={t} to={`/delivery/tasks/${t.id}`} footer={<LinkButton to={`/delivery/tasks/${t.id}`} size="sm" rightIcon="arrow-right" fullWidth>{t.status === 'accepted' ? 'Go to pickup' : 'Complete delivery'}</LinkButton>} />
                  ))}
                </div>
              ) : (
                <Card>
                  <EmptyState compact icon="package" title="No active tasks" message="Accept a task to get started." />
                </Card>
              )}
            </section>
            <section>
              <SectionHeader title={`Available nearby${d.available.length ? ` (${d.available.length})` : ''}`} />
              {!online ? (
                <Card>
                  <EmptyState compact icon="power" title="You’re offline" message="Switch online to see tasks near you." />
                </Card>
              ) : d.available.length ? (
                <div className="flex flex-col gap-3">
                  {d.available.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      to={`/delivery/tasks/${t.id}`}
                      footer={
                        <Button variant="success" size="sm" leftIcon="check" fullWidth loading={accept.isPending && accept.variables === t.id} onClick={() => accept.mutate(t.id)}>
                          Accept · earn {formatMoney(t.fee)}
                        </Button>
                      }
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <EmptyState compact icon="search" title="No tasks right now" message="New pickups appear automatically every few seconds." />
                </Card>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

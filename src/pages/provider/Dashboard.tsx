import { Link, useNavigate } from 'react-router';
import { BookingCard } from '@/components/domain';
import { Avatar, BarChart, Card, EmptyState, ErrorState, Icon, IconButton, ListSkeleton, SectionHeader, StatCard, type IconName } from '@/components/ui';
import { RequestActions } from '@/features/RequestActions';
import { useNotifications, useProviderDashboard } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { compactNumber, formatMoney } from '@/utils/format';

export default function ProviderDashboard() {
  usePageMeta({ title: 'Provider dashboard', noindex: true });
  const navigate = useNavigate();
  const q = useProviderDashboard();
  const unread = useNotifications().data?.filter((n) => !n.read).length ?? 0;
  const d = q.data;

  return (
    <>
      <header className="flex items-center gap-3 pb-5">
        <Avatar src={d?.provider.avatar} name={d?.provider.businessName ?? 'Provider'} size={46} rounded="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-caption text-ink-muted">Welcome back</p>
          <h1 className="truncate text-title font-bold lg:text-h2">{d?.provider.businessName ?? '…'}</h1>
        </div>
        <IconButton icon="chats" label="Messages" variant="outline" onClick={() => navigate('/provider/messages')} className="lg:hidden" />
        <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" badge={unread} onClick={() => navigate('/provider/notifications')} className="lg:hidden" />
      </header>

      {d?.provider.status === 'pending' ? (
        <Link to="/provider/documents" className="focus-ring mb-5 flex gap-3 rounded-card border border-warning-500/40 bg-warning-50 p-4">
          <Icon name="hourglass" size={21} className="text-warning-600" />
          <span className="flex-1">
            <span className="block font-semibold">Verification in progress</span>
            <span className="block text-body-sm text-ink-secondary">Your profile isn’t visible to customers yet. Upload pending documents to speed things up.</span>
          </span>
          <Icon name="chevron-right" size={17} className="text-ink-muted" />
        </Link>
      ) : null}

      {q.isPending ? (
        <ListSkeleton rows={4} height={110} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : d ? (
        <div className="flex flex-col gap-7">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Today’s jobs" value={`${d.todayCount}`} icon="calendar" to="/provider/bookings?tab=upcoming" />
            <StatCard label="New requests" value={`${d.pendingCount}`} icon="mail" tone="accent" to="/provider/bookings" />
            <StatCard label="Earned this month" value={formatMoney(d.earnings.thisMonth)} icon="trending-up" tone="success" to="/provider/earnings" />
            <StatCard label={`Rating · ${d.provider.reviewCount} reviews`} value={d.provider.rating ? `${d.provider.rating.toFixed(1)} ★` : 'New'} icon="star" tone="highlight" to="/provider/reviews" />
          </div>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-caption text-ink-muted">Last 7 days</p>
                  <p className="text-h3 font-semibold">{formatMoney(d.earnings.series.reduce((s, x) => s + x.value, 0))}</p>
                </div>
                <Link to="/provider/earnings" className="focus-ring rounded text-body-sm font-semibold text-primary-600 hover:underline">
                  Earnings details
                </Link>
              </div>
              <BarChart data={d.earnings.series} format={(v) => `₹${compactNumber(v)}`} label="Earnings over the last 7 days" />
            </Card>
            <section>
              <SectionHeader title="Quick actions" />
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['plus', 'Add service', '/provider/services/new'],
                  ['clock', 'Availability', '/provider/availability'],
                  ['tags', 'Promo codes', '/provider/promos'],
                  ['star', 'Reviews', '/provider/reviews'],
                ] as [IconName, string, string][]).map(([icon, label, to]) => (
                  <Link key={label} to={to} className="focus-ring flex flex-col items-center gap-2 rounded-card border border-border/80 bg-surface py-5 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
                    <Icon name={icon} size={22} className="text-primary-500" />
                    <span className="text-body-sm font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-7 xl:grid-cols-2">
            <section>
              <SectionHeader title={`New requests${d.pendingCount ? ` (${d.pendingCount})` : ''}`} action={d.pendingCount > d.requests.length ? 'View all' : undefined} to="/provider/bookings" />
              {d.requests.length ? (
                <div className="flex flex-col gap-3">
                  {d.requests.map((b) => (
                    <BookingCard key={b.id} booking={b} perspective="provider" to={`/provider/bookings/${b.id}`} footer={<RequestActions booking={b} compact />} />
                  ))}
                </div>
              ) : (
                <Card>
                  <EmptyState compact icon="mail-open" title="You’re all caught up" message="New booking requests will appear here." />
                </Card>
              )}
            </section>
            <section>
              <SectionHeader title="Upcoming jobs" action="Schedule" to="/provider/bookings?tab=upcoming" />
              {d.upcoming.length ? (
                <div className="flex flex-col gap-3">
                  {d.upcoming.map((b) => (
                    <BookingCard key={b.id} booking={b} perspective="provider" to={`/provider/bookings/${b.id}`} />
                  ))}
                </div>
              ) : (
                <Card>
                  <EmptyState compact icon="calendar" title="No upcoming jobs" message="Accepted bookings show up here." />
                </Card>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { Link, useNavigate } from 'react-router';
import { BookingStatusBadge } from '@/components/domain';
import { BarChart, Card, DataTable, ErrorState, Icon, IconButton, ListSkeleton, ProgressBar, SectionHeader, StatCard } from '@/components/ui';
import { BOOKING_STATUS } from '@/constants/status';
import { useAdminDashboard, useNotifications } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuthStore } from '@/store/auth.store';
import { compactNumber, formatDay, formatMoney } from '@/utils/format';

export default function AdminDashboard() {
  usePageMeta({ title: 'Admin overview', noindex: true });
  const navigate = useNavigate();
  const q = useAdminDashboard();
  const user = useAuthStore((s) => s.user)!;
  const unread = useNotifications().data?.filter((n) => !n.read).length ?? 0;
  const d = q.data;

  return (
    <>
      <header className="flex items-center justify-between gap-3 pb-5">
        <div>
          <p className="text-caption text-ink-muted">Admin console · {user.name}</p>
          <h1 className="text-h2 font-bold">Marketplace overview</h1>
        </div>
        <IconButton icon="bell" label={`Notifications${unread ? `, ${unread} unread` : ''}`} variant="outline" badge={unread} onClick={() => navigate('/admin/notifications')} className="lg:hidden" />
      </header>
      {q.isPending ? (
        <ListSkeleton rows={5} height={110} />
      ) : q.isError ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
      ) : d ? (
        <div className="flex flex-col gap-7">
          {d.pendingProviders + d.pendingPayouts + d.openTickets + d.pendingPartners > 0 ? (
            <Card className="flex flex-col gap-2 border-warning-500/40 bg-warning-50">
              <p className="flex items-center gap-2 font-semibold">
                <Icon name="alert" size={17} className="text-warning-600" />
                Needs your attention
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { n: d.pendingProviders, label: 'provider approvals', to: '/admin/providers' },
                  { n: d.pendingPartners, label: 'partner approvals', to: '/admin/partners' },
                  { n: d.pendingPayouts, label: 'payout requests', to: '/admin/payouts' },
                  { n: d.openTickets, label: 'open tickets', to: '/admin/support' },
                ]
                  .filter((x) => x.n > 0)
                  .map((x) => (
                    <Link key={x.label} to={x.to} className="focus-ring flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-caption font-semibold shadow-sm hover:text-primary-700">
                      {x.n} {x.label}
                      <Icon name="chevron-right" size={13} />
                    </Link>
                  ))}
              </div>
            </Card>
          ) : null}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Gross booking value" value={`₹${compactNumber(d.gmv)}`} icon="trending-up" trend="+12.4% vs last month" className="col-span-2 md:col-span-1" />
            <StatCard label="Platform revenue" value={`₹${compactNumber(d.revenue)}`} icon="wallet" tone="success" trend="+9.1%" to="/admin/reports" />
            <StatCard label="Bookings" value={compactNumber(d.bookingsTotal)} icon="receipt" tone="accent" to="/admin/bookings" />
            <StatCard label="Customers" value={compactNumber(d.customers)} icon="users" tone="info" to="/admin/users" />
            <StatCard label="Active providers" value={`${d.activeProviders}`} icon="store" tone="highlight" to="/admin/providers" />
          </div>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-caption text-ink-muted">Commission revenue · 6 months</p>
                  <p className="text-h3 font-semibold">{formatMoney(d.revenueSeries.reduce((s, x) => s + x.value, 0))}</p>
                </div>
                <Link to="/admin/reports" className="focus-ring rounded text-body-sm font-semibold text-primary-600 hover:underline">
                  Reports
                </Link>
              </div>
              <BarChart data={d.revenueSeries} format={(v) => `₹${compactNumber(v)}`} label="Commission revenue by month" />
            </Card>
            <section>
              <SectionHeader title="Booking status" />
              <Card className="flex flex-col gap-3">
                {d.statusBreakdown.map((s) => {
                  const total = d.statusBreakdown.reduce((n, x) => n + x.count, 0) || 1;
                  return (
                    <div key={s.status} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-body-sm">
                        <span>{BOOKING_STATUS[s.status].label}</span>
                        <span className="font-semibold">{s.count}</span>
                      </div>
                      <ProgressBar value={s.count / total} tone={s.status === 'completed' ? 'success' : s.status === 'pending' ? 'accent' : 'primary'} label={BOOKING_STATUS[s.status].label} />
                    </div>
                  );
                })}
              </Card>
            </section>
          </div>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section>
              <SectionHeader title="Recent bookings" action="View all" to="/admin/bookings" />
              <DataTable
                caption="Recent bookings"
                data={d.recentBookings}
                keyExtractor={(b) => b.id}
                onRowClick={(b) => navigate(`/admin/bookings/${b.id}`)}
                columns={[
                  { key: 'code', title: 'Booking', render: (b) => <span className="font-semibold text-primary-600">#{b.code}</span> },
                  { key: 'cust', title: 'Customer', render: (b) => b.customerName, minWidth: 130 },
                  { key: 'date', title: 'Date', render: (b) => formatDay(b.scheduledDate), minWidth: 110 },
                  { key: 'st', title: 'Status', render: (b) => <BookingStatusBadge status={b.status} /> },
                  { key: 'amt', title: 'Amount', align: 'right', render: (b) => formatMoney(b.pricing.total) },
                ]}
              />
            </section>
            <div className="flex flex-col gap-7">
              <section>
                <SectionHeader title="Top providers" action="All" to="/admin/providers?status=approved" />
                <DataTable
                  caption="Top providers"
                  data={d.topProviders}
                  keyExtractor={(r) => r.id}
                  onRowClick={(r) => navigate(`/admin/providers/${r.id}`)}
                  dense
                  columns={[
                    { key: 'name', title: 'Provider', render: (r) => r.name, minWidth: 160 },
                    { key: 'b', title: 'Bookings', align: 'right', render: (r) => `${r.bookings}`, sortValue: (r) => r.bookings },
                    { key: 'r', title: 'Rating', align: 'right', render: (r) => `${r.rating.toFixed(1)} ★`, sortValue: (r) => r.rating },
                  ]}
                />
              </section>
              <section>
                <SectionHeader title="Top categories" />
                <Card>
                  <ol className="flex flex-col gap-3">
                    {d.topCategories.map((cat, i) => (
                      <li key={cat.name} className="flex items-center gap-3 text-body-sm">
                        <span className="w-5 font-bold text-ink-muted">{i + 1}</span>
                        <span className="flex-1">{cat.name}</span>
                        <span className="font-semibold">{cat.count} bookings</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

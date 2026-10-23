import { useState } from 'react';
import { BarChart, Button, Card, Chip, ChipRow, DataTable, ListSkeleton, PageHeader, ProgressBar, QueryView, SectionHeader, StatCard } from '@/components/ui';
import { BOOKING_STATUS } from '@/constants/status';
import { useAdminDashboard } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { compactNumber, formatMoney } from '@/utils/format';
import { downloadFile } from '@/utils/linking';

const RANGES = { '7d': 'Last 7 days', '30d': 'Last 30 days', '6m': 'Last 6 months' } as const;

export default function Reports() {
  usePageMeta({ title: 'Reports & analytics', noindex: true });
  const q = useAdminDashboard();
  const [range, setRange] = useState<keyof typeof RANGES>('6m');
  return (
    <>
      <PageHeader title="Reports & analytics" back="/admin/more" />
      <ChipRow className="mb-4" label="Date range">
        {(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((r) => (
          <Chip key={r} label={RANGES[r]} selected={range === r} onClick={() => setRange(r)} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={140} />}>
        {(d) => {
          const scale = range === '7d' ? 0.06 : range === '30d' ? 0.22 : 1;
          const completed = d.statusBreakdown.find((s) => s.status === 'completed')?.count ?? 0;
          const cancelled = d.statusBreakdown.find((s) => s.status === 'cancelled')?.count ?? 0;
          const totalB = d.statusBreakdown.reduce((n, s) => n + s.count, 0) || 1;
          const exportCsv = () => {
            const rows = [
              ['Metric', 'Value'],
              ['Range', RANGES[range]],
              ['GMV', String(Math.round(d.gmv * scale))],
              ['Revenue', String(Math.round(d.revenue * scale))],
              ['Bookings', String(d.bookingsTotal)],
              ['Completion rate', `${Math.round((completed / totalB) * 100)}%`],
              ['Cancellation rate', `${Math.round((cancelled / totalB) * 100)}%`],
              [],
              ['Category', 'Bookings'],
              ...d.topCategories.map((c) => [c.name, String(c.count)]),
            ];
            downloadFile(`servio-report-${range}.csv`, rows.map((r) => r.join(',')).join('\n'), 'text/csv;charset=utf-8');
          };
          return (
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="GMV" value={`₹${compactNumber(d.gmv * scale)}`} icon="trending-up" />
                <StatCard label="Revenue" value={`₹${compactNumber(d.revenue * scale)}`} icon="wallet" tone="success" />
                <StatCard label="Completion rate" value={`${Math.round((completed / totalB) * 100)}%`} icon="check-double" tone="info" />
                <StatCard label="Cancellation rate" value={`${Math.round((cancelled / totalB) * 100)}%`} icon="x-circle" tone="danger" />
              </div>
              <div className="grid gap-7 xl:grid-cols-2">
                <Card>
                  <h2 className="mb-4 text-title font-semibold">Commission revenue</h2>
                  <BarChart data={d.revenueSeries.map((x) => ({ ...x, value: Math.round(x.value * (range === '6m' ? 1 : scale * 6)) }))} format={(v) => `₹${compactNumber(v)}`} label="Commission revenue" />
                </Card>
                <section>
                  <SectionHeader title="Bookings by status" />
                  <Card className="flex flex-col gap-3">
                    {d.statusBreakdown.map((s) => (
                      <div key={s.status} className="flex flex-col gap-1">
                        <div className="flex justify-between text-body-sm">
                          <span>{BOOKING_STATUS[s.status].label}</span>
                          <span className="font-semibold">{Math.round((s.count / totalB) * 100)}%</span>
                        </div>
                        <ProgressBar value={s.count / totalB} tone={s.status === 'completed' ? 'success' : 'primary'} label={BOOKING_STATUS[s.status].label} />
                      </div>
                    ))}
                  </Card>
                </section>
              </div>
              <section>
                <SectionHeader title="Category performance" />
                <DataTable
                  caption="Category performance"
                  data={d.topCategories}
                  keyExtractor={(r) => r.name}
                  columns={[
                    { key: 'n', title: 'Category', render: (r) => r.name, sortValue: (r) => r.name, minWidth: 170 },
                    { key: 'b', title: 'Bookings', align: 'right', render: (r) => `${r.count}`, sortValue: (r) => r.count },
                    { key: 's', title: 'Share', align: 'right', render: (r) => `${Math.round((r.count / totalB) * 100)}%`, sortValue: (r) => r.count },
                  ]}
                />
              </section>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" leftIcon="download" onClick={exportCsv}>
                  Export CSV
                </Button>
                <Button variant="ghost" leftIcon="document" onClick={() => window.print()}>
                  Print summary
                </Button>
              </div>
              <p className="text-caption text-ink-muted">Revenue in {formatMoney(0).replace(/\d/g, '').trim() || '₹'} · figures for shorter ranges are estimated from the 6-month trend until the analytics API is connected.</p>
            </div>
          );
        }}
      </QueryView>
    </>
  );
}

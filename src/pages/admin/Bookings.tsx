import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BookingCard, BookingStatusBadge } from '@/components/domain';
import { Button, Chip, ChipRow, DataTable, EmptyState, IconButton, ListSkeleton, PageHeader, QueryView, SearchBar } from '@/components/ui';
import { BOOKING_STATUS } from '@/constants/status';
import { useAdminBookings } from '@/hooks/api';
import { useDebounced } from '@/hooks/useDebounced';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Booking, BookingStatus } from '@/types/models';
import { formatDay, formatMoney } from '@/utils/format';
import { downloadFile } from '@/utils/linking';

const STATUSES: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled', 'rejected'];

function exportCsv(list: Booking[]) {
  const rows = [['Booking', 'Customer', 'Provider', 'Date', 'Slot', 'Status', 'Payment', 'Amount'], ...list.map((b) => [b.code, b.customerName, b.providerName, b.scheduledDate, b.slot, b.status, b.payment.status, String(b.pricing.total)])];
  downloadFile(`servio-bookings-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv;charset=utf-8');
}

export default function AdminBookings() {
  usePageMeta({ title: 'All bookings', noindex: true });
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as BookingStatus | null) ?? 'all';
  const [text, setText] = useState('');
  const query = useDebounced(text);
  const wide = useMediaQuery('(min-width: 768px)');
  const [view, setView] = useState<'table' | 'cards' | null>(null);
  const mode = view ?? (wide ? 'table' : 'cards');
  const q = useAdminBookings({ status, query });
  const total = q.data?.reduce((s, b) => s + b.pricing.total, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="All bookings"
        subtitle={q.data ? `${q.data.length} results · ${formatMoney(total)}` : undefined}
        actions={
          <>
            <Button variant="outline" size="sm" leftIcon="download" onClick={() => q.data && exportCsv(q.data)} disabled={!q.data?.length} className="max-sm:hidden">
              Export CSV
            </Button>
            <IconButton icon={mode === 'table' ? 'grid' : 'list'} label={mode === 'table' ? 'Show as cards' : 'Show as table'} variant="outline" onClick={() => setView(mode === 'table' ? 'cards' : 'table')} />
          </>
        }
      />
      <SearchBar value={text} onChange={setText} placeholder="Search booking ID, customer or provider" className="mb-3 lg:max-w-md" />
      <ChipRow className="mb-4" wrap label="Filter by status">
        {STATUSES.map((s) => (
          <Chip key={s} label={s === 'all' ? 'All' : BOOKING_STATUS[s].label} selected={status === s} onClick={() => setParams(s === 'all' ? {} : { status: s }, { replace: true })} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={6} height={56} />} empty={<EmptyState icon="receipt" title="No bookings match" message="Try another status or search term." />}>
        {(list) =>
          mode === 'table' ? (
            <DataTable
              caption="Bookings"
              data={list}
              keyExtractor={(b) => b.id}
              onRowClick={(b) => navigate(`/admin/bookings/${b.id}`)}
              columns={[
                { key: 'code', title: 'Booking', render: (b) => <span className="font-semibold text-primary-600">#{b.code}</span>, sortValue: (b) => b.code },
                { key: 'c', title: 'Customer', render: (b) => b.customerName, sortValue: (b) => b.customerName, minWidth: 130 },
                { key: 'p', title: 'Provider', render: (b) => b.providerName, sortValue: (b) => b.providerName, minWidth: 160 },
                { key: 'd', title: 'Scheduled', render: (b) => formatDay(b.scheduledDate), sortValue: (b) => `${b.scheduledDate}${b.slot}`, minWidth: 110 },
                { key: 's', title: 'Status', render: (b) => <BookingStatusBadge status={b.status} />, sortValue: (b) => b.status },
                { key: 'pay', title: 'Payment', render: (b) => <span className={b.payment.status === 'paid' ? 'capitalize text-success-600' : 'capitalize text-ink-muted'}>{b.payment.status}</span>, sortValue: (b) => b.payment.status },
                { key: 'a', title: 'Amount', align: 'right', render: (b) => formatMoney(b.pricing.total), sortValue: (b) => b.pricing.total },
              ]}
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {list.map((b) => (
                <BookingCard key={b.id} booking={b} perspective="admin" to={`/admin/bookings/${b.id}`} />
              ))}
            </div>
          )
        }
      </QueryView>
    </>
  );
}

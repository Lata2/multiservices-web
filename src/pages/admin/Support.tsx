import { useState } from 'react';
import { Chip, ChipRow, EmptyState, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { TICKET_STATUS } from '@/constants/status';
import { TicketRow } from '@/features/TicketRow';
import { useAdminTickets } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { TicketStatus } from '@/types/models';

export default function AdminSupport() {
  usePageMeta({ title: 'Support tickets', noindex: true });
  const q = useAdminTickets();
  const [filter, setFilter] = useState<TicketStatus | 'all'>('open');
  const list = (q.data ?? []).filter((t) => filter === 'all' || t.status === filter);
  return (
    <>
      <PageHeader title="Support tickets" subtitle={q.data ? `${q.data.filter((t) => t.status === 'open').length} open` : undefined} back="/admin/more" />
      <ChipRow className="mb-4" label="Filter tickets">
        {(['open', 'in_progress', 'resolved', 'closed', 'all'] as const).map((f) => (
          <Chip key={f} label={f === 'all' ? 'All' : TICKET_STATUS[f].label} selected={filter === f} onClick={() => setFilter(f)} count={q.data && f !== 'all' ? q.data.filter((t) => t.status === f).length || undefined : undefined} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={110} />}>
        {() =>
          list.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {list.map((t) => (
                <TicketRow key={t.id} ticket={t} showUser to={`/admin/support/${t.id}`} />
              ))}
            </div>
          ) : (
            <EmptyState icon="inbox" title="Inbox zero" message="No tickets with this status." />
          )
        }
      </QueryView>
    </>
  );
}

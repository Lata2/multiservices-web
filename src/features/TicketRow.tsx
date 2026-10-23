import { Link } from 'react-router';
import { TICKET_STATUS } from '@/constants/status';
import type { SupportTicket } from '@/types/models';
import { timeAgo } from '@/utils/format';
import { Badge } from '@/components/ui';

export function TicketRow({ ticket, to, showUser }: { ticket: SupportTicket; to: string; showUser?: boolean }) {
  const s = TICKET_STATUS[ticket.status];
  return (
    <Link to={to} className="focus-ring flex flex-col gap-2 rounded-card border border-border/80 bg-surface p-4 shadow-sm transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md">
      <span className="flex items-center justify-between gap-2">
        <span className="text-caption capitalize text-ink-muted">
          #{ticket.id.toUpperCase().slice(-6)} · {ticket.category}
        </span>
        <span className="flex gap-1.5">
          {ticket.priority === 'high' ? <Badge label="High priority" tone="danger" icon="alert" /> : null}
          <Badge label={s.label} tone={s.tone} />
        </span>
      </span>
      <span className="truncate font-semibold">{ticket.subject}</span>
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-caption text-ink-secondary">
          {showUser ? `${ticket.userName} (${ticket.userRole}) · ` : ''}
          {ticket.messages[ticket.messages.length - 1]?.text}
        </span>
        <span className="shrink-0 text-caption text-ink-muted">{timeAgo(ticket.updatedAt)}</span>
      </span>
    </Link>
  );
}

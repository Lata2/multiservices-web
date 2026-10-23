import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { Badge, Button, cn, ErrorState, IconButton, LoadingState, PageHeader } from '@/components/ui';
import { TICKET_STATUS } from '@/constants/status';
import { useTicket } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { supportApi } from '@/services/api';
import type { SupportTicket } from '@/types/models';
import { formatDateTime, timeAgo } from '@/utils/format';

export default function TicketDetail() {
  const { id = '' } = useParams();
  const { base, role } = useRoleBase();
  const q = useTicket(id);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const reply = useApiMutation((t: string) => supportApi.reply(id, t), { invalidate: [qk.tickets.all], onSuccess: () => setText('') });
  const setStatus = useApiMutation((s: SupportTicket['status']) => supportApi.setStatus(id, s), { invalidate: [qk.tickets.all], successMessage: 'Ticket updated' });
  const isAdmin = role === 'admin';
  usePageMeta({ title: q.data?.subject ?? 'Ticket', noindex: true });
  const count = q.data?.messages.length ?? 0;
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [count]);

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />;
  const t = q.data;
  const s = TICKET_STATUS[t.status];
  const submit = () => text.trim() && !reply.isPending && reply.mutate(text);

  return (
    <div className="flex h-[calc(100dvh-32px)] max-w-[var(--container-narrow)] flex-col lg:h-[calc(100dvh-140px)]">
      <PageHeader
        title={t.subject}
        subtitle={`${s.label} · opened ${timeAgo(t.createdAt)}${isAdmin ? ` · ${t.userName} (${t.userRole})` : ''}`}
        back={`${base}/support`}
        className="mb-0"
        actions={
          t.status !== 'closed' ? (
            isAdmin ? (
              <Button size="sm" variant="success" leftIcon="check-double" onClick={() => setStatus.mutate('resolved')} disabled={t.status === 'resolved'} loading={setStatus.isPending}>
                Mark resolved
              </Button>
            ) : (
              <IconButton icon="x-circle" label="Close ticket" variant="plain" onClick={() => setStatus.mutate('closed')} />
            )
          ) : undefined
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-border/70 bg-surface-muted/50 p-4" role="log" aria-label="Conversation">
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          <Badge label={s.label} tone={s.tone} />
          <Badge label={t.category} tone="neutral" className="capitalize" />
          {t.bookingId ? <Badge label={`Booking ${t.bookingId}`} tone="primary" /> : null}
          {t.priority === 'high' ? <Badge label="High priority" tone="danger" icon="alert" /> : null}
        </div>
        <ul className="flex flex-col gap-3">
          {t.messages.map((m) => {
            const mine = isAdmin ? m.from === 'support' : m.from === 'user';
            return (
              <li key={m.id} className={cn('max-w-[85%]', mine ? 'self-end' : 'self-start')}>
                {!mine ? <p className="mb-1 ml-1 text-caption text-ink-muted">{m.from === 'support' ? 'Servio Support' : t.userName}</p> : null}
                <p className={cn('whitespace-pre-wrap rounded-2xl px-4 py-3 text-body-sm', mine ? 'rounded-br-sm bg-primary-500 text-white' : 'rounded-bl-sm border border-border bg-surface')}>{m.text}</p>
                <p className={cn('mt-1 text-caption text-ink-muted', mine ? 'mr-1 text-right' : 'ml-1')}>{formatDateTime(m.at)}</p>
              </li>
            );
          })}
        </ul>
        <div ref={end} />
      </div>
      {t.status === 'closed' ? (
        <p className="py-3 text-center text-ink-muted">This ticket is closed. Raise a new ticket for further help.</p>
      ) : (
        <form
          className="mt-3 flex items-end gap-2 pb-[env(safe-area-inset-bottom)]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label htmlFor="ticket-reply" className="sr-only">
            Reply
          </label>
          <textarea
            id="ticket-reply"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())}
            rows={1}
            placeholder={isAdmin ? 'Reply to the user…' : 'Type your message…'}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
          <IconButton type="submit" icon="send" label="Send" variant="solid" disabled={!text.trim() || reply.isPending} className="h-11 w-11" />
        </form>
      )}
    </div>
  );
}

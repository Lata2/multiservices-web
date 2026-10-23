import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { cn, EmptyState, ErrorState, IconButton, LoadingState, PageHeader } from '@/components/ui';
import { useChat } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { chatApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { formatTime } from '@/utils/format';

export default function ChatRoom() {
  const { id = '' } = useParams();
  const { base } = useRoleBase();
  const q = useChat(id);
  const me = useAuthStore((s) => s.user);
  const myId = me?.role === 'provider' ? me.profileId : me?.id;
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const send = useApiMutation((t: string) => chatApi.send(id, t), { invalidate: [qk.chat.thread(id), qk.chat.threads], onSuccess: () => setText('') });
  const thread = q.data?.thread;
  const title = me?.role === 'provider' ? 'Customer' : (thread?.title ?? 'Chat');
  usePageMeta({ title: `Chat · ${title}`, noindex: true });
  const count = q.data?.messages.length ?? 0;
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [count]);

  const submit = () => text.trim() && !send.isPending && send.mutate(text);

  return (
    <div className="flex h-[calc(100dvh-32px)] max-w-[var(--container-narrow)] flex-col lg:h-[calc(100dvh-180px)]">
      <PageHeader
        title={title}
        subtitle={thread?.bookingId ? `About booking ${thread.bookingId}` : 'Typically replies in minutes'}
        back={`${base}/messages`}
        actions={<IconButton icon="phone" label="Call" variant="plain" onClick={() => toast.info('Calls connect through a masked number once telephony is live.')} />}
        className="mb-0"
      />
      <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-border/70 bg-surface-muted/50 p-4" role="log" aria-live="polite" aria-label="Messages">
        {q.isPending ? (
          <LoadingState />
        ) : q.isError ? (
          <ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} />
        ) : q.data.messages.length ? (
          <ul className="flex flex-col gap-2">
            {q.data.messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <li key={m.id} className={cn('max-w-[80%]', mine ? 'self-end' : 'self-start')}>
                  <p className={cn('whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-body-sm', mine ? 'rounded-br-sm bg-primary-500 text-white' : 'rounded-bl-sm border border-border bg-surface')}>{m.text}</p>
                  <p className={cn('mt-0.5 text-caption text-ink-muted', mine ? 'mr-1 text-right' : 'ml-1')}>{formatTime(new Date(m.at).toTimeString().slice(0, 5))}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState compact icon="chat" title="Say hello 👋" message="Ask about timing, materials or anything else." />
        )}
        <div ref={end} />
      </div>
      <form
        className="mt-3 flex items-end gap-2 pb-[env(safe-area-inset-bottom)]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-[22px] border border-border bg-surface px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
        <IconButton type="submit" icon="send" label="Send message" variant="solid" disabled={!text.trim() || send.isPending} className="h-11 w-11" />
      </form>
    </div>
  );
}

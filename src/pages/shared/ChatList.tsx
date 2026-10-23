import { Link } from 'react-router';
import { Avatar, Card, EmptyState, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { useChatThreads } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { timeAgo } from '@/utils/format';

export default function ChatList() {
  usePageMeta({ title: 'Messages', noindex: true });
  const q = useChatThreads();
  const { base, role } = useRoleBase();
  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title={role === 'provider' ? 'Customer messages' : 'Messages'} back={base === '/account' ? '/account' : `${base}/account`} />
      <QueryView query={q} loading={<ListSkeleton rows={4} height={72} />} empty={<EmptyState icon="chat" title="No conversations" message={role === 'provider' ? 'Customers can message you from their bookings.' : 'Chat with your provider from any booking or provider profile.'} />}>
        {(threads) => (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link to={`${base}/messages/${t.id}`} className="focus-ring flex items-center gap-3 px-4 py-4 hover:bg-surface-muted/60">
                    <Avatar src={t.avatar} name={t.title} size={46} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{t.title}</span>
                        <span className="shrink-0 text-caption text-ink-muted">{timeAgo(t.updatedAt)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-body-sm text-ink-secondary">{t.lastMessage || 'Start the conversation'}</span>
                        {t.unread ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-2xs font-bold text-white">{t.unread}</span> : null}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </QueryView>
    </div>
  );
}

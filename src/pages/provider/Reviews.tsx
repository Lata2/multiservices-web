import { useState } from 'react';
import { ReviewCard } from '@/components/domain';
import { Button, Card, Chip, ChipRow, EmptyState, ListSkeleton, Modal, PageHeader, QueryView, RatingStars, Textarea } from '@/components/ui';
import { useProviderProfile, useProviderReviews, useProviderServices } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { reviewsApi } from '@/services/api';
import type { Review } from '@/types/models';

export default function ProviderReviews() {
  usePageMeta({ title: 'Ratings & reviews', noindex: true });
  const profile = useProviderProfile();
  const q = useProviderReviews(profile.data?.id);
  const services = useProviderServices();
  const [filter, setFilter] = useState<number | 'unreplied' | null>(null);
  const [replyTo, setReplyTo] = useState<Review | null>(null);
  const [text, setText] = useState('');
  const reply = useApiMutation(() => reviewsApi.reply(replyTo!.id, text), { invalidate: [qk.provider_.all], successMessage: 'Reply posted', onSuccess: () => (setReplyTo(null), setText('')) });

  const all = q.data ?? [];
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const list = all.filter((r) => (filter === null ? true : filter === 'unreplied' ? !r.reply : r.rating === filter));
  const titleOf = (id: string) => services.data?.find((s) => s.id === id)?.title;
  const pending = all.filter((r) => !r.reply).length;

  return (
    <>
      <PageHeader title="Ratings & reviews" back="/provider/account" />
      <Card className="mb-4 flex items-center gap-5">
        <div className="text-center">
          <p className="text-display font-black">{avg ? avg.toFixed(1) : '–'}</p>
          <RatingStars value={avg} />
        </div>
        <div>
          <p className="font-semibold">{all.length} reviews</p>
          <p className="text-body-sm text-ink-secondary">{pending} awaiting your reply. Replying to reviews builds trust with new customers.</p>
        </div>
      </Card>
      <ChipRow className="mb-3" label="Filter reviews">
        <Chip label="All" selected={filter === null} onClick={() => setFilter(null)} />
        <Chip label="Needs reply" count={pending || undefined} selected={filter === 'unreplied'} onClick={() => setFilter('unreplied')} />
        {[5, 4, 3, 2, 1].map((r) => (
          <Chip key={r} icon="star" label={`${r}`} selected={filter === r} onClick={() => setFilter(r)} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={100} />}>
        {() =>
          list.length ? (
            <Card className="py-0">
              {list.map((r) => (
                <ReviewCard key={r.id} review={r} serviceTitle={titleOf(r.serviceId)} onReply={() => setReplyTo(r)} />
              ))}
            </Card>
          ) : (
            <EmptyState icon="star" title="No reviews here" message="Try a different filter." />
          )
        }
      </QueryView>
      <Modal open={!!replyTo} onClose={() => setReplyTo(null)} title={`Reply to ${replyTo?.customerName ?? ''}`} footer={<Button fullWidth disabled={text.trim().length < 3} loading={reply.isPending} onClick={() => reply.mutate()}>Post reply</Button>}>
        <blockquote className="mb-3 border-l-2 border-border pl-3 text-body-sm text-ink-secondary">“{replyTo?.comment}”</blockquote>
        <Textarea aria-label="Your reply" placeholder="Thank the customer or address their concern…" value={text} onValueChange={setText} rows={4} maxLength={300} autoFocus />
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { ReviewCard } from '@/components/domain';
import { Button, Card, Chip, ChipRow, ConfirmDialog, EmptyState, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { useAdminReviews } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { reviewsApi } from '@/services/api';
import type { Review } from '@/types/models';

export default function AdminReviews() {
  usePageMeta({ title: 'Review moderation', noindex: true });
  const q = useAdminReviews();
  const [filter, setFilter] = useState<'all' | 'low'>('low');
  const [limit, setLimit] = useState(20);
  const [toDelete, setToDelete] = useState<Review | null>(null);
  const remove = useApiMutation((id: string) => reviewsApi.remove(id), { invalidate: [qk.admin.reviews, ['service'], ['provider']], successMessage: 'Review removed', onSuccess: () => setToDelete(null) });
  const list = (q.data ?? []).filter((r) => filter === 'all' || r.rating <= 3);

  return (
    <>
      <PageHeader title="Review moderation" subtitle="Remove abusive or fake reviews" back="/admin/more" />
      <ChipRow className="mb-4" label="Filter reviews">
        <Chip label="Needs attention (≤3★)" selected={filter === 'low'} onClick={() => setFilter('low')} />
        <Chip label="All reviews" selected={filter === 'all'} onClick={() => setFilter('all')} />
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={4} height={110} />}>
        {() =>
          list.length ? (
            <>
              <ul className="grid gap-3 lg:grid-cols-2">
                {list.slice(0, limit).map((r) => (
                  <li key={r.id}>
                    <Card className="flex h-full flex-col py-0 pb-3">
                      <ReviewCard review={r} className="flex-1 border-b-0" />
                      <Button variant="ghost" size="sm" leftIcon="trash" className="self-end text-danger-600 hover:bg-danger-50" onClick={() => setToDelete(r)}>
                        Remove review
                      </Button>
                    </Card>
                  </li>
                ))}
              </ul>
              {list.length > limit ? (
                <div className="mt-5 flex justify-center">
                  <Button variant="outline" onClick={() => setLimit((l) => l + 20)}>
                    Load more ({list.length - limit} left)
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState icon="star" title="Nothing to moderate" />
          )
        }
      </QueryView>
      <ConfirmDialog open={!!toDelete} tone="danger" icon="trash" title="Remove this review?" message={`“${toDelete?.comment ?? ''}”`} confirmLabel="Remove" loading={remove.isPending} onCancel={() => setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} />
    </>
  );
}

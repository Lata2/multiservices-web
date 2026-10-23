import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, Avatar, Button, Card, Chip, ErrorState, LoadingState, PageHeader, RatingStars, Textarea } from '@/components/ui';
import { useBooking } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { reviewsApi } from '@/services/api';

const LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
const TAGS = {
  good: ['On time', 'Professional', 'Clean work', 'Great value', 'Polite', 'Well equipped'],
  bad: ['Late arrival', 'Incomplete work', 'Overcharged', 'Unprofessional', 'Messy'],
};

export default function ReviewBooking() {
  usePageMeta({ title: 'Rate your experience', noindex: true });
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const q = useBooking(id);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = useApiMutation(() => reviewsApi.create({ bookingId: id, rating, comment: [tags.join(', '), comment.trim()].filter(Boolean).join('. ') || LABELS[rating] }), {
    invalidate: [qk.bookings.all, ['provider'], ['service']],
    successMessage: 'Thanks for your feedback!',
    onSuccess: () => navigate(`/bookings/${id}`, { replace: true }),
  });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <PageBody narrow><PageHeader title="Rate service" back={`/bookings/${id}`} /><ErrorState message={errorMessage(q.error)} /></PageBody>;
  const b = q.data;
  const pool = rating >= 4 ? TAGS.good : rating > 0 ? TAGS.bad : [];
  const send = () => {
    if (!rating) return setError('Please select a star rating');
    if (rating <= 2 && comment.trim().length < 10) return setError('Please tell us what went wrong (at least 10 characters)');
    submit.mutate();
  };

  return (
    <PageBody narrow>
      <PageHeader title="Rate your experience" back={`/bookings/${id}`} />
      <Card className="flex flex-col items-center py-8 text-center">
        <Avatar name={b.providerName} size={64} />
        <p className="mt-3 text-h3 font-semibold">{b.providerName}</p>
        <p className="mt-1 text-body-sm text-ink-secondary">{b.items.map((i) => i.title).join(', ')}</p>
        <div className="mt-6">
          <RatingStars value={rating} onChange={(v) => (setRating(v), setTags([]), setError(null))} size={38} label="Your rating" />
        </div>
        <p className={rating ? 'mt-3 text-title font-semibold text-primary-600' : 'mt-3 text-title text-ink-muted'} aria-live="polite">
          {rating ? LABELS[rating] : 'Select a star to rate'}
        </p>
      </Card>
      {pool.length ? (
        <fieldset className="mt-6">
          <legend className="mb-3 text-title font-semibold">{rating >= 4 ? 'What did you like?' : 'What could be better?'}</legend>
          <div className="flex flex-wrap gap-2">
            {pool.map((t) => (
              <Chip key={t} label={t} selected={tags.includes(t)} onClick={() => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))} />
            ))}
          </div>
        </fieldset>
      ) : null}
      <Textarea containerClassName="mt-6" label="Write a review" placeholder="Share details of your experience to help others" value={comment} onValueChange={(t) => (setComment(t), setError(null))} rows={5} maxLength={500} hint={`${comment.length}/500`} error={error ?? undefined} />
      <ActionBar>
        <Button size="lg" fullWidth loading={submit.isPending} onClick={send}>
          Submit review
        </Button>
      </ActionBar>
    </PageBody>
  );
}

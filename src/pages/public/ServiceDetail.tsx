import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Price, ProviderCard, ReviewCard, ServiceCard, ServiceThumb, useAddToCart } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, Badge, Button, Card, ErrorState, Icon, IconButton, LinkButton, LoadingState, QuantityStepper, RatingStars, ReadMore, SectionHeader, type IconName } from '@/components/ui';
import { useService, useServiceReviews } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCartStore } from '@/store/cart.store';
import { formatDuration, formatMoney } from '@/utils/format';
import { shareContent } from '@/utils/linking';
import { discountPercent, effectivePrice } from '@/utils/pricing';

export default function ServiceDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const q = useService(id);
  const reviews = useServiceReviews(id);
  const qty = useCartStore((s) => s.items.find((i) => i.serviceId === id)?.quantity ?? 0);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const { addService, dialog } = useAddToCart();
  const [showAll, setShowAll] = useState(false);
  const { fav, toggle } = useFavoriteToggle(id);
  usePageMeta({
    title: q.data?.service.title ?? 'Service',
    description: q.data ? `${q.data.service.title} by ${q.data.provider.businessName}. ${formatMoney(effectivePrice(q.data.service))} · ${formatDuration(q.data.service.durationMin)} · rated ${q.data.service.rating.toFixed(1)}★.` : undefined,
  });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <PageBody><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></PageBody>;
  const { service: s, provider, related } = q.data;
  const off = discountPercent(s);
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({ r, n: reviews.data?.filter((x) => x.rating === r).length ?? 0 }));
  const totalReviews = reviews.data?.length || 1;

  const purchase = (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <Price price={s.price} discountPrice={s.discountPrice} size="lg" />
        <p className="text-caption text-ink-muted">{qty ? `${qty} in cart · ${formatMoney(effectivePrice(s) * qty)}` : 'Inclusive of all charges'}</p>
      </div>
      {qty ? (
        <div className="flex items-center gap-2">
          <QuantityStepper value={qty} onChange={(v) => setQuantity(s.id, v)} max={s.maxQuantity} />
          <LinkButton to="/cart" rightIcon="arrow-right">
            Cart
          </LinkButton>
        </div>
      ) : (
        <Button leftIcon="cart" onClick={() => addService(s)} disabled={!s.active} className="px-6">
          Add to cart
        </Button>
      )}
    </div>
  );

  return (
    <PageBody>
      <div className="relative -mx-4 sm:mx-0">
        <ServiceThumb image={s.image} categoryId={s.categoryId} subcategoryId={s.subcategoryId} variant="scene" className="h-56 w-full sm:h-72 sm:rounded-2xl lg:h-80" iconSize={56} alt={s.title} />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3 sm:p-4">
          <IconButton icon="chevron-left" label="Go back" variant="outline" onClick={() => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/'))} />
          <div className="flex gap-2">
            <IconButton icon="share" label="Share" variant="outline" onClick={() => void shareContent({ title: s.title, text: `Check out ${s.title} on Servio`, url: window.location.href })} />
            <IconButton icon="heart" label={fav ? 'Remove from favourites' : 'Save to favourites'} variant="outline" filled={fav} iconClassName={fav ? 'text-danger-500' : ''} onClick={toggle} aria-pressed={fav} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {off ? <Badge label={`${off}% OFF`} tone="accent" icon="tag" /> : null}
            {s.tags.includes('bestseller') ? <Badge label="Bestseller" tone="primary" icon="flame" /> : null}
            {s.requiresPickup ? <Badge label="Free pickup & drop" tone="info" icon="bike" /> : null}
            {!s.active ? <Badge label="Currently unavailable" tone="danger" /> : null}
          </div>
          <h1 className="mt-3 text-h2 font-bold lg:text-h1">{s.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm">
            <span className="flex items-center gap-1">
              <Icon name="star" size={15} filled className="text-accent-400" />
              <span className="font-semibold">{s.rating.toFixed(1)}</span>
              <span className="text-ink-muted">({s.reviewCount.toLocaleString('en-IN')} reviews)</span>
            </span>
            <span className="flex items-center gap-1 text-ink-secondary">
              <Icon name="clock" size={15} />
              {formatDuration(s.durationMin)}
            </span>
            {s.membersRequired > 1 ? (
              <span className="flex items-center gap-1 text-ink-secondary">
                <Icon name="users" size={15} />
                {s.membersRequired} professionals
              </span>
            ) : null}
          </div>
          <ReadMore className="mt-3 max-w-2xl leading-7">{s.description}</ReadMore>

          <Card className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="mb-3 text-title font-semibold">What’s included</h2>
              <ul className="flex flex-col gap-2">
                {s.includes.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-body-sm">
                    <Icon name="check-circle" size={17} className="mt-px text-success-500" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            {s.excludes.length ? (
              <div>
                <h2 className="mb-3 text-title font-semibold">Not included</h2>
                <ul className="flex flex-col gap-2">
                  {s.excludes.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-body-sm text-ink-secondary">
                      <Icon name="x-circle" size={17} className="mt-px text-danger-500" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          <ul className="mt-5 grid grid-cols-3 gap-3">
            {([['shield-check', 'Verified professional'], ['repeat', '7-day re-work'], ['lock', 'Secure payment']] as [IconName, string][]).map(([icon, t]) => (
              <li key={t} className="flex flex-col items-center gap-1.5 rounded-xl bg-primary-50 px-2 py-3 text-center text-caption font-medium">
                <Icon name={icon} size={19} className="text-primary-600" />
                {t}
              </li>
            ))}
          </ul>

          <section className="mt-8">
            <SectionHeader title="Ratings & reviews" action={reviews.data && reviews.data.length > 3 ? (showAll ? 'Show less' : `See all ${reviews.data.length}`) : undefined} onAction={() => setShowAll((v) => !v)} />
            <Card>
              <div className="flex items-center gap-6 border-b border-border pb-4">
                <div className="text-center">
                  <p className="text-display font-black">{s.rating.toFixed(1)}</p>
                  <RatingStars value={s.rating} />
                  <p className="mt-1 text-caption text-ink-muted">{s.reviewCount.toLocaleString('en-IN')} ratings</p>
                </div>
                <dl className="flex flex-1 flex-col gap-1.5">
                  {ratingDist.map(({ r, n }) => (
                    <div key={r} className="flex items-center gap-2">
                      <dt className="w-3 text-caption text-ink-secondary">{r}</dt>
                      <dd className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <span className="block h-full rounded-full bg-accent-400" style={{ width: `${(n / totalReviews) * 100}%` }} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              {reviews.data?.length ? (showAll ? reviews.data : reviews.data.slice(0, 3)).map((r) => <ReviewCard key={r.id} review={r} />) : <p className="pt-4 text-ink-muted">No reviews yet — be the first to book!</p>}
            </Card>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <Card elevation="md" className="hidden lg:block">
            {purchase}
            <p className="mt-3 flex items-center gap-2 text-caption text-ink-secondary">
              <Icon name="calendar-check" size={14} className="text-success-600" />
              Free cancellation up to 3 hours before your slot
            </p>
          </Card>
          <div>
            <SectionHeader title="Service provider" />
            <ProviderCard provider={provider} />
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="mt-10">
          <SectionHeader title={`More from ${provider.businessName}`} />
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {related.map((r) => (
              <ServiceCard key={r.id} service={r} className="w-48 shrink-0 sm:w-auto" />
            ))}
          </div>
        </section>
      ) : null}

      <div className="lg:hidden">
        <ActionBar>{purchase}</ActionBar>
      </div>
      {dialog}
    </PageBody>
  );
}

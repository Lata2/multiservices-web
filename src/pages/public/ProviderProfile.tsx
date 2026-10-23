import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AddToCartControl, CartBar, PromoCard, ReviewCard, ServiceRow, useAddToCart } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Avatar, Badge, Button, Card, EmptyState, ErrorState, Icon, IconButton, LoadingState, SegmentedTabs, type IconName } from '@/components/ui';
import { useCategories, useOffers, useProvider } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { usePageMeta } from '@/hooks/usePageMeta';
import { chatApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { formatMoney } from '@/utils/format';
import { callPhone } from '@/utils/linking';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ProviderProfile() {
  const { id = '' } = useParams();
  const [todayDow] = useState(() => new Date().getDay());
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const q = useProvider(id);
  const offers = useOffers(id);
  const cats = useCategories(null);
  const [tab, setTab] = useState<'services' | 'reviews' | 'about'>('services');
  const { addService, dialog } = useAddToCart();
  const { fav, toggle } = useFavoriteToggle(id);
  const openChat = useApiMutation(() => chatApi.open(id), { invalidate: [qk.chat.threads], onSuccess: (t) => navigate(`/account/messages/${t.id}`) });
  usePageMeta({ title: q.data?.provider.businessName ?? 'Professional', description: q.data?.provider.about });

  const chat = () => {
    if (!user) return navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    if (user.role !== 'customer') return toast.info('Chat is available for customer accounts.');
    openChat.mutate();
  };

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <PageBody><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></PageBody>;
  const { provider: p, services, reviews } = q.data;
  const providerOffers = offers.data?.filter((o) => o.providerId === p.id) ?? [];
  const stats: { v: string; l: string; icon: IconName }[] = [
    { v: p.rating ? p.rating.toFixed(1) : 'New', l: `${p.reviewCount} reviews`, icon: 'star' },
    { v: p.jobsCompleted.toLocaleString('en-IN'), l: 'Jobs done', icon: 'briefcase' },
    { v: `${p.yearsExperience} yrs`, l: 'Experience', icon: 'award' },
    { v: `${p.distanceKm} km`, l: 'Away', icon: 'navigate' },
  ];

  return (
    <>
      <div className="relative h-36 bg-gradient-to-br from-primary-500 to-primary-800 sm:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgb(255_255_255/0.18),transparent_50%)]" aria-hidden />
        <div className="container-page relative flex justify-between pt-3">
          <IconButton icon="chevron-left" label="Go back" variant="glass" onClick={() => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/professionals'))} />
          <IconButton icon="heart" label={fav ? 'Remove from favourites' : 'Save to favourites'} variant="glass" filled={fav} onClick={toggle} aria-pressed={fav} />
        </div>
      </div>
      <PageBody className="-mt-16 sm:-mt-20">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4">
            <Card elevation="md" className="flex flex-col items-center text-center">
              <div className="-mt-14">
                <Avatar src={p.avatar} name={p.businessName} size={88} ring />
              </div>
              <h1 className="mt-2 flex items-center gap-1.5 text-h3 font-bold">
                {p.businessName}
                {p.verified ? <Icon name="verified" size={18} className="text-primary-500" label="Verified" /> : null}
              </h1>
              <p className="text-body-sm text-ink-secondary">
                {p.type === 'organization' ? 'Organisation' : 'Individual professional'} · {p.city}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {p.categoryIds.map((cid) => {
                  const cat = cats.data?.find((x) => x.id === cid);
                  return cat ? <Badge key={cid} label={cat.name} tone="primary" /> : null;
                })}
              </div>
              <dl className="mt-4 grid w-full grid-cols-4 border-t border-border pt-4">
                {stats.map((x, i) => (
                  <div key={x.l} className={i ? 'border-l border-border' : ''}>
                    <dd className="font-bold">{x.v}</dd>
                    <dt className="text-caption text-ink-muted">{x.l}</dt>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex w-full gap-3">
                <Button variant="secondary" leftIcon="chat" className="flex-1" loading={openChat.isPending} onClick={chat}>
                  Chat
                </Button>
                <Button variant="outline" leftIcon="phone" className="flex-1" onClick={() => callPhone(p.phone)}>
                  Call
                </Button>
              </div>
            </Card>
            {providerOffers.map((o) => (
              <PromoCard key={o.id} promo={o} />
            ))}
          </aside>

          <div className="min-w-0">
            <SegmentedTabs
              className="mb-4 lg:max-w-md"
              value={tab}
              onChange={setTab}
              label="Provider sections"
              tabs={[
                { value: 'services', label: 'Services', count: services.length },
                { value: 'reviews', label: 'Reviews' },
                { value: 'about', label: 'About' },
              ]}
            />
            {tab === 'services' ? (
              services.length ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {services.map((s) => (
                    <ServiceRow key={s.id} service={s} right={<AddToCartControl service={s} onAdd={addService} />} />
                  ))}
                </div>
              ) : (
                <EmptyState compact title="No services listed" icon="construct" />
              )
            ) : tab === 'reviews' ? (
              <Card className="py-0">{reviews.length ? reviews.map((r) => <ReviewCard key={r.id} review={r} />) : <EmptyState compact title="No reviews yet" icon="star" />}</Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                <Card className="xl:col-span-2">
                  <h2 className="mb-2 text-title font-semibold">About</h2>
                  <p className="leading-7 text-ink-secondary">{p.about || 'This provider has not added a description yet.'}</p>
                  <ul className="mt-4 flex flex-col gap-2 text-body-sm text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <Icon name="pin" size={15} />
                      {p.address || p.city}
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="cash" size={15} />
                      Starting at {formatMoney(p.startingPrice)} · Visiting charge {p.visitingCharge ? formatMoney(p.visitingCharge) : 'free'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="calendar" size={15} />
                      On Servio since {new Date(p.joinedAt).getFullYear()}
                    </li>
                  </ul>
                </Card>
                <Card>
                  <h2 className="mb-2 text-title font-semibold">Working hours</h2>
                  <dl>
                    {p.hours.map((h) => {
                      const today = h.day === todayDow;
                      return (
                        <div key={h.day} className="flex justify-between py-1.5 text-body-sm">
                          <dt className={today ? 'font-semibold text-primary-600' : 'text-ink-secondary'}>
                            {DAYS[h.day]}
                            {today ? ' (today)' : ''}
                          </dt>
                          <dd className={h.open ? 'font-medium' : 'font-medium text-danger-600'}>{h.open ? `${h.start} – ${h.end}` : 'Closed'}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </Card>
                <Card>
                  <h2 className="mb-2 text-title font-semibold">Verification</h2>
                  <ul>
                    {p.documents.map((d) => (
                      <li key={d.id} className="flex items-center gap-2 py-1.5 text-body-sm">
                        <Icon name={d.status === 'verified' ? 'shield-check' : 'clock'} size={16} className={d.status === 'verified' ? 'text-success-500' : 'text-warning-500'} />
                        <span className="flex-1">{d.name}</span>
                        <span className={d.status === 'verified' ? 'text-caption capitalize text-success-600' : 'text-caption capitalize text-ink-muted'}>{d.status}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </div>
      </PageBody>
      <CartBar />
      {dialog}
    </>
  );
}

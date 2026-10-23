import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookingCard, CartBar, CategoryTile, PromoCard, ProviderCard, ServiceCard } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { Avatar, Chip, cn, Icon, LinkButton, SearchBar, SectionHeader, Skeleton, type IconName } from '@/components/ui';
import { useBanners, useCategories, useMyBookings, useOffers, usePopularServices, useProviders } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import type { Booking } from '@/types/models';
import { formatDay, formatTime } from '@/utils/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const STEPS: { key: Booking['status']; label: string }[] = [
  { key: 'pending', label: 'Booking placed' },
  { key: 'confirmed', label: 'Confirmed by provider' },
  { key: 'on_the_way', label: 'Professional on the way' },
  { key: 'in_progress', label: 'Service started' },
  { key: 'completed', label: 'Completed' },
];

/** The hero's live booking composite — the product's most characteristic moment. */
function LiveBooking({ booking }: { booking?: Booking }) {
  const sample = !booking;
  const title = booking ? booking.items[0].title : 'AC Power Jet Service × 2';
  const provider = booking ? booking.providerName : 'CoolBreeze Appliance Care';
  const when = booking ? `${formatDay(booking.scheduledDate)} · ${formatTime(booking.slot)}` : 'Tomorrow · 11:00 AM';
  const status = booking?.status ?? 'on_the_way';
  const reached = Math.max(0, STEPS.findIndex((s) => s.key === status));
  const code = booking?.startOtp ?? '4821';
  const to = booking ? `/bookings/${booking.id}` : '/explore';
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary-100 via-white to-accent-100 blur-xl" aria-hidden />
      <Link to={to} className="focus-ring block rounded-2xl border border-border/80 bg-surface p-5 shadow-lg transition-transform duration-300 hover:-translate-y-1" aria-label={sample ? 'Explore services' : `Open booking ${booking.code}`}>
        <div className="flex items-center justify-between">
          <span className="text-caption font-medium text-ink-muted">{sample ? 'How a booking looks' : `Your booking #${booking.code}`}</span>
          <span className="flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-caption font-semibold text-success-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
            </span>
            Live
          </span>
        </div>
        <p className="mt-3 text-title font-bold">{title}</p>
        <p className="text-body-sm text-ink-secondary">
          {provider} · {when}
        </p>
        <ol className="mt-5">
          {STEPS.map((s, i) => {
            const done = i < reached;
            const current = i === reached;
            return (
              <li key={s.key} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full', done ? 'bg-success-500 text-white' : current ? 'bg-primary-500 text-white ring-4 ring-primary-100' : 'border-2 border-border-strong bg-surface')}>
                    {done ? <Icon name="check" size={11} strokeWidth={3.5} /> : current ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                  {i < STEPS.length - 1 ? <span className={cn('h-5 w-0.5', done ? 'bg-success-500' : 'bg-border')} /> : null}
                </span>
                <span className={cn('-mt-0.5 text-body-sm', current ? 'font-semibold text-primary-700' : done ? 'font-medium' : 'text-ink-muted')}>{s.label}</span>
              </li>
            );
          })}
        </ol>
        {['confirmed', 'on_the_way'].includes(status) || sample ? (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-primary-300 bg-primary-50 px-4 py-3">
            <span>
              <span className="block text-body-sm font-semibold text-primary-700">Start code</span>
              <span className="block text-caption text-ink-secondary">Share it when your pro arrives</span>
            </span>
            <span className="text-h1 font-extrabold tracking-[0.3em] text-primary-700">{code}</span>
          </div>
        ) : null}
      </Link>
      <div className="absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-xl border border-border/80 bg-surface px-3 py-2.5 shadow-md sm:flex xl:-left-10">
        <Avatar name={provider} size={34} rounded="lg" src={sample ? 'https://i.pravatar.cc/200?img=33' : undefined} />
        <span className="text-caption">
          <span className="flex items-center gap-1 font-semibold text-ink">
            Verified pro <Icon name="verified" size={13} className="text-primary-500" />
          </span>
          <span className="text-ink-muted">ID & address checked</span>
        </span>
      </div>
    </div>
  );
}

const bannerTones = ['from-primary-500 to-primary-800', 'from-accent-500 to-accent-700', 'from-highlight-500 to-highlight-700'];

export default function Home() {
  usePageMeta({ title: '' });
  const user = useAuthStore((s) => s.user);
  const customer = user?.role === 'customer' ? user : null;
  const city = useAppStore((s) => s.city);
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const categories = useCategories(null);
  const banners = useBanners();
  const popular = usePopularServices();
  const providers = useProviders({ sort: 'rating' });
  const offers = useOffers();
  const upcoming = useMyBookings('upcoming');
  const nextBooking = customer ? upcoming.data?.[0] : undefined;

  const search = (term: string) => term.trim() && navigate(`/search?q=${encodeURIComponent(term.trim())}`);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,var(--color-primary-50),transparent_45%),radial-gradient(circle_at_10%_90%,var(--color-accent-50),transparent_40%)]" aria-hidden />
        <div className="container-page relative grid items-center gap-10 py-6 sm:py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-16">
          <div>
            <p className="text-body-sm font-medium text-ink-secondary">{customer ? `${greeting()}, ${customer.name.split(' ')[0]}` : `Home services in ${city}`}</p>
            <h1 className="mt-2 max-w-xl text-h1 font-extrabold sm:text-display lg:text-hero">Trusted pros for every corner of your home.</h1>
            <p className="mt-4 max-w-lg text-ink-secondary sm:text-title sm:font-normal">Cleaning, repairs, salon, laundry and car care — with upfront prices, live slots and professionals we’ve verified.</p>
            <SearchBar value={q} onChange={setQ} onSubmit={() => search(q)} placeholder="What do you need help with?" label="Search services" className="mt-6 h-13 max-w-xl text-title shadow-md" />
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Popular searches">
              {['AC service', 'Deep cleaning', 'Haircut', 'Laundry pickup'].map((t) => (
                <Chip key={t} label={t} icon="trending-up" onClick={() => search(t)} />
              ))}
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-ink-secondary">
              {([['shield-check', 'Background-verified pros'], ['tag', 'Upfront pricing'], ['repeat', '7-day re-work guarantee']] as [IconName, string][]).map(([icon, t]) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon name={icon} size={16} className="text-primary-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden pb-6 lg:block">
            <LiveBooking booking={nextBooking} />
          </div>
        </div>
      </section>

      <PageBody className="flex flex-col gap-10 lg:gap-14">
        {/* Next booking — on phones (desktop shows it in the hero) */}
        {nextBooking ? (
          <section className="lg:hidden">
            <SectionHeader title="Your next booking" action="All bookings" to="/bookings" />
            <BookingCard booking={nextBooking} to={`/bookings/${nextBooking.id}`} />
          </section>
        ) : null}

        {/* Categories */}
        <section aria-labelledby="cats">
          <SectionHeader title="What are you looking for?" action="See all" to="/explore" />
          <h2 id="cats" className="sr-only">
            Service categories
          </h2>
          {categories.isPending ? (
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 lg:grid-cols-12">
              {categories.data?.map((cat, i) => (
                <div key={cat.id} className={cn(i >= 7 && 'max-sm:hidden')}>
                  <CategoryTile category={cat} index={i} to={`/category/${cat.id}`} />
                </div>
              ))}
              <Link to="/explore" className="focus-ring flex flex-col items-center gap-2 rounded-xl p-1.5 text-center sm:hidden">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-muted text-ink-secondary">
                  <Icon name="grid" size={24} />
                </span>
                <span className="text-caption font-medium">View all</span>
              </Link>
            </div>
          )}
        </section>

        {/* Banners */}
        <section aria-label="Current promotions">
          {banners.isPending ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : (
            <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {banners.data?.map((b, i) => {
                const icon = categories.data?.find((c) => c.id === b.categoryId)?.icon ?? 'sparkles';
                return (
                  <Link
                    key={b.id}
                    to={b.categoryId ? `/category/${b.categoryId}` : '/explore'}
                    className={cn('focus-ring group relative flex h-40 w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-gradient-to-br p-5 text-white shadow-md sm:w-auto', bannerTones[i % 3])}
                  >
                    <span className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" aria-hidden />
                    <Icon name={icon} size={86} strokeWidth={1.4} className="absolute bottom-3 right-4 opacity-25 transition-transform duration-300 group-hover:scale-110" />
                    <span className="max-w-[75%] text-h3 font-bold">{b.title}</span>
                    <span className="mt-1 max-w-[75%] text-body-sm text-white/85">{b.subtitle}</span>
                    <span className="mt-auto flex w-fit items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-caption font-bold text-ink">
                      {b.cta}
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Popular */}
        <section>
          <SectionHeader title="Most booked this week" action="See all" to="/services?sort=popular" />
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {popular.isPending
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-60 w-52 shrink-0 rounded-card sm:w-auto" />)
              : popular.data?.map((s) => <ServiceCard key={s.id} service={s} className="w-52 shrink-0 sm:w-auto" />)}
          </div>
        </section>

        {/* Offers */}
        {offers.data?.length ? (
          <section>
            <SectionHeader title="Offers for you" action="All offers" to="/offers" />
            <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {offers.data.slice(0, 4).map((p) => (
                <PromoCard key={p.id} promo={p} className="w-[290px] shrink-0 sm:w-auto" />
              ))}
            </div>
          </section>
        ) : null}

        {/* Providers */}
        <section>
          <SectionHeader title="Top-rated professionals" action="See all" to="/professionals" />
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {providers.isPending
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-44 w-44 shrink-0 rounded-card sm:w-auto" />)
              : providers.data?.slice(0, 5).map((p) => <ProviderCard key={p.id} provider={p} compact className="w-44 shrink-0 sm:w-auto" />)}
          </div>
        </section>

        {/* How it works — a real sequence */}
        <section aria-labelledby="how" className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border/70 sm:p-8">
          <h2 id="how" className="text-h2 font-bold">
            How booking works
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {([
              ['search', 'Pick a service', 'Compare prices, what’s included and real reviews before you book.'],
              ['calendar-check', 'Choose a slot', 'See live availability and pay online or after the job — your choice.'],
              ['shield-check', 'Share your start code', 'Your pro starts only with your 4-digit code. Track every step until done.'],
            ] as [IconName, string, string][]).map(([icon, title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon name={icon} size={20} />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-2xs font-bold text-white">{i + 1}</span>
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-body-sm text-ink-secondary">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Supply side */}
        <section className="grid gap-4 md:grid-cols-2" aria-label="Work with Servio">
          <div className="flex flex-col rounded-2xl bg-neutral-900 p-6 text-white sm:p-8">
            <Icon name="briefcase" size={26} className="text-accent-400" />
            <h2 className="mt-4 text-h2 font-bold">Grow your service business</h2>
            <p className="mt-2 max-w-md text-white/70">Get bookings in your city, set your own hours and prices, and get paid out weekly. Individuals and teams welcome.</p>
            <LinkButton to="/signup?role=provider" variant="accent" className="mt-6 w-fit" rightIcon="arrow-right">
              Become a provider
            </LinkButton>
          </div>
          <div className="flex flex-col rounded-2xl bg-accent-50 p-6 ring-1 ring-accent-200 sm:p-8">
            <Icon name="bike" size={26} className="text-accent-600" />
            <h2 className="mt-4 text-h2 font-bold">Deliver with Servio</h2>
            <p className="mt-2 max-w-md text-ink-secondary">Pick up laundry, car keys and spare parts near you. Go online when it suits you and earn per task.</p>
            <LinkButton to="/signup?role=delivery" variant="outline" className="mt-6 w-fit" rightIcon="arrow-right">
              Become a delivery partner
            </LinkButton>
          </div>
        </section>
      </PageBody>
      <CartBar />
    </>
  );
}

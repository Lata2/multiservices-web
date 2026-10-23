import { Link, useNavigate } from 'react-router';
import { BookingCard, CartBar, CategoryTile, PromoCard, ProviderCard, Scene, ServiceArt, ServiceCard } from '@/components/domain';
import { CATEGORY_SCENE } from '@/constants/visuals';
import { Avatar, buttonClasses, Carousel, Chip, cn, HUES, hueAt, Icon, LinkButton, RatingStars, SearchLink, SectionHeader, Skeleton, type IconName } from '@/components/ui';
import { HeroSlider } from '@/features/home/HeroSlider';
import { useBanners, useCategories, useMyBookings, useOffers, usePopularServices, useProviders, useTopReviews } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';

const TRUST: [IconName, string, string][] = [
  ['shield-check', 'Verified pros', 'ID & background checked'],
  ['tag', 'Upfront prices', 'No hidden charges'],
  ['calendar-check', 'Live slots', 'Book in minutes'],
  ['repeat', '7-day re-work', 'Free if not right'],
];

const STEPS: [IconName, string, string][] = [
  ['search', 'Pick a service', 'Compare prices & reviews'],
  ['calendar-check', 'Choose a slot', 'Pay online or after'],
  ['key', 'Share your code', 'Pro starts, you track'],
];

const POPULAR_SEARCHES = ['AC service', 'Deep cleaning', 'Haircut', 'Laundry pickup'];

/** Section wrapper: consistent vertical rhythm for every home section. */
function Section({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <section aria-label={label} className={cn('container-page', className)}>
      {children}
    </section>
  );
}

export default function Home() {
  usePageMeta({ title: '' });
  const user = useAuthStore((s) => s.user);
  const customer = user?.role === 'customer' ? user : null;
  const city = useAppStore((s) => s.city);
  const navigate = useNavigate();

  const categories = useCategories(null);
  const banners = useBanners();
  const popular = usePopularServices();
  const providers = useProviders({ sort: 'rating' });
  const offers = useOffers();
  const reviews = useTopReviews();
  const upcoming = useMyBookings('upcoming');
  const nextBooking = customer ? upcoming.data?.[0] : undefined;

  return (
    <div className="flex flex-col gap-10 pb-6 sm:gap-14">
      <h1 className="sr-only">Servio — trusted home services in {city}</h1>

      {/* Hero slider + quick search */}
      <div className="container-page pt-3 sm:pt-6">
        {customer ? (
          <p className="mb-3 flex items-center gap-2 text-body-sm font-medium text-ink-secondary lg:hidden">
            <Icon name="sun" size={16} className="text-accent-500" />
            Hi {customer.name.split(' ')[0]}, what can we fix today?
          </p>
        ) : null}
        <HeroSlider />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-3 pt-4 lg:mt-5 lg:pt-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:rounded-2xl lg:border lg:border-border/70 lg:bg-surface lg:p-3 lg:shadow-float">
          <SearchLink placeholder="Search ‘deep cleaning’, ‘AC repair’…" className="lg:border-0 lg:bg-surface-muted lg:shadow-none" />
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" aria-label="Popular searches">
            {POPULAR_SEARCHES.map((t) => (
              <Chip key={t} label={t} icon="trending-up" onClick={() => navigate(`/search?q=${encodeURIComponent(t)}`)} />
            ))}
          </div>
        </div>
      </div>

      {/* Next booking */}
      {nextBooking ? (
        <Section label="Your next booking">
          <SectionHeader title="Your next booking" action="All bookings" to="/bookings" icon="calendar-clock" />
          <div className="max-w-xl">
            <BookingCard booking={nextBooking} to={`/bookings/${nextBooking.id}`} />
          </div>
        </Section>
      ) : null}

      {/* Categories */}
      <Section label="Service categories">
        <SectionHeader title="Explore services" action="See all" to="/explore" size="lg" />
        {categories.isPending ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className={cn('aspect-square rounded-2xl', i >= 8 && 'max-sm:hidden')} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-6 lg:grid-cols-12">
            {categories.data?.map((cat, i) => (
              <div key={cat.id} className={cn('flex justify-center', i >= 7 && 'max-sm:hidden')}>
                <CategoryTile category={cat} index={i} to={`/category/${cat.id}`} />
              </div>
            ))}
            <Link to="/explore" className="focus-ring group flex flex-col items-center gap-2 rounded-2xl text-center sm:hidden">
              <span className="card-hover flex aspect-square w-full max-w-[76px] items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface text-ink-secondary">
                <Icon name="grid" size={24} />
              </span>
              <span className="text-caption font-semibold">View all</span>
            </Link>
          </div>
        )}
      </Section>

      {/* Guest welcome — sign up / sign in entry points */}
      {!user ? (
        <Section label="Create your account">
          <div className="relative isolate flex flex-col gap-4 overflow-hidden rounded-[24px] border border-primary-100 bg-[linear-gradient(120deg,var(--color-primary-50),#fff_55%,var(--color-accent-50))] p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(150deg,var(--color-accent-400),var(--color-accent-600))] text-white shadow-md">
              <Icon name="gift" size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-title font-bold sm:text-h3">₹500 off your first booking</p>
              <p className="text-body-sm text-ink-secondary">
                Sign up and use <span className="font-bold text-accent-700">WELCOME500</span> on orders above ₹1,999.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <LinkButton to="/signup" className="rounded-full px-3">
                Sign up free
              </LinkButton>
              <LinkButton to="/login" variant="outline" className="rounded-full">
                Sign in
              </LinkButton>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Promotions slider */}
      <Section label="Current promotions">
        {banners.isPending ? (
          <Skeleton className="h-44 rounded-2xl" />
        ) : (
          <Carousel label="Current promotions" slideClassName="w-[88%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]" bleed dots arrows="overlay" dotsClassName="lg:hidden">
            {(banners.data ?? []).map((b, i) => {
              const hue = hueAt(i === 0 ? 5 : i === 1 ? 0 : 3);
              const scene = (b.categoryId && CATEGORY_SCENE[b.categoryId]) || 'clean';
              return (
                <Link
                  key={b.id}
                  to={b.categoryId ? `/category/${b.categoryId}` : '/explore'}
                  className={cn('focus-ring card-hover group relative isolate flex h-44 overflow-hidden rounded-2xl text-white shadow-md sm:h-48', HUES[hue].bold)}
                >
                  <span className="dot-grid absolute inset-0 -z-10 opacity-10" aria-hidden />
                  <span className="relative z-10 flex w-[60%] flex-col p-4 sm:w-[56%] sm:p-5 lg:w-[60%] lg:p-4 xl:w-[56%] xl:p-5">
                    <span className="line-clamp-2 text-title font-extrabold leading-tight sm:text-h3 lg:text-title xl:text-h3">{b.title}</span>
                    <span className="mt-1.5 line-clamp-1 text-caption text-white/85 sm:line-clamp-2 sm:text-body-sm">{b.subtitle}</span>
                    <span className="mt-auto inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-caption font-bold text-ink shadow-sm transition-transform group-hover:translate-x-0.5">
                      {b.cta}
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </span>
                  <span className="absolute inset-y-3 right-3 w-[37%] overflow-hidden sm:w-[42%] lg:w-[36%] xl:w-[42%] rounded-xl ring-1 ring-white/40 transition-transform duration-500 group-hover:scale-[1.03]">
                    <Scene scene={scene} hue={hue} />
                  </span>
                </Link>
              );
            })}
          </Carousel>
        )}
      </Section>

      {/* Most booked */}
      <Section label="Most booked services">
        <Carousel
          label="Most booked services"
          header={<SectionHeader title="Most booked this week" action="See all" to="/services?sort=popular" size="lg" className="mb-0" />}
          arrows="header"
          bleed
          gapClassName="gap-3 sm:gap-4"
          slideClassName="w-[46%] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] pb-2"
        >
          {popular.isPending
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
            : (popular.data ?? []).map((s) => <ServiceCard key={s.id} service={s} />)}
        </Carousel>
      </Section>

      {/* Trust strip */}
      <Section label="Why Servio">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TRUST.map(([icon, title, sub], i) => {
            const h = HUES[hueAt(i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 3)];
            return (
              <li key={title} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3.5 shadow-sm sm:p-4">
                <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', h.surface, h.ink)}>
                  <Icon name={icon} size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body-sm font-bold sm:text-body">{title}</span>
                  <span className="hidden truncate text-caption text-ink-muted sm:block">{sub}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Offers */}
      {offers.data?.length ? (
        <Section label="Offers for you">
          <Carousel
            label="Promo codes"
            header={<SectionHeader title="Offers for you" action="All offers" to="/offers" size="lg" className="mb-0" />}
            arrows="header"
            bleed
            gapClassName="gap-3"
            slideClassName="w-[86%] sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)]"
          >
            {offers.data.map((p) => (
              <PromoCard key={p.id} promo={p} compact className="h-full" />
            ))}
          </Carousel>
        </Section>
      ) : null}

      {/* How it works — a real sequence */}
      <Section label="How booking works">
        <div className="relative overflow-hidden rounded-[28px] bg-neutral-900 px-5 py-8 text-white sm:px-10 sm:py-10">
          <span className="dot-grid absolute inset-0 opacity-[0.07]" aria-hidden />
          <span className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" aria-hidden />
          <h2 className="relative text-h2 font-bold sm:text-display">Booked in 3 taps</h2>
          <ol className="relative mt-7 grid gap-5 sm:grid-cols-3 sm:gap-6">
            {STEPS.map(([icon, title, sub], i) => (
              <li key={title} className="flex items-center gap-4 sm:flex-col sm:items-start">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <Icon name={icon} size={24} className="text-accent-300" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-caption font-bold text-white">{i + 1}</span>
                </span>
                <span>
                  <span className="block text-title font-semibold">{title}</span>
                  <span className="block text-body-sm text-white/65">{sub}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Professionals */}
      <Section label="Top-rated professionals">
        <Carousel
          label="Top-rated professionals"
          header={<SectionHeader title="Top-rated pros" action="See all" to="/professionals" size="lg" className="mb-0" />}
          arrows="header"
          bleed
          gapClassName="gap-3 sm:gap-4"
          slideClassName="w-[44%] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)] pb-2"
        >
          {providers.isPending
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            : (providers.data ?? []).slice(0, 8).map((p) => <ProviderCard key={p.id} provider={p} compact />)}
        </Carousel>
      </Section>

      {/* Testimonials */}
      {reviews.data?.length ? (
        <Section label="What customers say">
          <Carousel
            label="Customer reviews"
            header={<SectionHeader title="Loved by customers" size="lg" className="mb-0" />}
            arrows="header"
            bleed
            dots
            gapClassName="gap-3 sm:gap-4"
            slideClassName="w-[84%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            dotsClassName="lg:hidden"
          >
            {reviews.data.map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-2xl border border-border/70 bg-surface p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <RatingStars value={r.rating} size={15} />
                  <Icon name="quote" size={26} className="text-primary-100" filled />
                </div>
                <blockquote className="mt-3 flex-1 text-body font-medium leading-6 text-ink">“{r.comment}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border/70 pt-4">
                  <Avatar src={r.customerAvatar} name={r.customerName} size={38} />
                  <span className="min-w-0">
                    <span className="block truncate text-body-sm font-semibold">{r.customerName}</span>
                    {r.serviceTitle ? <span className="block truncate text-caption text-ink-muted">{r.serviceTitle}</span> : null}
                  </span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </Section>
      ) : null}

      {/* Work with Servio */}
      <Section label="Work with Servio" className="grid gap-4 md:grid-cols-2">
        {(
          [
            { hue: 'primary', icon: 'briefcase', title: 'Become a pro', sub: 'More bookings. Your hours. Weekly pay.', to: '/signup?role=provider', cta: 'Join as provider', art: ['wallet', 'calendar', 'star'] },
            { hue: 'accent', icon: 'bike', title: 'Deliver with Servio', sub: 'Pickups near you. Earn per task.', to: '/signup?role=delivery', cta: 'Join as partner', art: ['package', 'route', 'cash'] },
          ] as const
        ).map((c) => (
          <Link key={c.to} to={c.to} className={cn('focus-ring card-hover group relative isolate flex min-h-[200px] overflow-hidden rounded-[24px] p-6 text-white sm:p-8', HUES[c.hue].bold)}>
            <span className="dot-grid absolute inset-0 -z-10 opacity-10" aria-hidden />
            <span className="flex max-w-[58%] flex-col">
              <span className="text-h2 font-extrabold leading-tight">{c.title}</span>
              <span className="mt-2 text-body-sm text-white/85">{c.sub}</span>
              <span className={cn(buttonClasses({ variant: 'white', size: 'md', className: 'mt-auto w-fit rounded-full' }), 'pointer-events-none')}>
                {c.cta}
                <Icon name="arrow-right" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
            <ServiceArt icon={c.icon} hue={c.hue} satellites={[...c.art]} animated={false} className="absolute right-0 top-1/2 w-[44%] max-w-[220px] -translate-y-1/2 sm:right-2" />
          </Link>
        ))}
      </Section>

      <CartBar />
    </div>
  );
}

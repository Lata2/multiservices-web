import { Link } from 'react-router';
import { FloatingChip, Scene, type ArtChip } from '@/components/domain';
import { buttonClasses, Carousel, cn, HUES, Icon, type Hue, type IconName } from '@/components/ui';
import type { SceneKey } from '@/constants/visuals';

export interface HeroSlide {
  id: string;
  hue: Hue;
  kicker: { icon: IconName; label: string };
  title: string;
  text: string;
  cta: { label: string; to: string };
  secondary?: { label: string; to: string };
  /** Illustrated scene shown when no photo is supplied. */
  scene: SceneKey;
  /** Optional photo (e.g. `/images/hero-cleaning.webp` or a CDN URL). Replaces the scene. */
  image?: string;
  chips: [ArtChip, ArtChip?];
}

/** Hero slides — short copy, one primary action each. Offers reference real promo codes. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'clean',
    hue: 'primary',
    kicker: { icon: 'badge-percent', label: 'CLEAN20 · 20% off cleaning' },
    title: 'Spotless homes, zero effort',
    text: 'Deep cleaning by verified pros, at a time you pick.',
    cta: { label: 'Book cleaning', to: '/category/cat_clean' },
    secondary: { label: 'All services', to: '/explore' },
    scene: 'clean',
    chips: [{ icon: 'star', label: '4.8 · 12k+ homes' }, { icon: 'shield-check', label: 'Background checked' }],
  },
  {
    id: 'ac',
    hue: 'info',
    kicker: { icon: 'badge-percent', label: 'COOL15 · 15% off AC service' },
    title: 'Beat the heat, fast',
    text: 'AC service, repair and installs at your door.',
    cta: { label: 'Book AC service', to: '/category/cat_ac' },
    secondary: { label: 'View offers', to: '/offers' },
    scene: 'ac',
    chips: [{ icon: 'calendar-check', label: 'Slots today', iconClass: 'text-primary-500' }, { icon: 'verified', label: 'Genuine spares' }],
  },
  {
    id: 'salon',
    hue: 'highlight',
    kicker: { icon: 'badge-percent', label: 'GLOW250 · ₹250 off salon' },
    title: 'Salon glow, at home',
    text: 'Certified beauticians with single-use kits.',
    cta: { label: 'Book salon', to: '/category/cat_salon' },
    secondary: { label: 'Men’s grooming', to: '/category/cat_men' },
    scene: 'salon',
    chips: [{ icon: 'star', label: 'Top rated' }, { icon: 'shield-check', label: 'Hygiene first' }],
  },
  {
    id: 'car',
    hue: 'success',
    kicker: { icon: 'car', label: 'Doorstep car care' },
    title: 'Shine without the queue',
    text: 'Foam wash at home, or free workshop pickup.',
    cta: { label: 'Book car wash', to: '/category/cat_car' },
    secondary: { label: 'Laundry pickup', to: '/category/cat_laundry' },
    scene: 'car',
    chips: [{ icon: 'clock', label: 'Done in 45 min', iconClass: 'text-primary-500' }, { icon: 'truck', label: 'Free pickup' }],
  },
  {
    id: 'pro',
    hue: 'accent',
    kicker: { icon: 'briefcase', label: 'For professionals' },
    title: 'Grow your business with Servio',
    text: 'Local bookings, your own hours, weekly payouts.',
    cta: { label: 'Become a pro', to: '/signup?role=provider' },
    secondary: { label: 'Deliver with us', to: '/signup?role=delivery' },
    scene: 'pro',
    chips: [{ icon: 'wallet', label: 'Weekly payouts', iconClass: 'text-success-600' }, { icon: 'calendar-check', label: 'Your schedule' }],
  },
];

function Slide({ slide, first }: { slide: HeroSlide; first: boolean }) {
  const [chipA, chipB] = slide.chips;
  return (
    <article className={cn('relative isolate w-full overflow-hidden rounded-[24px] text-white sm:rounded-[28px]', HUES[slide.hue].bold)}>
      <span className="dot-grid absolute inset-0 -z-10 text-white opacity-[0.09]" aria-hidden />
      <span className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10" aria-hidden />
      <span className="absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-black/10 blur-2xl" aria-hidden />

      <div className="grid h-full items-center gap-5 p-3.5 pb-14 sm:gap-6 sm:p-7 sm:pb-16 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-10 md:pb-16 md:pl-10 md:pr-8 md:pt-10 lg:pb-[68px] lg:pl-14 lg:pr-12 lg:pt-12">
        {/* Visual: photo when provided, otherwise the illustrated scene */}
        <div className="relative md:order-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-white shadow-float ring-1 ring-white/40 sm:rounded-[22px] md:aspect-[4/3] md:rotate-[1.5deg]">
            {slide.image ? (
              <img src={slide.image} alt="" className="h-full w-full object-cover" loading={first ? 'eager' : 'lazy'} decoding="async" fetchPriority={first ? 'high' : 'auto'} />
            ) : (
              <Scene scene={slide.scene} hue={slide.hue} />
            )}
          </div>
          <FloatingChip chip={chipA} index={0} className="absolute left-2.5 top-2.5 shadow-md md:-left-6 md:bottom-8 md:top-auto" />
          {chipB ? <FloatingChip chip={chipB} index={1} className="absolute -right-3 top-6 max-md:hidden" /> : null}
        </div>

        <div className="px-1.5 sm:px-0 md:order-1">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-caption font-semibold ring-1 ring-white/25 backdrop-blur">
            <Icon name={slide.kicker.icon} size={14} />
            <span className="truncate">{slide.kicker.label}</span>
          </span>
          <h2 className="mt-3 max-w-lg text-[26px] font-extrabold leading-[1.12] tracking-[-0.025em] sm:text-[38px] lg:text-hero">{slide.title}</h2>
          <p className="mt-2 max-w-sm text-body-sm text-white/85 sm:mt-3 sm:text-title sm:font-normal">{slide.text}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-2.5">
            <Link to={slide.cta.to} className={buttonClasses({ variant: 'white', size: 'lg', className: 'rounded-full px-5 shadow-float sm:px-6' })}>
              {slide.cta.label}
              <Icon name="arrow-right" size={17} />
            </Link>
            {slide.secondary ? (
              <Link to={slide.secondary.to} className="focus-ring inline-flex h-12 items-center rounded-full px-4 text-body-sm font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 sm:text-body">
                {slide.secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Home hero: auto-advancing, swipeable slider with arrows, progress dots and a pause control. */
export function HeroSlider({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  return (
    <Carousel
      label="Featured services"
      autoPlay={6500}
      arrows="overlay"
      overlayArrows="corner"
      dots
      dotsTone="light"
      gapClassName="gap-3"
      dotsClassName="absolute inset-x-0 bottom-4 mt-0 sm:bottom-5"
      className="[&_ul>li]:flex"
    >
      {slides.map((s, i) => (
        <Slide key={s.id} slide={s} first={i === 0} />
      ))}
    </Carousel>
  );
}

import { Children, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './Icon';

export interface CarouselProps {
  children: ReactNode;
  /** Accessible name, e.g. "Featured services". */
  label: string;
  /** Width of each slide, e.g. `w-full` (hero) or `w-[78%] sm:w-[46%] lg:w-[23.5%]` (card rail). */
  slideClassName?: string;
  gapClassName?: string;
  /** Milliseconds between automatic advances. Pauses on hover, focus, hidden tab and reduced motion. */
  autoPlay?: number;
  /** `overlay` = round buttons over the edges, `header` = buttons beside the heading, `none`. */
  arrows?: 'overlay' | 'header' | 'none';
  dots?: boolean;
  /** Dot style: `light` for dark backgrounds (hero), `dark` for light ones. */
  dotsTone?: 'light' | 'dark';
  /** Content rendered at the left of the header row (title); arrows sit on its right. */
  header?: ReactNode;
  /** Let slides run to the screen edge on phones (cards peek). */
  bleed?: boolean;
  className?: string;
  trackClassName?: string;
  dotsClassName?: string;
  /** Where overlay arrows sit: on each side (cards) or grouped bottom-right on glass (hero). */
  overlayArrows?: 'sides' | 'corner';
  /** Called when the visible slide changes. */
  onIndexChange?: (i: number) => void;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Accessible, dependency-free carousel built on native scroll-snap: touch swipe and
 * trackpad scrolling work natively; arrows, dots, keyboard and autoplay drive `scrollTo`.
 * Used for the hero slider and for card rails.
 */
export function Carousel({
  children,
  label,
  slideClassName = 'w-full',
  gapClassName = 'gap-4',
  autoPlay,
  arrows = 'overlay',
  dots = false,
  dotsTone = 'dark',
  header,
  bleed,
  className,
  trackClassName,
  dotsClassName,
  overlayArrows = 'sides',
  onIndexChange,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const track = useRef<HTMLUListElement>(null);
  const id = useId();
  const [index, setIndex] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: count <= 1 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced] = useState(prefersReducedMotion);

  const slideEls = () => Array.from(track.current?.children ?? []) as HTMLElement[];

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const items = slideEls();
    if (!items.length) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const x = el.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - pad - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    const max = el.scrollWidth - el.clientWidth;
    const end = x >= max - 4;
    // At the end of a rail the last slides can't snap to the start — treat the last one as active.
    const i = end ? items.length - 1 : best;
    setIndex((prev) => (prev === i ? prev : i));
    setEdges({ start: x <= 4, end });
  }, []);

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure, count]);

  // Only autoplay while on screen and the tab is visible.
  useEffect(() => {
    const el = track.current;
    if (!el || !autoPlay) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && !document.hidden), { threshold: 0.35 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [autoPlay]);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      const items = slideEls();
      if (!el || !items.length) return;
      const target = items[Math.max(0, Math.min(items.length - 1, i))];
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      el.scrollTo({ left: target.offsetLeft - pad, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [],
  );

  /** How many slides fit in the viewport — arrows move a "page" at a time. */
  const perView = () => {
    const el = track.current;
    const first = slideEls()[0];
    if (!el || !first) return 1;
    return Math.max(1, Math.floor((el.clientWidth + 8) / first.offsetWidth));
  };
  const next = () => (edges.end ? goTo(0) : goTo(index + perView()));
  const prev = () => (edges.start ? goTo(count - 1) : goTo(index - perView()));

  const playing = !!autoPlay && count > 1 && !reduced && !userPaused && !hovered && !focused && visible;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => (index >= count - 1 || edges.end ? goTo(0) : goTo(index + 1)), autoPlay);
    return () => clearTimeout(t);
  }, [playing, index, count, autoPlay, goTo, edges.end]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    if (e.key === 'ArrowRight') next();
    else prev();
  };

  const arrowBtn = (dir: 'prev' | 'next', cls?: string) => {
    const disabled = !autoPlay && (dir === 'prev' ? edges.start : edges.end);
    return (
      <button
        type="button"
        onClick={dir === 'prev' ? prev : next}
        disabled={disabled}
        aria-controls={id}
        aria-label={dir === 'prev' ? 'Previous slide' : 'Next slide'}
        className={cn(
          'focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-md transition-[opacity,transform,background-color] duration-200 hover:bg-primary-50 hover:text-primary-600 active:scale-95 disabled:pointer-events-none disabled:opacity-0',
          cls,
        )}
      >
        <Icon name={dir === 'prev' ? 'chevron-left' : 'chevron-right'} size={19} />
      </button>
    );
  };

  if (!count) return null;
  const showArrows = arrows !== 'none' && count > 1 && !(edges.start && edges.end);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn('relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
      onKeyDown={onKeyDown}
    >
      {header || (arrows === 'header' && showArrows) ? (
        <div className="mb-3.5 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">{header}</div>
          {arrows === 'header' && showArrows ? (
            <div className="hidden shrink-0 gap-2 md:flex">
              {arrowBtn('prev', 'h-9 w-9 shadow-sm disabled:opacity-40')}
              {arrowBtn('next', 'h-9 w-9 shadow-sm disabled:opacity-40')}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        <ul
          id={id}
          ref={track}
          aria-live={playing ? 'off' : 'polite'}
          className={cn(
            'scrollbar-none relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
            gapClassName,
            bleed && '-mx-4 scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0',
            trackClassName,
          )}
        >
          {slides.map((s, i) => (
            <li key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} className={cn('shrink-0 snap-start', slideClassName)}>
              {s}
            </li>
          ))}
        </ul>
        {arrows === 'overlay' && showArrows && overlayArrows === 'corner' ? (
          <div className="absolute bottom-3 right-4 z-10 hidden gap-2 md:flex lg:bottom-5 lg:right-6">
            {arrowBtn('prev', 'border-white/30 bg-white/15 text-white shadow-none backdrop-blur hover:bg-white/30 hover:text-white')}
            {arrowBtn('next', 'border-white/30 bg-white/15 text-white shadow-none backdrop-blur hover:bg-white/30 hover:text-white')}
          </div>
        ) : null}
        {arrows === 'overlay' && showArrows && overlayArrows === 'sides' ? (
          <>
            {arrowBtn('prev', 'absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 md:flex')}
            {arrowBtn('next', 'absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 md:flex')}
          </>
        ) : null}
      </div>

      {dots && count > 1 ? (
        <div className={cn('mt-3 flex items-center justify-center gap-1.5', dotsClassName)}>
          {slides.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={active ? 'true' : undefined}
                aria-controls={id}
                className="focus-ring group flex h-6 items-center rounded-full px-0.5"
              >
                <span
                  className={cn(
                    'relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300',
                    active ? 'w-7' : 'w-1.5',
                    dotsTone === 'light' ? (active ? 'bg-white/35' : 'bg-white/50 group-hover:bg-white/80') : active ? 'bg-primary-200' : 'bg-neutral-300 group-hover:bg-neutral-400',
                  )}
                >
                  {active ? (
                    <span
                      key={`${index}-${playing}`}
                      className={cn('absolute inset-0 origin-left rounded-full', dotsTone === 'light' ? 'bg-white' : 'bg-primary-500', playing && 'animate-dot-progress')}
                      style={playing ? { animationDuration: `${autoPlay}ms` } : undefined}
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
          {autoPlay && !reduced ? (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              className={cn('focus-ring ml-1 flex h-6 w-6 items-center justify-center rounded-full', dotsTone === 'light' ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink')}
            >
              <Icon name={userPaused ? 'play' : 'pause'} size={13} filled />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

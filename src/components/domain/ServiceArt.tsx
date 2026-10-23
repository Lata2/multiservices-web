import { cn, HUES, Icon, type Hue, type IconName } from '../ui';

export interface ArtChip {
  icon: IconName;
  label: string;
  /** Tailwind text colour for the chip icon. */
  iconClass?: string;
}

const SATELLITE_POS = ['left-[6%] top-[10%]', 'right-[4%] top-[14%]', 'bottom-[12%] left-[2%]', 'bottom-[4%] right-[16%]'];
const CHIP_POS = ['left-0 top-[62%] -translate-x-[8%]', 'right-0 top-[34%] translate-x-[6%]'];

/**
 * Illustrated scene built from brand shapes and icons: a glossy medallion with the
 * service glyph, orbiting tiles and floating "app" chips. Scales with its box
 * (give it a width; height follows from `aspect-square`).
 *
 * `tone="onDark"` is for gradient hero/banner backgrounds, `tone="light"` for pale surfaces.
 */
export function ServiceArt({
  icon,
  hue = 'primary',
  satellites = [],
  chips = [],
  tone = 'onDark',
  animated = true,
  className,
  chipsClassName,
}: {
  icon: IconName;
  hue?: Hue;
  satellites?: IconName[];
  chips?: ArtChip[];
  tone?: 'onDark' | 'light';
  animated?: boolean;
  className?: string;
  /** e.g. `max-md:hidden` to drop the chips where the art is small. */
  chipsClassName?: string;
}) {
  const h = HUES[hue];
  const dark = tone === 'onDark';
  return (
    <div className={cn('relative aspect-square select-none', className)} aria-hidden>
      {/* orbit rings */}
      <span className={cn('absolute inset-[4%] rounded-full border', dark ? 'border-white/15' : h.line)} />
      <span className={cn('absolute inset-[17%] rounded-full border border-dashed', dark ? 'border-white/25' : h.line)} />
      <span className={cn('absolute inset-[24%] rounded-full blur-2xl', dark ? 'bg-white/25' : 'bg-white')} />

      {/* back plate + medallion */}
      <span className={cn('absolute inset-[29%] rotate-[14deg] rounded-[30%]', dark ? 'bg-white/20 ring-1 ring-white/25' : h.plate)} />
      <span className={cn('absolute inset-[26%] flex -rotate-6 items-center justify-center overflow-hidden rounded-[30%] shadow-float ring-1 ring-white/70', h.medal)}>
        <span className="absolute inset-x-[10%] top-[5%] h-[34%] rounded-full bg-white/80 blur-md" />
        <Icon name={icon} size={64} strokeWidth={1.6} className={cn('relative size-[46%] rotate-6', h.ink)} />
      </span>

      {/* orbiting tiles */}
      {satellites.slice(0, 4).map((s, i) => (
        <span
          key={s + i}
          className={cn(
            'absolute flex size-[15%] items-center justify-center rounded-[28%] bg-white shadow-md ring-1 ring-black/5',
            SATELLITE_POS[i],
            animated && 'motion-safe:animate-float',
          )}
          style={animated ? { animationDelay: `${i * -1.6}s` } : undefined}
        >
          <Icon name={s} size={24} className={cn('size-[52%]', h.ink)} />
        </span>
      ))}

      {/* floating app chips */}
      {chips.slice(0, 2).map((c, i) => (
        <FloatingChip key={c.label} chip={c} index={i} animated={animated} className={cn('absolute', CHIP_POS[i], chipsClassName)} />
      ))}
    </div>
  );
}

/** White pill with a tinted icon — the "app notification" badge floating over hero art. */
export function FloatingChip({ chip, index = 0, animated = true, className }: { chip: ArtChip; index?: number; animated?: boolean; className?: string }) {
  return (
    <span
      className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white py-1.5 pl-1.5 pr-3 text-caption font-semibold text-ink shadow-float', animated && 'motion-safe:animate-float', className)}
      style={animated ? { animationDelay: `${-2.5 - index * 2}s` } : undefined}
    >
      <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', index === 0 ? 'bg-warning-50' : 'bg-success-50')}>
        <Icon name={chip.icon} size={13} className={chip.iconClass ?? (index === 0 ? 'text-warning-500' : 'text-success-600')} filled={chip.icon === 'star'} />
      </span>
      {chip.label}
    </span>
  );
}

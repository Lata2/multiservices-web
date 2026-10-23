import { useMemo, useState } from 'react';
import { useCategories } from '@/hooks/api';
import { CATEGORY_SCENE, SUBCATEGORY_ICON } from '@/constants/visuals';
import { cn, HUES, hueAt, Icon, type IconName } from '../ui';
import { Scene } from './Scenes';

/** Returns icon + tint index for a category id (from the cached categories query). */
export function useCategoryVisual(categoryId?: string) {
  const { data } = useCategories(null);
  return useMemo(() => {
    const idx = data?.findIndex((c) => c.id === categoryId) ?? -1;
    const cat = idx >= 0 ? data![idx] : undefined;
    const tint = (idx >= 0 ? idx : 0) % 6;
    return { icon: (cat?.icon ?? 'wrench') as IconName, tint, hue: hueAt(tint), name: cat?.name, scene: categoryId ? CATEGORY_SCENE[categoryId] : undefined };
  }, [data, categoryId]);
}

/**
 * Service artwork: the remote image when present, otherwise an illustration.
 * `variant="tile"` (default) — tinted surface with a glossy medallion showing the
 * sub-category glyph (so services in one category still look distinct).
 * `variant="scene"` — the category's illustrated scene, for large headers.
 */
export function ServiceThumb({
  image,
  categoryId,
  subcategoryId,
  variant = 'tile',
  className,
  iconSize = 30,
  alt = '',
}: {
  image?: string;
  categoryId?: string;
  subcategoryId?: string;
  variant?: 'tile' | 'scene';
  className?: string;
  iconSize?: number;
  alt?: string;
}) {
  const visual = useCategoryVisual(categoryId);
  const { hue, scene } = visual;
  const icon = (subcategoryId && SUBCATEGORY_ICON[subcategoryId]) || visual.icon;
  const h = HUES[hue];
  const [failed, setFailed] = useState(false);
  const medal = Math.round(iconSize * 1.9);
  if (variant === 'scene' && scene && (!image || failed)) {
    return (
      <div className={cn('relative shrink-0 overflow-hidden', h.surface, className)}>
        <Scene scene={scene} hue={hue} />
        {image ? <img src={image} alt={alt} decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" /> : null}
      </div>
    );
  }
  return (
    <div className={cn('relative shrink-0 overflow-hidden', h.surface, className)}>
      <span className={cn('dot-grid absolute inset-0 opacity-[0.16]', h.ink)} aria-hidden />
      <span className={cn('absolute -right-[18%] -top-[30%] aspect-square w-[70%] rounded-full border-[10px] opacity-60', h.line)} aria-hidden />
      <span className="absolute -bottom-[40%] -left-[12%] aspect-square w-[60%] rounded-full bg-white/50" aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn('relative flex -rotate-6 items-center justify-center rounded-[30%] shadow-md ring-1 ring-white/80 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105', h.medal)}
          style={{ width: medal, height: medal }}
        >
          <Icon name={icon} size={iconSize} strokeWidth={1.75} className={cn('rotate-6 group-hover:rotate-0', h.ink)} />
        </span>
      </div>
      {image && !failed ? <img src={image} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" /> : null}
    </div>
  );
}

export function CategoryIconBadge({ categoryId, size = 40, className }: { categoryId: string; size?: number; className?: string }) {
  const { icon, tint } = useCategoryVisual(categoryId);
  return (
    <span className={cn(`tint-${tint}`, 'flex shrink-0 items-center justify-center rounded-lg', className)} style={{ width: size, height: size }}>
      <Icon name={icon} size={size * 0.48} />
    </span>
  );
}

import { useMemo, useState } from 'react';
import { useCategories } from '@/hooks/api';
import { cn, Icon } from '../ui';

const gradients = [
  'from-primary-100 to-white text-primary-600',
  'from-accent-100 to-white text-accent-600',
  'from-success-100 to-white text-success-600',
  'from-highlight-100 to-white text-highlight-600',
  'from-danger-100 to-white text-danger-600',
  'from-info-100 to-white text-info-600',
];

/** Returns icon + tint index for a category id (from the cached categories query). */
export function useCategoryVisual(categoryId?: string) {
  const { data } = useCategories(null);
  return useMemo(() => {
    const idx = data?.findIndex((c) => c.id === categoryId) ?? -1;
    const cat = idx >= 0 ? data![idx] : undefined;
    const tint = (idx >= 0 ? idx : 0) % 6;
    return { icon: cat?.icon ?? 'wrench', tint, name: cat?.name };
  }, [data, categoryId]);
}

/**
 * Service artwork: the remote image when present, otherwise a branded gradient tile with
 * the category glyph — always looks intentional, even offline.
 */
export function ServiceThumb({ image, categoryId, className, iconSize = 30, alt = '' }: { image?: string; categoryId?: string; className?: string; iconSize?: number; alt?: string }) {
  const { icon, tint } = useCategoryVisual(categoryId);
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn('relative shrink-0 overflow-hidden bg-gradient-to-br', gradients[tint], className)}>
      <Icon name={icon} size={iconSize * 2.4} strokeWidth={1.5} className="absolute -bottom-[18%] -right-[12%] opacity-[0.13]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon name={icon} size={iconSize} strokeWidth={1.75} />
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

import { useState } from 'react';
import { initials } from '@/utils/format';
import { cn } from './cn';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  rounded?: 'full' | 'lg';
  ring?: boolean;
  className?: string;
}

const tints = ['tint-0', 'tint-1', 'tint-2', 'tint-3', 'tint-4', 'tint-5'];

/** Image avatar with a deterministic initials fallback (works offline / on broken images). */
export function Avatar({ src, name, size = 44, rounded = 'full', ring, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const tint = tints[(name.charCodeAt(0) + name.length) % tints.length];
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden font-bold', tint, rounded === 'full' ? 'rounded-full' : 'rounded-lg', ring && 'ring-4 ring-surface', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(name)}
      {src && !failed ? (
        <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
    </span>
  );
}

import type { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from './cn';

type Elevation = 'none' | 'sm' | 'md' | 'lg';
const shadow: Record<Elevation, string> = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' };

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  padded?: boolean;
  bordered?: boolean;
}

export function cardClasses({ elevation = 'sm', padded = true, bordered = true, className }: { elevation?: Elevation; padded?: boolean; bordered?: boolean; className?: string }) {
  return cn('rounded-card bg-surface', bordered && 'border border-border/80', padded && 'p-4 sm:p-5', shadow[elevation], className);
}

export function Card({ elevation, padded, bordered, className, ...rest }: CardProps) {
  return <div className={cardClasses({ elevation, padded, bordered, className })} {...rest} />;
}

/** A whole card that navigates. Use only when the card has no nested interactive controls. */
export function CardLink({ to, className, children, elevation, padded, bordered, ariaLabel }: { to: string; className?: string; children: ReactNode; elevation?: Elevation; padded?: boolean; bordered?: boolean; ariaLabel?: string }) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={cn(cardClasses({ elevation, padded, bordered }), 'focus-ring block transition-[box-shadow,border-color,transform] duration-200 hover:border-primary-200 hover:shadow-md', className)}
    >
      {children}
    </Link>
  );
}

/** Clickable card rendered as a button (for cards that open sheets / trigger actions). */
export function CardButton({ onClick, className, children, elevation, padded, bordered, ariaLabel, selected }: { onClick: () => void; className?: string; children: ReactNode; elevation?: Elevation; padded?: boolean; bordered?: boolean; ariaLabel?: string; selected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={cn(cardClasses({ elevation, padded, bordered }), 'focus-ring block w-full text-left transition-[box-shadow,border-color] duration-200 hover:border-primary-200 hover:shadow-md', className)}
    >
      {children}
    </button>
  );
}

import { cn } from './cn';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'highlight';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-ink-secondary',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  info: 'bg-info-50 text-info-700',
  accent: 'bg-accent-50 text-accent-700',
  highlight: 'bg-highlight-50 text-highlight-700',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export function Badge({ label, tone = 'neutral', icon, size = 'sm', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-semibold',
        size === 'sm' ? 'gap-1 px-2 py-0.5 text-2xs' : 'gap-1.5 px-2.5 py-1 text-caption',
        tones[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 11 : 13} /> : null}
      {label}
    </span>
  );
}

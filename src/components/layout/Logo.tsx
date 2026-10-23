import { Link } from 'react-router';
import { cn, Icon } from '../ui';

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-[28%] bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-brand', className)} style={{ width: size, height: size }}>
      <Icon name="sparkles" size={size * 0.56} strokeWidth={2.2} filled />
    </span>
  );
}

export function Logo({ to = '/', subtitle, className, light }: { to?: string; subtitle?: string; className?: string; light?: boolean }) {
  return (
    <Link to={to} className={cn('focus-ring flex items-center gap-2.5 rounded-lg', className)} aria-label="Servio home">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn('text-[19px] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink')}>Servio</span>
        {subtitle ? <span className={cn('mt-0.5 text-caption font-medium', light ? 'text-white/70' : 'text-ink-muted')}>{subtitle}</span> : null}
      </span>
    </Link>
  );
}

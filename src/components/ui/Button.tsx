import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'accent' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-brand',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  outline: 'bg-surface text-ink border border-border-strong hover:border-primary-300 hover:bg-primary-50/50',
  ghost: 'bg-transparent text-primary-600 hover:bg-primary-50',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  success: 'bg-success-500 text-white hover:bg-success-600',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
  white: 'bg-white text-ink hover:bg-neutral-50 shadow-sm',
};
const sizes: Record<ButtonSize, { box: string; icon: number }> = {
  sm: { box: 'h-9 px-4 rounded-full text-body-sm gap-1.5', icon: 15 },
  md: { box: 'h-11 px-5 rounded-full text-body gap-2', icon: 17 },
  lg: { box: 'h-12 px-6 rounded-full text-title gap-2', icon: 18 },
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: StyleProps) {
  return cn(
    'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-[background-color,box-shadow,transform,border-color] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    variants[variant],
    sizes[size].box,
    fullWidth && 'w-full',
    className,
  );
}

function Content({ loading, leftIcon, rightIcon, size = 'md', children }: { loading?: boolean; leftIcon?: IconName; rightIcon?: IconName; size?: ButtonSize; children: ReactNode }) {
  const s = sizes[size].icon;
  return (
    <>
      {loading ? <Icon name="spinner" size={s} className="animate-spin" /> : leftIcon ? <Icon name={leftIcon} size={s} /> : null}
      <span className="truncate">{children}</span>
      {rightIcon && !loading ? <Icon name={rightIcon} size={s} /> : null}
    </>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, className, loading, leftIcon, rightIcon, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content loading={loading} leftIcon={leftIcon} rightIcon={rightIcon} size={size}>
        {children}
      </Content>
    </button>
  );
});

export interface LinkButtonProps extends Omit<LinkProps, 'className'>, StyleProps {
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Renders an inert, non-focusable look-alike instead of a link. */
  disabled?: boolean;
}

/** Navigation styled as a button (keeps real `<a href>` semantics for SEO and middle-click). */
export function LinkButton({ variant, size, fullWidth, className, leftIcon, rightIcon, children, disabled, ...rest }: LinkButtonProps) {
  if (disabled) {
    return (
      <span role="link" aria-disabled="true" className={buttonClasses({ variant, size, fullWidth, className })}>
        <Content leftIcon={leftIcon} rightIcon={rightIcon} size={size}>
          {children as ReactNode}
        </Content>
      </span>
    );
  }
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content leftIcon={leftIcon} rightIcon={rightIcon} size={size}>
        {children}
      </Content>
    </Link>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  variant?: 'plain' | 'soft' | 'outline' | 'solid' | 'glass';
  size?: 'sm' | 'md';
  badge?: number;
  iconClassName?: string;
  filled?: boolean;
}

const iconVariants = {
  plain: 'bg-transparent text-ink hover:bg-surface-muted',
  soft: 'bg-surface-muted text-ink hover:bg-neutral-200',
  outline: 'bg-surface text-ink border border-border hover:border-primary-300 hover:text-primary-600',
  solid: 'bg-primary-500 text-white hover:bg-primary-600',
  glass: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur',
};

export function IconButton({ icon, label, variant = 'soft', size = 'md', badge, className, iconClassName, filled, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'focus-ring relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        iconVariants[variant],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : 19} className={iconClassName} filled={filled} />
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-danger-500 px-1 text-2xs font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </button>
  );
}

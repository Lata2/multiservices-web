import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from './Button';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';
import { Modal } from './Modal';

/* ───────── Chip ───────── */

export function Chip({ label, selected, onClick, icon, count, className, disabled }: { label: string; selected?: boolean; onClick?: () => void; icon?: IconName; count?: number; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'focus-ring inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-body-sm font-medium transition-colors duration-150 disabled:opacity-50',
        selected ? 'border-primary-500 bg-primary-500 text-white' : 'border-border bg-surface text-ink-secondary hover:border-primary-300 hover:text-primary-700',
        className,
      )}
    >
      {icon ? <Icon name={icon} size={14} filled={icon === 'star'} /> : null}
      {label}
      {count != null ? <span className={cn('min-w-[20px] rounded-full px-1.5 text-center text-2xs font-bold', selected ? 'bg-white/25' : 'bg-surface-muted')}>{count}</span> : null}
    </button>
  );
}

/** Horizontally scrolling chip row (wraps on wide screens when `wrap`). */
export function ChipRow({ children, className, wrap, label }: { children: ReactNode; className?: string; wrap?: boolean; label?: string }) {
  return (
    <div role="group" aria-label={label} className={cn('scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0', wrap && 'sm:flex-wrap sm:overflow-visible', className)}>
      {children}
    </div>
  );
}

/* ───────── Segmented tabs ───────── */

export function SegmentedTabs<T extends string>({ tabs, value, onChange, className, label = 'Tabs' }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; label?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex rounded-lg bg-surface-muted p-1', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-body-sm transition-all duration-150',
              active ? 'bg-surface font-semibold text-ink shadow-sm' : 'font-medium text-ink-secondary hover:text-ink',
            )}
          >
            <span className="truncate">{t.label}</span>
            {t.count ? <span className={cn('rounded-full px-1.5 text-2xs font-bold text-white', active ? 'bg-primary-500' : 'bg-neutral-400')}>{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Search bar ───────── */

export function SearchBar({ value, onChange, placeholder = 'Search', autoFocus, onSubmit, className, right, label = 'Search', onFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; onSubmit?: () => void; className?: string; right?: ReactNode; label?: string; onFocus?: () => void }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={cn('flex h-11 items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 shadow-sm transition-[border-color,box-shadow] focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100', className)}
    >
      <Icon name="search" size={17} className="text-ink-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={label}
        enterKeyHint="search"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button type="button" onClick={() => onChange('')} className="focus-ring rounded-full p-0.5 text-ink-muted hover:text-ink" aria-label="Clear search">
          <Icon name="x-circle" size={17} />
        </button>
      ) : null}
      {right}
    </form>
  );
}

/** A search field that is really a link (e.g. header search on mobile → /search). */
export function SearchLink({ to = '/search', placeholder, className }: { to?: string; placeholder: string; className?: string }) {
  return (
    <Link to={to} className={cn('focus-ring flex h-12 items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-ink-muted shadow-sm transition-colors hover:border-primary-300', className)}>
      <Icon name="search" size={17} />
      <span className="truncate">{placeholder}</span>
    </Link>
  );
}

/* ───────── List item / menu row ───────── */

interface ListItemProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
  chevron?: boolean;
  className?: string;
}

export function ListItem({ icon, title, subtitle, right, to, onClick, danger, chevron = true, className }: ListItemProps) {
  const body = (
    <>
      {icon ? (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', danger ? 'bg-danger-50 text-danger-600' : 'bg-primary-50 text-primary-600')}>
          <Icon name={icon} size={18} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-left">
        <span className={cn('block font-medium', danger ? 'text-danger-600' : 'text-ink')}>{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-caption text-ink-muted">{subtitle}</span> : null}
      </span>
      {right}
      {(to || onClick) && chevron ? <Icon name="chevron-right" size={17} className="text-ink-muted" /> : null}
    </>
  );
  const cls = cn('focus-ring flex w-full items-center gap-3.5 rounded-lg py-3 transition-colors', (to || onClick) && 'hover:bg-surface-muted/60 -mx-2 px-2 w-[calc(100%+16px)]', className);
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
  return <div className={cls}>{body}</div>;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-border', className)} />;
}

export function SectionHeader({ title, action, onAction, to, className, as: Tag = 'h2', subtitle, size = 'md', icon }: { title: string; action?: string; onAction?: () => void; to?: string; className?: string; as?: 'h2' | 'h3'; subtitle?: string; size?: 'md' | 'lg'; icon?: IconName }) {
  const actionCls = 'focus-ring group inline-flex shrink-0 items-center gap-0.5 rounded-full py-1 pl-2.5 pr-1.5 text-body-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50';
  const actionBody = (
    <>
      {action}
      <Icon name="chevron-right" size={15} className="transition-transform group-hover:translate-x-0.5" />
    </>
  );
  return (
    <div className={cn(size === 'lg' ? 'mb-4' : 'mb-3', 'flex items-end justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <div className="min-w-0">
          <Tag className={cn('font-bold text-ink', size === 'lg' ? 'text-h3 sm:text-h2' : 'text-h3 font-semibold')}>{title}</Tag>
          {subtitle ? <p className="text-body-sm text-ink-secondary">{subtitle}</p> : null}
        </div>
      </div>
      {action && to ? (
        <Link to={to} className={actionCls}>
          {actionBody}
        </Link>
      ) : action && onAction ? (
        <button type="button" onClick={onAction} className={actionCls}>
          {actionBody}
        </button>
      ) : null}
    </div>
  );
}

export function KeyValue({ label, value, bold, tone, className }: { label: string; value: ReactNode; bold?: boolean; tone?: 'success' | 'danger' | 'primary'; className?: string }) {
  const toneCls = tone === 'success' ? 'text-success-600' : tone === 'danger' ? 'text-danger-600' : tone === 'primary' ? 'text-primary-600' : 'text-ink';
  return (
    <div className={cn('flex items-start justify-between gap-4 py-1.5', className)}>
      <dt className={cn(bold ? 'text-title font-semibold text-ink' : 'text-ink-secondary')}>{label}</dt>
      <dd className={cn('text-right', bold ? 'text-title font-bold' : 'font-medium', toneCls)}>{value}</dd>
    </div>
  );
}

/* ───────── Stat card ───────── */

const statTone = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  accent: 'bg-accent-50 text-accent-600',
  info: 'bg-info-50 text-info-600',
  danger: 'bg-danger-50 text-danger-600',
  highlight: 'bg-highlight-50 text-highlight-600',
};

export function StatCard({ label, value, icon, tone = 'primary', trend, to, className }: { label: string; value: string; icon: IconName; tone?: keyof typeof statTone; trend?: string; to?: string; className?: string }) {
  const body = (
    <>
      <span className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-md', statTone[tone])}>
        <Icon name={icon} size={17} />
      </span>
      <span className="block truncate text-h3 font-bold text-ink">{value}</span>
      <span className="mt-0.5 block text-caption text-ink-muted">{label}</span>
      {trend ? <span className="mt-1 block text-caption font-semibold text-success-600">{trend}</span> : null}
    </>
  );
  const cls = cn('block min-w-0 rounded-card border border-border/80 bg-surface p-4 shadow-sm', className);
  return to ? (
    <Link to={to} className={cn(cls, 'focus-ring transition-[box-shadow,border-color] hover:border-primary-200 hover:shadow-md')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/* ───────── Rating ───────── */

export function RatingStars({ value, size = 14, onChange, label }: { value: number; size?: number; onChange?: (v: number) => void; label?: string }) {
  if (onChange) {
    return (
      <div role="radiogroup" aria-label={label ?? 'Rating'} className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onClick={() => onChange(i)}
            className={cn('focus-ring rounded-md p-0.5 transition-transform hover:scale-110', value >= i ? 'text-accent-400' : 'text-neutral-300')}
          >
            <Icon name="star" size={size} filled={value >= i} />
          </button>
        ))}
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name={value >= i - 0.25 ? 'star' : value >= i - 0.75 ? 'star-half' : 'star'} size={size} filled={value >= i - 0.75} className={value >= i - 0.75 ? 'text-accent-400' : 'text-neutral-300'} />
      ))}
    </span>
  );
}

export function RatingPill({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-caption', className)}>
      <Icon name="star" size={13} filled className="text-accent-400" />
      <span className="font-semibold text-ink">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
      {count ? <span className="text-ink-muted">({count.toLocaleString('en-IN')})</span> : null}
    </span>
  );
}

/* ───────── Quantity stepper ───────── */

export function QuantityStepper({ value, onChange, min = 0, max = 99, size = 'md', label = 'Quantity' }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: 'sm' | 'md'; label?: string }) {
  const btn = 'focus-ring flex h-full w-8 items-center justify-center text-primary-700 hover:bg-primary-100 disabled:opacity-40';
  return (
    <div className={cn('relative z-10 inline-flex items-center overflow-hidden rounded-md border border-primary-200 bg-primary-50', size === 'sm' ? 'h-8' : 'h-9')} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} aria-label={value <= 1 && min === 0 ? 'Remove' : 'Decrease quantity'}>
        <Icon name={value <= 1 && min === 0 ? 'trash' : 'minus'} size={15} />
      </button>
      <span className="min-w-[26px] text-center font-bold text-primary-700" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={15} />
      </button>
    </div>
  );
}

/* ───────── Switch ───────── */

export function Switch({ checked, onChange, disabled, label, tone = 'primary' }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; tone?: 'primary' | 'success' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50',
        checked ? (tone === 'success' ? 'bg-success-500' : 'bg-primary-500') : 'bg-neutral-300',
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-soft', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

export function SwitchRow({ title, subtitle, value, onChange, icon, disabled }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 py-3">
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon name={icon} size={18} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {subtitle ? <p className="mt-0.5 text-caption text-ink-muted">{subtitle}</p> : null}
      </div>
      <Switch checked={value} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

/* ───────── Select (sheet on phones, dialog on desktop) ───────── */

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: IconName | (string & {});
}

interface SelectProps<T extends string> {
  label?: string;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  value?: T | null;
  onChange?: (v: T) => void;
  multiple?: boolean;
  values?: T[];
  onChangeMany?: (v: T[]) => void;
  className?: string;
}

export function Select<T extends string>({ label, value, options, onChange, placeholder = 'Select', error, required, multiple, values, onChangeMany, className }: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const display = multiple ? options.filter((o) => values?.includes(o.value)).map((o) => o.label).join(', ') : options.find((o) => o.value === value)?.label;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label id={id} className="text-body-sm font-medium text-ink-secondary">
          {label}
          {required ? <span className="text-danger-600"> *</span> : null}
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-labelledby={label ? id : undefined}
        aria-invalid={!!error || undefined}
        className={cn('focus-ring flex h-11 items-center rounded-lg border bg-surface px-3.5 text-left transition-colors hover:border-border-strong', error ? 'border-danger-500' : 'border-border')}
      >
        <span className={cn('flex-1 truncate', !display && 'text-ink-muted')}>{display || placeholder}</span>
        <Icon name="chevron-down" size={17} className="text-ink-muted" />
      </button>
      {error ? (
        <p role="alert" className="flex items-center gap-1 text-caption text-danger-600">
          <Icon name="alert" size={13} />
          {error}
        </p>
      ) : null}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label ?? placeholder}
        footer={multiple ? <Button fullWidth onClick={() => setOpen(false)}>Done{values?.length ? ` (${values.length} selected)` : ''}</Button> : undefined}
      >
        <ul role="listbox" aria-multiselectable={multiple || undefined} className="divide-y divide-border">
          {options.map((o) => {
            const selected = multiple ? !!values?.includes(o.value) : o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    if (multiple) {
                      const cur = values ?? [];
                      onChangeMany?.(selected ? cur.filter((v) => v !== o.value) : [...cur, o.value]);
                    } else {
                      onChange?.(o.value);
                      setOpen(false);
                    }
                  }}
                  className="focus-ring flex w-full items-center gap-3 rounded-md px-1 py-3 text-left hover:bg-surface-muted/60"
                >
                  {o.icon ? <Icon name={o.icon} size={18} className="text-primary-500" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className={cn('block', selected && 'font-semibold')}>{o.label}</span>
                    {o.description ? <span className="block text-caption text-ink-muted">{o.description}</span> : null}
                  </span>
                  <Icon name={multiple ? (selected ? 'square-check' : 'square') : selected ? 'radio-on' : 'circle'} size={20} className={selected ? 'text-primary-500' : 'text-ink-muted'} />
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}

/* ───────── Checkbox ───────── */

export function Checkbox({ checked, onChange, label, error }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-invalid={!!error || undefined} />
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-xs border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',
            checked ? 'border-primary-500 bg-primary-500 text-white' : error ? 'border-danger-500' : 'border-border-strong bg-surface',
          )}
          aria-hidden
        >
          {checked ? <Icon name="check" size={13} strokeWidth={3} /> : null}
        </span>
        <span className="text-body-sm text-ink-secondary">{label}</span>
      </label>
      {error ? <p className="ml-7 text-caption text-danger-600">{error}</p> : null}
    </div>
  );
}

/* ───────── Option cards (radio group) ───────── */

export function OptionCards<T extends string>({ options, value, onChange, label, columns }: { options: SelectOption<T>[]; value: T; onChange: (v: T) => void; label?: string; columns?: number }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'focus-ring flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-colors',
              active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-border bg-surface text-ink hover:border-primary-200',
            )}
          >
            {o.icon ? <Icon name={o.icon} size={21} className={active ? 'text-primary-500' : 'text-ink-secondary'} /> : null}
            <span className="text-body-sm font-semibold">{o.label}</span>
            {o.description ? <span className="text-caption text-ink-muted">{o.description}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── OTP input ───────── */

export function OtpInput({ length = 6, value, onChange, error, autoFocus = true, label = 'One-time code' }: { length?: number; value: string; onChange: (v: string) => void; error?: boolean; autoFocus?: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => ref.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [autoFocus]);
  return (
    <div className="relative flex justify-between gap-2" onClick={() => ref.current?.focus()}>
      {Array.from({ length }).map((_, i) => {
        const filled = value[i];
        const active = focused && i === Math.min(value.length, length - 1);
        return (
          <div
            key={i}
            aria-hidden
            className={cn(
              'flex h-13 min-w-0 flex-1 items-center justify-center rounded-lg border-2 bg-surface text-h2 font-bold transition-colors',
              error ? 'border-danger-500' : active ? 'border-primary-500 ring-4 ring-primary-100' : filled ? 'border-primary-200' : 'border-border',
            )}
          >
            {filled ?? ''}
          </div>
        );
      })}
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        aria-label={label}
        aria-invalid={error || undefined}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}

/* ───────── Bar chart ───────── */

export function BarChart({ data, height = 150, format = (v: number) => `${v}`, label = 'Bar chart' }: { data: { label: string; value: number }[]; height?: number; format?: (v: number) => string; label?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const peak = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);
  return (
    <figure aria-label={label}>
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="group relative flex h-full flex-1 flex-col items-center justify-end">
            <span className={cn('mb-1 whitespace-nowrap text-caption font-semibold text-primary-600 transition-opacity', i === peak ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>{format(d.value)}</span>
            <div
              className={cn('w-full max-w-12 rounded-t-md transition-colors', i === peak ? 'bg-primary-500' : 'bg-primary-200 group-hover:bg-primary-300')}
              style={{ height: `${Math.max((d.value / max) * (height - 24), 4)}px` }}
              title={`${d.label}: ${format(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        {data.map((d, i) => (
          <span key={`${d.label}-l${i}`} className="flex-1 text-center text-caption text-ink-muted">
            {d.label}
          </span>
        ))}
      </div>
      <figcaption className="sr-only">{data.map((d) => `${d.label}: ${format(d.value)}`).join(', ')}</figcaption>
    </figure>
  );
}

/* ───────── Progress bar ───────── */

export function ProgressBar({ value, tone = 'primary', label }: { value: number; tone?: 'primary' | 'success' | 'accent'; label?: string }) {
  const bg = tone === 'success' ? 'bg-success-500' : tone === 'accent' ? 'bg-accent-500' : 'bg-primary-500';
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-neutral-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out-soft', bg)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Long text collapsed to `lines` with a "Read more" toggle — keeps pages scannable. */
export function ReadMore({ children, lines = 2, className }: { children: ReactNode; lines?: 2 | 3; className?: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight - el.clientHeight > 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);
  return (
    <div className={className}>
      <p ref={ref} id={id} className={cn('text-ink-secondary', !open && (lines === 2 ? 'line-clamp-2' : 'line-clamp-3'))}>
        {children}
      </p>
      {overflows || open ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={id} className="focus-ring mt-1 rounded text-body-sm font-semibold text-primary-600 hover:text-primary-700">
          {open ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { errorMessage } from '@/hooks/useApiMutation';
import { Button, LinkButton } from './Button';
import { cn } from './cn';
import { Icon, type IconName } from './Icon';

export function Spinner({ size = 28, className, label = 'Loading' }: { size?: number; className?: string; label?: string }) {
  return (
    <span role="status" className={cn('inline-flex text-primary-500', className)}>
      <Icon name="spinner" size={size} className="animate-spin" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingState({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-3 py-20', className)}>
      <Spinner size={30} />
      {label ? <p className="text-ink-muted">{label}</p> : null}
    </div>
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTo?: string;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon = 'inbox', title, message, actionLabel, onAction, actionTo, className, compact }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 text-center', compact ? 'py-8' : 'py-16', className)}>
      <span className={cn('mb-4 flex items-center justify-center rounded-full bg-primary-50 text-primary-500', compact ? 'h-14 w-14' : 'h-20 w-20')}>
        <Icon name={icon} size={compact ? 24 : 34} />
      </span>
      <h3 className="text-h3 font-semibold">{title}</h3>
      {message ? <p className="mt-1.5 max-w-sm text-ink-secondary">{message}</p> : null}
      {actionLabel && actionTo ? (
        <LinkButton to={actionTo} className="mt-5">
          {actionLabel}
        </LinkButton>
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({ message, onRetry, className, title = "We couldn't load this" }: { message?: string; onRetry?: () => void; className?: string; title?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <Icon name="offline" size={34} />
      </span>
      <h3 className="text-h3 font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-ink-secondary">{message ?? 'Check your connection and try again.'}</p>
      {onRetry ? (
        <Button variant="outline" leftIcon="refresh" onClick={onRetry} className="mt-5">
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn('animate-shimmer rounded-lg bg-neutral-200', className)} style={style} />;
}

export function ListSkeleton({ rows = 4, height = 88, className }: { rows?: number; height?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 py-1', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="rounded-card" style={{ height }} />
      ))}
    </div>
  );
}

/**
 * Renders loading / error / empty / data branches of a query consistently.
 * `isEmpty` defaults to checking for an empty array.
 */
export function QueryView<T>({ query, children, loading, empty, isEmpty }: { query: UseQueryResult<T>; children: (data: T) => ReactNode; loading?: ReactNode; empty?: ReactNode; isEmpty?: (data: T) => boolean }) {
  if (query.isPending) return <>{loading ?? <LoadingState />}</>;
  if (query.isError) return <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} />;
  const data = query.data as T;
  const emptyCheck = isEmpty ?? ((d: T) => Array.isArray(d) && d.length === 0);
  if (empty && emptyCheck(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}

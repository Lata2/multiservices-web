import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { IconButton } from './Button';
import { cn } from './cn';

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Show a back button. A string is the fallback route when there is no history (deep link / refresh). */
  back?: boolean | string;
  actions?: ReactNode;
  className?: string;
}

/** Page title bar. Sticky with a back button on phones; a plain heading row on desktop. */
export function PageHeader({ title, subtitle, back, actions, className }: PageHeaderProps) {
  const navigate = useNavigate();
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(typeof back === 'string' ? back : '/', { replace: true });
  };
  return (
    <header
      className={cn(
        'z-30 -mx-4 mb-4 flex min-h-14 items-center gap-2 bg-background/90 px-2 py-2 backdrop-blur sm:-mx-6 sm:px-4 lg:static lg:mx-0 lg:mb-6 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none',
        back ? 'sticky top-0' : '',
        className,
      )}
    >
      {back ? <IconButton icon="chevron-left" label="Go back" variant="plain" onClick={goBack} className="lg:border lg:border-border lg:bg-surface" /> : <span className="w-2 lg:hidden" />}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-title font-bold sm:text-h3 lg:text-h2 lg:font-bold">{title}</h1>
        {subtitle ? <p className="truncate text-caption text-ink-muted lg:text-body-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </header>
  );
}

/**
 * Primary actions for a page. Fixed to the bottom on phones/tablets (like the app's sticky
 * footer, above the tab bar when one is shown) and an inline sticky card on desktop.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <div className="h-24 lg:hidden" aria-hidden />
      <div
        className={cn(
          'fixed inset-x-0 bottom-[var(--bottom-nav-h,0px)] z-40 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lg backdrop-blur sm:px-6',
          'lg:sticky lg:bottom-4 lg:mt-6 lg:rounded-card lg:border lg:px-5 lg:pb-3 lg:shadow-md',
          className,
        )}
      >
        <div className="mx-auto max-w-[var(--container-narrow)] lg:max-w-none">{children}</div>
      </div>
    </>
  );
}

/** Centred column for focused pages (forms, details). */
export function Narrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[var(--container-narrow)]', className)}>{children}</div>;
}

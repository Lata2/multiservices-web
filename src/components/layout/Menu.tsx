import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../ui';

/** Minimal accessible popover menu (click / Escape / outside click to close). */
export function Menu({ trigger, children, align = 'right', label }: { trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; align?: 'left' | 'right'; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div role="menu" aria-label={label} className={cn('absolute top-full z-50 mt-2 w-64 animate-pop-in rounded-xl border border-border bg-surface p-1.5 shadow-lg', align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left')}>
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

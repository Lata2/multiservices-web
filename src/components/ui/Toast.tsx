import { useEffect } from 'react';
import { useToastStore } from '@/store/toast.store';
import { cn } from './cn';
import { Icon } from './Icon';

/** Global toast host — mounted once in the root layout. */
export function ToastHost() {
  const { toast, hide } = useToastStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, 3200);
    return () => clearTimeout(t);
  }, [toast, hide]);

  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex justify-center px-4 sm:top-auto sm:bottom-6 sm:justify-end sm:px-6">
      {toast ? (
        <button
          key={toast.id}
          type="button"
          onClick={hide}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className="pointer-events-auto flex w-full max-w-md animate-toast-in items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-left text-body-sm font-medium text-white shadow-lg"
        >
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', toast.kind === 'error' ? 'bg-danger-500/25 text-danger-500' : toast.kind === 'info' ? 'bg-info-500/25 text-info-500' : 'bg-success-500/25 text-success-500')}>
            <Icon name={toast.kind === 'error' ? 'alert' : toast.kind === 'info' ? 'info' : 'check-circle'} size={17} />
          </span>
          <span className="flex-1">{toast.message}</span>
          <Icon name="x" size={15} className="text-white/50" />
        </button>
      ) : null}
    </div>
  );
}

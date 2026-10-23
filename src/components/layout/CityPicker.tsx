import { useState } from 'react';
import { useCities } from '@/hooks/api';
import { useAppStore } from '@/store/app.store';
import { cn, Icon, ListSkeleton, Modal } from '../ui';

/** City selector (multi-city marketplace). */
export function CityPicker({ className, compact }: { className?: string; compact?: boolean }) {
  const city = useAppStore((s) => s.city);
  const setCity = useAppStore((s) => s.setCity);
  const [open, setOpen] = useState(false);
  const cities = useCities();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn('focus-ring flex items-center gap-2 rounded-lg text-left', className)} aria-label={`City: ${city}. Change city`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon name="pin" size={16} />
        </span>
        <span className="min-w-0">
          {!compact ? <span className="block text-caption text-ink-muted">Services in</span> : null}
          <span className="flex items-center gap-1 font-bold">
            <span className="truncate">{city}</span>
            <Icon name="chevron-down" size={14} />
          </span>
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Select your city" subtitle="We'll show services available near you" size="sm">
        {cities.isPending ? (
          <ListSkeleton rows={5} height={48} />
        ) : (
          <ul className="divide-y divide-border">
            {cities.data?.map((ct) => (
              <li key={ct.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCity(ct.name);
                    setOpen(false);
                  }}
                  className="focus-ring flex w-full items-center gap-3 rounded-md px-1 py-3 text-left hover:bg-surface-muted/60"
                  aria-current={ct.name === city}
                >
                  <Icon name="building" size={18} className="text-primary-500" />
                  <span className="flex-1">
                    <span className={cn('block', ct.name === city && 'font-semibold')}>{ct.name}</span>
                    <span className="text-caption text-ink-muted">{ct.state}</span>
                  </span>
                  {ct.name === city ? <Icon name="check-circle" size={20} className="text-primary-500" /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}

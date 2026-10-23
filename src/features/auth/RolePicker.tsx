import { cn, Icon } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import type { Role } from '@/types/models';

/** Equal-width account-type selector (fits 4 roles on a 320px screen). */
export function RolePicker<R extends Role>({ roles, value, onChange, label, long }: { roles: R[]; value: R; onChange: (r: R) => void; label: string; long?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('grid gap-2', roles.length === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
      {roles.map((r) => {
        const on = r === value;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(r)}
            className={cn(
              'focus-ring flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 text-caption font-semibold transition-[background-color,border-color,color,box-shadow] duration-200',
              on ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-[0_0_0_3px_var(--color-primary-100)]' : 'border-border bg-surface text-ink-secondary hover:border-primary-300 hover:text-ink',
            )}
          >
            <Icon name={ROLES[r].icon} size={19} />
            <span className="leading-tight">{long ? ROLES[r].title : ROLES[r].short}</span>
          </button>
        );
      })}
    </div>
  );
}

import { cn, Icon } from '@/components/ui';

const steps = ['Cart', 'Schedule', 'Address & payment'];

/** Booking progress indicator (cart → schedule → checkout). */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Booking steps">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2" aria-current={i === current ? 'step' : undefined}>
          <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-bold', i < current ? 'bg-success-500 text-white' : i === current ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-ink-secondary')}>
            {i < current ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
          </span>
          <span className={cn('truncate text-caption sm:text-body-sm', i === current ? 'font-semibold' : 'text-ink-muted')}>{s}</span>
          {i < steps.length - 1 ? <span className={cn('h-px flex-1', i < current ? 'bg-success-500' : 'bg-border')} /> : null}
        </li>
      ))}
    </ol>
  );
}

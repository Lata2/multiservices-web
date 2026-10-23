import { useState } from 'react';
import type { ServiceFilters, SortOption } from '@/services/api';
import { Button, Chip, Divider, Input, Modal, SwitchRow } from '@/components/ui';

export const SORTS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popular', label: 'Most booked' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
];

export type FilterState = Pick<ServiceFilters, 'sort' | 'minRating' | 'minPrice' | 'maxPrice' | 'discountedOnly'>;

export function activeFilterCount(f: FilterState) {
  return [f.minRating, f.minPrice != null, f.maxPrice != null, f.discountedOnly].filter(Boolean).length;
}

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onApply: (f: FilterState) => void;
}

/** Remounts on open so the draft always starts from the applied filters. */
export function FilterSheet(props: FilterSheetProps) {
  return props.open ? <FilterSheetInner {...props} /> : null;
}

function FilterSheetInner({ open, onClose, value, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState<FilterState>(value);
  const [min, setMin] = useState(value.minPrice?.toString() ?? '');
  const [max, setMax] = useState(value.maxPrice?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  const apply = () => {
    const minP = min ? Number(min) : undefined;
    const maxP = max ? Number(max) : undefined;
    if ((min && Number.isNaN(minP)) || (max && Number.isNaN(maxP))) return setError('Enter valid amounts');
    if (minP != null && maxP != null && minP > maxP) return setError('Minimum price must be lower than maximum');
    onApply({ ...draft, minPrice: minP, maxPrice: maxP });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sort & filter"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => (onApply({ sort: value.sort }), onClose())}>
            Reset
          </Button>
          <Button className="flex-[2]" onClick={apply}>
            Show results
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="mb-3 mt-2 text-title font-semibold">Sort by</legend>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Chip key={s.value} label={s.label} selected={(draft.sort ?? 'relevance') === s.value} onClick={() => setDraft({ ...draft, sort: s.value })} />
          ))}
        </div>
      </fieldset>
      <Divider className="my-5" />
      <fieldset>
        <legend className="mb-3 text-title font-semibold">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[0, 4, 4.5].map((r) => (
            <Chip key={r} icon={r ? 'star' : undefined} label={r ? `${r}+` : 'Any'} selected={(draft.minRating ?? 0) === r} onClick={() => setDraft({ ...draft, minRating: r || undefined })} />
          ))}
        </div>
      </fieldset>
      <Divider className="my-5" />
      <fieldset>
        <legend className="mb-3 text-title font-semibold">Price range</legend>
        <div className="flex items-start gap-3">
          <Input containerClassName="flex-1" aria-label="Minimum price" placeholder="Min" prefix="₹" inputMode="numeric" value={min} onValueChange={(v) => (setMin(v.replace(/\D/g, '')), setError(null))} />
          <span className="mt-3 text-ink-muted">–</span>
          <Input containerClassName="flex-1" aria-label="Maximum price" placeholder="Max" prefix="₹" inputMode="numeric" value={max} onValueChange={(v) => (setMax(v.replace(/\D/g, '')), setError(null))} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ['Under ₹500', '', '500'],
            ['₹500 – ₹2,000', '500', '2000'],
            ['Above ₹2,000', '2000', ''],
          ].map(([label, a, b]) => (
            <Chip key={label} label={label} selected={min === a && max === b} onClick={() => (setMin(a), setMax(b))} />
          ))}
        </div>
        {error ? <p className="mt-2 text-caption text-danger-600" role="alert">{error}</p> : null}
      </fieldset>
      <Divider className="my-5" />
      <SwitchRow title="Offers only" subtitle="Show discounted services" value={!!draft.discountedOnly} onChange={(v) => setDraft({ ...draft, discountedOnly: v || undefined })} icon="tag" />
    </Modal>
  );
}

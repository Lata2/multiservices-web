import { useMemo, useState, type ReactNode } from 'react';
import { cn } from './cn';
import { Icon } from './Icon';
import { EmptyState } from './States';

export interface Column<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
  /** Return a value to make the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  caption?: string;
  dense?: boolean;
}

/** Semantic, sortable, horizontally scrollable data table for admin/provider views. */
export function DataTable<T>({ columns, data, keyExtractor, onRowClick, emptyTitle = 'No records', caption, dense }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return data;
    const get = col.sortValue;
    return [...data].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const r = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === 'asc' ? r : -r;
    });
  }, [data, sort, columns]);

  const align = (a?: Column<T>['align']) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');
  const toggle = (key: string) => setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-surface-muted/70">
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ minWidth: col.minWidth }}
                    aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn('whitespace-nowrap px-4 py-2.5 text-caption font-semibold text-ink-muted', align(col.align))}
                  >
                    {col.sortValue ? (
                      <button type="button" onClick={() => toggle(col.key)} className={cn('focus-ring inline-flex items-center gap-1 rounded hover:text-ink', active && 'text-ink')}>
                        {col.title}
                        <Icon name={active ? (sort!.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevron-down'} size={13} className={active ? '' : 'opacity-30'} />
                      </button>
                    ) : (
                      col.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState compact title={emptyTitle} icon="search" />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(row)) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn('border-t border-border', onRowClick && 'focus-ring cursor-pointer transition-colors hover:bg-primary-50/50')}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 align-middle', dense ? 'py-2' : 'py-3', align(col.align), col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

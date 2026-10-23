import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Badge, Button, ConfirmDialog, cn, EmptyState, FormInput, Icon, IconButton, ListSkeleton, Modal, PageHeader, QueryView, SearchBar, Select, Switch, SwitchRow } from '@/components/ui';
import { useAdminCategories } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { Category } from '@/types/models';
import { categorySchema, type CategoryForm } from '@/utils/validation';

const ICONS = ['sparkles', 'snowflake', 'zap', 'droplet', 'flower', 'scissors', 'palette', 'bug', 'hammer', 'shirt', 'car', 'leaf', 'paw', 'laptop', 'wrench', 'home', 'bath', 'truck'];

export default function AdminCategories() {
  usePageMeta({ title: 'Categories', noindex: true });
  const q = useAdminCategories();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const invalidate = [qk.admin.categories, ['categories'], ['category']];

  const { control, handleSubmit, reset } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema), defaultValues: { name: '', icon: 'wrench', description: '', parentId: '', commissionRate: '15', active: true } });
  const save = useApiMutation(
    (v: CategoryForm) => adminApi.saveCategory({ name: v.name.trim(), icon: v.icon, description: v.description, parentId: v.parentId || null, commissionRate: Number(v.commissionRate), active: v.active }, editing && editing !== 'new' ? editing.id : undefined),
    { invalidate, successMessage: 'Category saved', onSuccess: () => setEditing(null) },
  );
  const toggle = useApiMutation((cat: Category) => adminApi.saveCategory({ ...cat, active: !cat.active }, cat.id), { invalidate, successMessage: (c) => (c.active ? `${c.name} is visible` : `${c.name} hidden`) });
  const remove = useApiMutation((id: string) => adminApi.deleteCategory(id), { invalidate, successMessage: 'Category deleted', onSuccess: () => setToDelete(null), onError: () => setToDelete(null) });

  const open = (cat: Category | 'new', parentId?: string) => {
    setEditing(cat);
    reset(
      cat === 'new'
        ? { name: '', icon: 'wrench', description: '', parentId: parentId ?? '', commissionRate: '15', active: true }
        : { name: cat.name, icon: cat.icon, description: cat.description ?? '', parentId: cat.parentId ?? '', commissionRate: String(cat.commissionRate), active: cat.active },
    );
  };
  const parents = useMemo(() => (q.data ?? []).filter((x) => !x.parentId && x.name.toLowerCase().includes(query.trim().toLowerCase())), [q.data, query]);
  const subsOf = (id: string) => (q.data ?? []).filter((x) => x.parentId === id);

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle={q.data ? `${q.data.filter((x) => !x.parentId).length} categories · ${q.data.filter((x) => x.parentId).length} sub-categories` : undefined}
        back="/admin/more"
        actions={
          <Button size="sm" leftIcon="plus" onClick={() => open('new')}>
            Add category
          </Button>
        }
      />
      <SearchBar value={query} onChange={setQuery} placeholder="Search categories" className="mb-4 lg:max-w-md" />
      <QueryView query={q} loading={<ListSkeleton rows={6} height={64} />}>
        {() =>
          parents.length ? (
            <ul className="grid items-start gap-3 lg:grid-cols-2">
              {parents.map((cat, i) => {
                const subs = subsOf(cat.id);
                const isOpen = expanded === cat.id;
                return (
                  <li key={cat.id} className="rounded-card border border-border/80 bg-surface shadow-sm">
                    <div className="flex items-center gap-3 p-4">
                      <span className={cn(`tint-${i % 6}`, 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg')}>
                        <Icon name={cat.icon} size={19} />
                      </span>
                      <button type="button" onClick={() => setExpanded(isOpen ? null : cat.id)} aria-expanded={isOpen} className="focus-ring min-w-0 flex-1 rounded text-left">
                        <span className="block font-semibold">{cat.name}</span>
                        <span className="text-caption text-ink-muted">
                          {subs.length} sub · {cat.serviceCount} service{cat.serviceCount === 1 ? '' : 's'} · {cat.commissionRate}% fee
                        </span>
                      </button>
                      <Switch checked={cat.active} onChange={() => toggle.mutate(cat)} label={`${cat.name} visible`} tone="success" />
                      <IconButton icon={isOpen ? 'chevron-up' : 'chevron-down'} label={isOpen ? 'Collapse' : 'Expand'} variant="plain" size="sm" onClick={() => setExpanded(isOpen ? null : cat.id)} />
                    </div>
                    {isOpen ? (
                      <div className="border-t border-border px-4 pb-4">
                        <ul>
                          {subs.map((s) => (
                            <li key={s.id} className="flex items-center gap-3 border-b border-border py-2">
                              <span className={cn('flex-1 text-body-sm', !s.active && 'text-ink-muted line-through')}>{s.name}</span>
                              {!s.active ? <Badge label="Hidden" /> : null}
                              <IconButton icon="pencil" label={`Edit ${s.name}`} variant="plain" size="sm" onClick={() => open(s)} />
                              <IconButton icon="trash" label={`Delete ${s.name}`} variant="plain" size="sm" iconClassName="text-danger-500" onClick={() => setToDelete(s)} />
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" leftIcon="plus" className="flex-1" onClick={() => open('new', cat.id)}>
                            Add sub-category
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => open(cat)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setToDelete(cat)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon="grid" title="No categories" actionLabel="Add category" onAction={() => open('new')} />
          )
        }
      </QueryView>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New category' : 'Edit category'} footer={<Button type="submit" form="category-form" fullWidth loading={save.isPending}>Save category</Button>}>
        <form id="category-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4">
          <FormInput control={control} name="name" label="Name" required data-autofocus />
          <Controller
            control={control}
            name="parentId"
            render={({ field }) => (
              <Select label="Parent category" value={field.value || '__none'} onChange={(v) => field.onChange(v === '__none' ? '' : v)} options={[{ value: '__none', label: 'None (top level)' }, ...(q.data ?? []).filter((x) => !x.parentId).map((p) => ({ value: p.id, label: p.name }))]} />
            )}
          />
          <FormInput control={control} name="description" label="Description" />
          <FormInput control={control} name="commissionRate" label="Commission %" inputMode="numeric" maxLength={2} required />
          <fieldset>
            <legend className="mb-2 text-body-sm font-medium text-ink-secondary">Icon</legend>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Icon">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" role="radio" aria-checked={field.value === ic} aria-label={ic} onClick={() => field.onChange(ic)} className={cn('focus-ring flex h-11 w-11 items-center justify-center rounded-lg border', field.value === ic ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-border text-ink-secondary hover:border-primary-300')}>
                      <Icon name={ic} size={19} />
                    </button>
                  ))}
                </div>
              )}
            />
          </fieldset>
          <Controller control={control} name="active" render={({ field }) => <SwitchRow title="Visible to customers" value={field.value} onChange={field.onChange} />} />
        </form>
      </Modal>
      <ConfirmDialog open={!!toDelete} tone="danger" icon="trash" title={`Delete ${toDelete?.name}?`} message="Categories with services can’t be deleted — hide them instead." confirmLabel="Delete" loading={remove.isPending} onCancel={() => setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} />
    </>
  );
}

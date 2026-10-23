import { useState } from 'react';
import { Button, Card, Icon, Input, ListSkeleton, Modal, PageHeader, QueryView, Switch } from '@/components/ui';
import { useAdminCities } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';

export default function AdminCities() {
  usePageMeta({ title: 'Cities', noindex: true });
  const q = useAdminCities();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const toggle = useApiMutation((id: string) => adminApi.toggleCity(id), { invalidate: [qk.admin.cities, qk.cities], successMessage: (ct) => `${ct.name} ${ct.active ? 'enabled' : 'disabled'}` });
  const add = useApiMutation(() => adminApi.addCity(name, state), { invalidate: [qk.admin.cities, qk.cities], successMessage: 'City added', onSuccess: () => (setOpen(false), setName(''), setState('')) });

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Cities"
        subtitle="Where customers can book"
        back="/admin/more"
        actions={
          <Button size="sm" leftIcon="plus" onClick={() => (setError(null), setOpen(true))}>
            Add city
          </Button>
        }
      />
      <QueryView query={q} loading={<ListSkeleton rows={5} height={56} />}>
        {(list) => (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {list.map((ct) => (
                <li key={ct.id} className="flex items-center gap-3 px-4 py-3">
                  <Icon name="building" size={19} className={ct.active ? 'text-primary-500' : 'text-ink-muted'} />
                  <div className="flex-1">
                    <p className="font-medium">{ct.name}</p>
                    <p className="text-caption text-ink-muted">{ct.state}</p>
                  </div>
                  <Switch checked={ct.active} onChange={() => toggle.mutate(ct.id)} label={`${ct.name} active`} tone="success" />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </QueryView>
      <Modal open={open} onClose={() => setOpen(false)} title="Add city" size="sm" footer={<Button fullWidth loading={add.isPending} onClick={() => (name.trim().length < 2 || state.trim().length < 2 ? setError('Enter both city and state') : add.mutate())}>Add city</Button>}>
        <div className="flex flex-col gap-4">
          <Input label="City" value={name} onValueChange={(t) => (setName(t), setError(null))} error={error ?? undefined} data-autofocus />
          <Input label="State" value={state} onValueChange={(t) => (setState(t), setError(null))} />
        </div>
      </Modal>
    </div>
  );
}

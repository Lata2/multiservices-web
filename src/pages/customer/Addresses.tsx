import { useState } from 'react';
import { Link } from 'react-router';
import { AddressCard } from '@/components/domain';
import { ConfirmDialog, EmptyState, LinkButton, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { useAddresses } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { addressesApi } from '@/services/api';
import type { Address } from '@/types/models';

export default function Addresses() {
  usePageMeta({ title: 'Saved addresses', noindex: true });
  const q = useAddresses();
  const [toDelete, setToDelete] = useState<Address | null>(null);
  const remove = useApiMutation((id: string) => addressesApi.remove(id), { invalidate: [qk.addresses], successMessage: 'Address removed', onSuccess: () => setToDelete(null) });
  const makeDefault = useApiMutation((id: string) => addressesApi.setDefault(id), { invalidate: [qk.addresses], successMessage: 'Default address updated' });
  const btn = 'focus-ring rounded text-body-sm font-semibold hover:underline';

  return (
    <>
      <PageHeader title="Saved addresses" back="/account" actions={<LinkButton to="/account/addresses/new" size="sm" leftIcon="plus">Add address</LinkButton>} />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={120} />} empty={<EmptyState icon="pin" title="No saved addresses" message="Add an address to book services faster." actionLabel="Add address" actionTo="/account/addresses/new" />}>
        {(list) => (
          <ul className="grid gap-4 xl:grid-cols-2">
            {list.map((a) => (
              <li key={a.id}>
                <AddressCard address={a} />
                <div className="mt-2 flex justify-end gap-5 px-1">
                  {!a.isDefault ? (
                    <button type="button" onClick={() => makeDefault.mutate(a.id)} className={`${btn} text-primary-600`}>
                      Set as default
                    </button>
                  ) : null}
                  <Link to={`/account/addresses/${a.id}`} className={`${btn} text-ink-secondary`}>
                    Edit
                  </Link>
                  <button type="button" onClick={() => setToDelete(a)} className={`${btn} text-danger-600`}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
      <ConfirmDialog
        open={!!toDelete}
        tone="danger"
        icon="trash"
        title="Delete address?"
        message={toDelete ? `${toDelete.label}: ${toDelete.line1}` : ''}
        confirmLabel="Delete"
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </>
  );
}

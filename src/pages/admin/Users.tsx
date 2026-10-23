import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Avatar, Badge, Chip, ChipRow, DataTable, EmptyState, ListSkeleton, PageHeader, QueryView, SearchBar, type BadgeTone } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import { useAdminUsers } from '@/hooks/api';
import { useDebounced } from '@/hooks/useDebounced';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { AccountStatus, Role } from '@/types/models';
import { formatDate } from '@/utils/format';

const USER_STATUS: Record<AccountStatus, BadgeTone> = { active: 'success', pending: 'warning', blocked: 'danger', rejected: 'neutral' };

export default function AdminUsers() {
  usePageMeta({ title: 'Users', noindex: true });
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = (params.get('role') as Role | 'all' | null) ?? 'customer';
  const [text, setText] = useState('');
  const query = useDebounced(text);
  const q = useAdminUsers(role, query);

  return (
    <>
      <PageHeader title="Users" subtitle={q.data ? `${q.data.length} accounts` : undefined} />
      <SearchBar value={text} onChange={setText} placeholder="Search name or email" className="mb-3 lg:max-w-md" />
      <ChipRow className="mb-4" wrap label="Filter by role">
        {(['customer', 'provider', 'delivery', 'admin', 'all'] as const).map((r) => (
          <Chip key={r} label={r === 'all' ? 'All' : ROLES[r].short} icon={r === 'all' ? undefined : ROLES[r].icon} selected={role === r} onClick={() => setParams({ role: r }, { replace: true })} />
        ))}
      </ChipRow>
      <QueryView query={q} loading={<ListSkeleton rows={6} height={56} />} empty={<EmptyState icon="users" title="No users found" />}>
        {(list) => (
          <DataTable
            caption="Users"
            data={list}
            keyExtractor={(u) => u.id}
            onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
            columns={[
              {
                key: 'n',
                title: 'User',
                minWidth: 220,
                sortValue: (u) => u.name,
                render: (u) => (
                  <span className="flex items-center gap-2.5">
                    <Avatar src={u.avatar} name={u.name} size={32} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{u.name}</span>
                      <span className="block truncate text-caption text-ink-muted">{u.email}</span>
                    </span>
                  </span>
                ),
              },
              { key: 'r', title: 'Role', render: (u) => ROLES[u.role].short, sortValue: (u) => u.role },
              { key: 's', title: 'Status', render: (u) => <Badge label={u.status} tone={USER_STATUS[u.status]} className="capitalize" />, sortValue: (u) => u.status },
              { key: 'c', title: 'City', render: (u) => u.city ?? '—', sortValue: (u) => u.city ?? '' },
              { key: 'j', title: 'Joined', render: (u) => formatDate(u.createdAt), sortValue: (u) => u.createdAt, minWidth: 110 },
            ]}
          />
        )}
      </QueryView>
    </>
  );
}

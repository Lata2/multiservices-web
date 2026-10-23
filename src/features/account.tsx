import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ROLES } from '@/constants/roles';
import { useRoleBase } from '@/hooks/useRole';
import { useSignOut } from '@/hooks/useSignOut';
import { useAuthStore } from '@/store/auth.store';
import { Avatar, Badge, Button, Card, ConfirmDialog, Divider, Icon, ListItem, type IconName } from '@/components/ui';

export const APP_VERSION = '1.0.0';

export function ProfileHeaderCard({ extra }: { extra?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { base } = useRoleBase();
  if (!user) return null;
  return (
    <Card elevation="md" className="mb-6 flex items-center gap-4">
      <Avatar src={user.avatar} name={user.name} size={64} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-h3 font-semibold">{user.name}</p>
        <p className="truncate text-body-sm text-ink-secondary">{user.email}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge label={ROLES[user.role].title} tone="primary" />
          {user.status === 'pending' ? <Badge label="Verification pending" tone="warning" icon="clock" /> : null}
        </div>
        {extra}
      </div>
      <Link to={`${base}/profile`} className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100" aria-label="Edit profile">
        <Icon name="pencil" size={16} />
      </Link>
    </Card>
  );
}

export interface MenuEntry {
  icon: IconName;
  title: string;
  subtitle?: string;
  to?: string;
  onClick?: () => void;
  right?: ReactNode;
  danger?: boolean;
}

export function MenuSection({ title, items, className }: { title?: string; items: MenuEntry[]; className?: string }) {
  return (
    <section className={className ?? 'mb-5'}>
      {title ? <h2 className="mb-2 ml-1 text-caption font-semibold text-ink-muted">{title}</h2> : null}
      <Card className="py-1">
        {items.map((it, i) => (
          <div key={it.title}>
            {i > 0 ? <Divider className="ml-14" /> : null}
            <ListItem icon={it.icon} title={it.title} subtitle={it.subtitle} right={it.right} to={it.to} onClick={it.onClick} danger={it.danger} />
          </div>
        ))}
      </Card>
    </section>
  );
}

export function SignOutButton() {
  const signOut = useSignOut();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Button variant="outline" leftIcon="logout" fullWidth onClick={() => setConfirm(true)} className="mt-2">
        Sign out
      </Button>
      <p className="mt-4 text-center text-caption text-ink-muted">Servio web v{APP_VERSION}</p>
      <ConfirmDialog open={confirm} icon="logout" title="Sign out?" message="You will need to sign in again to access your account." confirmLabel="Sign out" tone="danger" onCancel={() => setConfirm(false)} onConfirm={signOut} />
    </>
  );
}

import { Link, useNavigate } from 'react-router';
import { Icon } from '@/components/ui';
import { ROLE_ORDER, ROLES } from '@/constants/roles';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/models';

export default function Welcome() {
  usePageMeta({ title: 'Choose how to continue' });
  const setPendingRole = useAuthStore((s) => s.setPendingRole);
  const navigate = useNavigate();
  const choose = (role: Role) => {
    setPendingRole(role);
    navigate(`/login?role=${role}`);
  };
  return (
    <>
      <h1 className="text-h1 font-bold">How would you like to continue?</h1>
      <p className="mt-1 text-ink-secondary">Choose your role to sign in or create an account.</p>
      <ul className="mt-6 flex flex-col gap-3">
        {ROLE_ORDER.map((r) => {
          const meta = ROLES[r];
          return (
            <li key={r}>
              <button type="button" onClick={() => choose(r)} className="focus-ring flex w-full items-center gap-3.5 rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-primary-400 hover:bg-primary-50">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon name={meta.icon} size={21} />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{meta.title}</span>
                  <span className="mt-0.5 block text-caption text-ink-muted">{meta.description}</span>
                </span>
                <Icon name="chevron-right" size={17} className="text-ink-muted" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-caption text-ink-muted">
        Just browsing?{' '}
        <Link to="/" className="font-semibold text-primary-600 hover:underline">
          Explore services without an account
        </Link>
      </p>
    </>
  );
}

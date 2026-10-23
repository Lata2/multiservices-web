import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { roleHome } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/models';

/** Protects a role's routes. Guests go to sign-in (and come back after); other roles go to their own home. */
export function RequireRole({ role, children }: { role: Role; children?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?role=${role}&next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children ?? <Outlet />}</>;
}

/** Auth pages are for guests only. */
export function GuestOnly() {
  const user = useAuthStore((s) => s.user);
  const next = new URLSearchParams(useLocation().search).get('next');
  if (user) return <Navigate to={next && next.startsWith('/') ? next : roleHome(user.role)} replace />;
  return <Outlet />;
}

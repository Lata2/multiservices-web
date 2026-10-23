import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { ROLES } from '@/constants/roles';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/models';

/** Role for auth pages: `?role=` in the URL wins (shareable links), else the last picked role. */
export function useAuthRole() {
  const [params] = useSearchParams();
  const role = useAuthStore((s) => s.pendingRole);
  const setRole = useAuthStore((s) => s.setPendingRole);
  const raw = params.get('role');
  const fromUrl = raw && raw in ROLES ? (raw as Role) : null;
  useEffect(() => {
    if (fromUrl && fromUrl !== role) setRole(fromUrl);
  }, [fromUrl, role, setRole]);
  return { role: fromUrl ?? role, setRole, next: params.get('next') };
}

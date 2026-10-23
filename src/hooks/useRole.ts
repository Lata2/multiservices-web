import { roleBase } from '@/constants/routes';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types/models';

/** Current role and its base path for shared screens (customer → `/account`, others → `/<role>`). */
export function useRoleBase(): { role: Role; base: string } {
  const role = useAuthStore((s) => s.user?.role ?? 'customer');
  return { role, base: roleBase(role) };
}

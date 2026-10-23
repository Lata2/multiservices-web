import type { User } from '@/types/models';

/**
 * Lightweight session accessor used by the service layer — the equivalent of
 * attaching a bearer token to every request. The auth store keeps it in sync.
 */
let current: { user: User | null; token: string | null } = { user: null, token: null };

export const session = {
  set(user: User | null, token: string | null) {
    current = { user, token };
  },
  get user() {
    return current.user;
  },
  get token() {
    return current.token;
  },
};

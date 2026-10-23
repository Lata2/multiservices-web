import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, type AuthMethod } from '@/services/api';
import { session } from '@/services/session';
import type { Role, User } from '@/types/models';
import { persistStorage } from './storage';

interface AuthState {
  user: User | null;
  token: string | null;
  /** How the session was created — used to also sign out of Google/Apple on logout. */
  method: AuthMethod | null;
  /** Role picked on the role-select screen before login/signup. */
  pendingRole: Role;
  setPendingRole: (r: Role) => void;
  signIn: (user: User, token: string, method?: AuthMethod) => void;
  updateUser: (user: User) => void;
  signOut: () => void;
}

/**
 * Session store. On the web the token is kept in localStorage; when the real backend is
 * integrated prefer an httpOnly, SameSite cookie session and drop `token` from `partialize`.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      method: null,
      pendingRole: 'customer',
      setPendingRole: (pendingRole) => set({ pendingRole }),
      signIn: (user, token, method = 'password') => {
        session.set(user, token);
        set({ user, token, method });
      },
      updateUser: (user) =>
        set((s) => {
          session.set(user, s.token);
          return { user };
        }),
      signOut: () => {
        session.set(null, null);
        set({ user: null, token: null, method: null });
      },
    }),
    {
      name: 'servio.auth',
      storage: persistStorage,
      partialize: (s) => ({ user: s.user, token: s.token, method: s.method, pendingRole: s.pendingRole }),
      // Runs synchronously while the store is created (localStorage is sync), so the
      // restored session is applied via `merge` rather than `setState`.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>;
        const restored = p.user && p.token ? authApi.restoreSession(p.user, p.token) : null;
        session.set(restored?.user ?? null, restored?.token ?? null);
        return {
          ...current,
          pendingRole: p.pendingRole ?? current.pendingRole,
          user: restored?.user ?? null,
          token: restored?.token ?? null,
          method: restored ? (p.method ?? null) : null,
        };
      },
    },
  ),
);

export const homeRouteFor = (role: Role) => (role === 'customer' ? '/' : `/${role}`);

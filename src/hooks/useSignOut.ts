import { navigation } from '@/app/navigation';
import { queryClient, setUnauthenticatedHandler } from '@/app/queryClient';
import { signOutOfProvider } from '@/services/auth';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';

/** Clears the session, per-user caches and the identity provider's local session. */
export function signOutEverywhere(opts: { reason?: 'expired' } = {}) {
  const { method, user } = useAuthStore.getState();
  if (!user) return;
  void signOutOfProvider(method);
  useAuthStore.getState().signOut();
  useCartStore.getState().clear();
  queryClient.clear();
  navigation.navigate(opts.reason === 'expired' ? '/login' : '/', { replace: true });
  if (opts.reason === 'expired') toast.info('Your session has expired. Please sign in again.');
}

// Any 401 UNAUTHENTICATED from the API signs the user out once.
setUnauthenticatedHandler(() => signOutEverywhere({ reason: 'expired' }));

export function useSignOut() {
  return () => signOutEverywhere();
}

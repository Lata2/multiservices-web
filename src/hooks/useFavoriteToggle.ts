import { useNavigate } from 'react-router';
import { useFavoriteIds } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { favoritesApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';

/** Favourite toggle for a service or provider; guests are sent to sign-in first. */
export function useFavoriteToggle(id: string) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const favs = useFavoriteIds();
  const fav = !!favs.data?.includes(id);
  const m = useApiMutation(() => favoritesApi.toggle(id), { invalidate: [qk.favorites], successMessage: fav ? 'Removed from favourites' : 'Saved to favourites' });
  const toggle = () => {
    if (!user) return navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    if (user.role !== 'customer') return toast.info('Favourites are available for customer accounts.');
    m.mutate();
  };
  return { fav, toggle, pending: m.isPending };
}


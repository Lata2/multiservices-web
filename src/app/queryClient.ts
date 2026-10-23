import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isApiError, isUnauthenticated } from '@/services/http';

let onUnauthenticated: (() => void) | null = null;
/** Registered by the session module so a 401 anywhere signs the user out once. */
export function setUnauthenticatedHandler(fn: () => void) {
  onUnauthenticated = fn;
}

const handleError = (err: unknown) => {
  if (isUnauthenticated(err)) onUnauthenticated?.();
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      // Retry only transient failures (network / 5xx), never 4xx business errors.
      retry: (count, err) => {
        const status = isApiError(err) ? err.status : 500;
        return (status === 0 || status >= 500) && count < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: true,
      // Keep showing cached data while offline instead of erroring.
      networkMode: 'offlineFirst',
    },
    mutations: { retry: 0, networkMode: 'always' },
  },
});

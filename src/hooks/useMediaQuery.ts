import { useSyncExternalStore } from 'react';

/** Reactive CSS media query (e.g. `useMediaQuery('(min-width: 1024px)')`). */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

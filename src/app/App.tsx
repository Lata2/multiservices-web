import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { RouterProvider } from 'react-router';
import '@/hooks/useSignOut'; // registers the global 401 → sign-out handler
import { queryClient } from './queryClient';
import { router } from './router';

const Devtools = import.meta.env.DEV && import.meta.env.VITE_QUERY_DEVTOOLS === 'true' ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools }))) : () => null;

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Suspense>
        <Devtools buttonPosition="bottom-left" />
      </Suspense>
    </QueryClientProvider>
  );
}

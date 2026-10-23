import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router';
import { Icon, ToastHost } from '../ui';

const subscribe = (cb: () => void) => onlineManager.subscribe(cb);
const getOnline = () => onlineManager.isOnline();

function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getOnline, () => true);
  if (online) return null;
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h,0px)+84px)] z-[80] flex justify-center px-4 lg:bottom-6">
      <span className="flex animate-toast-in items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-caption font-medium text-white shadow-lg">
        <Icon name="offline" size={15} />
        You are offline — showing saved data
      </span>
    </div>
  );
}

function RouteProgress() {
  const nav = useNavigation();
  if (nav.state === 'idle') return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-primary-100" role="progressbar" aria-label="Loading page">
      <div className="h-full w-2/5 animate-progress bg-primary-500" />
    </div>
  );
}

export function RootLayout() {
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-md bg-primary-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to content
      </a>
      <RouteProgress />
      <Outlet />
      <OfflineBanner />
      <ToastHost />
      <ScrollRestoration />
    </>
  );
}

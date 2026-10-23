import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button, Icon, LinkButton } from '../ui';
import { LogoMark } from './Logo';

/** Branded error screen for any route that throws (or a chunk that fails to load after a deploy). */
export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const chunk = error instanceof Error && /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);
  usePageMeta({ title: notFound ? 'Page not found' : 'Something went wrong', noindex: true });
  if (import.meta.env.DEV && !notFound) console.error(error);
  // Integration point: Sentry.captureException(error)
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Link to="/" aria-label="Servio home" className="mb-10">
        <LogoMark size={44} />
      </Link>
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <Icon name={notFound ? 'compass' : 'alert'} size={34} />
      </span>
      <h1 className="text-h1 font-bold">{notFound ? 'This page doesn’t exist' : chunk ? 'A new version is available' : 'Something went wrong'}</h1>
      <p className="mt-2 max-w-md text-ink-secondary">
        {notFound ? 'The link may be broken or the page may have moved.' : chunk ? 'Reload to get the latest version of Servio.' : 'This page ran into a problem. Your data is safe — try again or head home.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {!notFound ? (
          <Button leftIcon="refresh" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        ) : null}
        <LinkButton to="/" variant={notFound ? 'primary' : 'outline'} leftIcon="home">
          Go to home
        </LinkButton>
      </div>
    </main>
  );
}

export function NotFoundPage() {
  usePageMeta({ title: 'Page not found', noindex: true });
  return (
    <div className="container-page flex flex-col items-center py-20 text-center">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <Icon name="compass" size={34} />
      </span>
      <h1 className="text-h1 font-bold">This page doesn’t exist</h1>
      <p className="mt-2 max-w-md text-ink-secondary">The link may be broken or the page may have moved. Try searching for a service instead.</p>
      <div className="mt-8 flex gap-3">
        <LinkButton to="/">Go to home</LinkButton>
        <LinkButton to="/search" variant="outline" leftIcon="search">
          Search services
        </LinkButton>
      </div>
    </div>
  );
}

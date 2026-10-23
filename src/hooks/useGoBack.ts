import { useNavigate } from 'react-router';

/** Go back in history, or to `fallback` when the page was opened directly (deep link / refresh). */
export function useGoBack(fallback: string | boolean = '/') {
  const navigate = useNavigate();
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(typeof fallback === 'string' ? fallback : '/', { replace: true });
  };
}

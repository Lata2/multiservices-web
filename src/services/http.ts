import { env } from '@/config/env';
import { session } from './session';

/**
 * Typed error thrown by every service call (mock or real) so screens can
 * render consistent error states.
 */
export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;
  /** Extra machine-readable data (e.g. prefill values for `SIGNUP_REQUIRED`). */
  details?: Record<string, unknown>;
  constructor(message: string, status = 400, code = 'BAD_REQUEST', fieldErrors?: Record<string, string>, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
/** A 401 means the session token is no longer valid — the app signs out globally (see providers/queryClient.ts). */
export const isUnauthenticated = (e: unknown) => isApiError(e) && e.status === 401 && e.code === 'UNAUTHENTICATED';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Real HTTP client for the production backend. Not used while
 * `env.useMocks` is true, but service modules can switch to it one function
 * at a time: `return http<Booking[]>('/bookings', { query: { tab } })`.
 */
export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.endsWith('/') ? env.apiBaseUrl : `${env.apiBaseUrl}/`);
  Object.entries(opts.query ?? {}).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)));

  // Combine the caller's signal (TanStack Query cancellation) with a timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? env.requestTimeoutMs);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: opts.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (opts.signal?.aborted) throw e; // Cancelled by the caller — let TanStack Query handle it.
    const timedOut = controller.signal.aborted;
    throw new ApiError(
      timedOut ? 'The server took too long to respond. Please try again.' : 'Unable to reach the server. Check your internet connection.',
      0,
      timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
    );
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);
  }

  const data = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = res.status === 401 ? 'UNAUTHENTICATED' : (data?.code ?? 'HTTP_ERROR');
    throw new ApiError(data?.message ?? 'Something went wrong', res.status, code, data?.errors, data?.details);
  }
  return data as T;
}

/**
 * Mock transport: runs `handler` against the in-memory DB after a short delay
 * and returns a deep copy (so callers can't mutate the DB by accident).
 */
export async function mock<T>(handler: () => T, latency = env.mockLatency): Promise<T> {
  if (latency > 0) await new Promise((r) => setTimeout(r, latency * (0.6 + Math.random() * 0.8)));
  const result = handler();
  return result === undefined ? result : (JSON.parse(JSON.stringify(result)) as T);
}

export function requireUser() {
  const user = session.user;
  if (!user) throw new ApiError('Your session has expired. Please sign in again.', 401, 'UNAUTHENTICATED');
  return user;
}

export function notFound(what: string): never {
  throw new ApiError(`${what} not found`, 404, 'NOT_FOUND');
}

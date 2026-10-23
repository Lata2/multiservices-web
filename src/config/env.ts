/**
 * Runtime configuration. Vite inlines `VITE_*` variables at build time.
 * Copy `.env.example` to `.env` (or `.env.local`) to override.
 *
 * Never put secrets here: everything in this file ends up in the JS bundle.
 * OAuth *client IDs* are public identifiers (not secrets), so they are fine.
 */
const e = import.meta.env;
const flag = (v: string | undefined, fallback: boolean) => (v === undefined || v === '' ? fallback : v === 'true' || v === '1');

const useMocks = flag(e.VITE_USE_MOCKS, true);

export type AuthMode = 'demo' | 'live';

export const env = {
  appName: 'Servio',
  siteUrl: (e.VITE_SITE_URL as string | undefined) ?? 'https://servio.app',
  apiBaseUrl: (e.VITE_API_URL as string | undefined) ?? 'https://api.servio.app/v1',
  /** When true every service module resolves against the in-memory mock DB. */
  useMocks,
  /** Artificial latency (ms) for mock requests, to exercise loading states. */
  mockLatency: Number(e.VITE_MOCK_LATENCY ?? 450),
  /** Request timeout for the real HTTP client. */
  requestTimeoutMs: Number(e.VITE_REQUEST_TIMEOUT_MS ?? 20_000),
  currency: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  demoOtp: '123456',
  isDev: !!e.DEV,

  auth: {
    /**
     * `demo` — Google/Apple buttons open a clearly-labelled demo account picker. No real OAuth
     *          happens; the mock backend issues a session for the picked identity (mocks only).
     * `live` — Buttons run Google Identity Services / Sign in with Apple JS. Needs the IDs below.
     */
    mode: (e.VITE_AUTH_MODE === 'live' ? 'live' : 'demo') as AuthMode,
    google: { clientId: (e.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '' },
    apple: {
      enabled: flag(e.VITE_APPLE_SIGN_IN, true),
      /** Apple "Services ID" configured for Sign in with Apple on the web. */
      serviceId: (e.VITE_APPLE_SERVICE_ID as string | undefined) ?? '',
      redirectUri: (e.VITE_APPLE_REDIRECT_URI as string | undefined) ?? '',
    },
    /** Dev-only: let the mock backend accept real ID tokens after checking claims (no signature check). */
    mockAcceptUnverifiedIdTokens: !!e.DEV && flag(e.VITE_MOCK_ACCEPT_UNVERIFIED_ID_TOKENS, false),
  },
} as const;

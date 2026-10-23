/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_MOCK_LATENCY?: string;
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
  readonly VITE_AUTH_MODE?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_APPLE_SIGN_IN?: string;
  readonly VITE_APPLE_SERVICE_ID?: string;
  readonly VITE_APPLE_REDIRECT_URI?: string;
  readonly VITE_MOCK_ACCEPT_UNVERIFIED_ID_TOKENS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

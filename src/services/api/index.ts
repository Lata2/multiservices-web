/**
 * Service layer barrel. Screens & hooks import from here only.
 * To integrate the real backend, re-implement each function with `http()`
 * (see `src/services/http.ts`) keeping the same signature — no UI changes needed.
 */
export * from './auth.api';
export * from './catalog.api';
export * from './bookings.api';
export * from './account.api';
export * from './provider.api';
export * from './delivery.api';
export * from './admin.api';

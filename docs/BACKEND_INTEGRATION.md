# Backend integration guide

The website is frontend-only. Every screen talks to a **typed service layer** in
`src/services/api/*`, which today resolves against an in-memory mock database
(`src/mocks/db.ts`, seeded by `src/mocks/seed.ts`). Swapping in a real backend
means re-implementing those functions — **no page or component changes**.

```
Page ──► hook (src/hooks/api.ts, TanStack Query) ──► service fn (src/services/api) ──► mock() | http()
```

## 1. Switch the transport

`src/services/http.ts` exports two helpers:

| Helper | Use |
| --- | --- |
| `mock(handler, latency?)` | Runs a function against the mock DB with artificial latency. Errors thrown inside become rejected promises. |
| `http<T>(path, { method, body, query, signal, timeoutMs })` | `fetch` wrapper: base URL from `VITE_API_URL`, `Authorization: Bearer <token>`, timeout + caller cancellation, JSON parsing, typed `ApiError`. |

Replace module functions one at a time, keeping the signature:

```ts
// before
listMine: (tab: BookingTab) => mock(() => db.bookings.filter(/* … */)),
// after
listMine: (tab: BookingTab, signal?: AbortSignal) => http<Booking[]>('/bookings', { query: { tab }, signal }),
```

Then set `VITE_USE_MOCKS=false` and `VITE_API_URL=https://your-api/v1`. Once nothing
references `mock()` any more, delete `src/mocks/` (it is already split into its own
lazy chunk, `mock-api`, so it never blocks first paint).

## 2. Error contract

The UI expects failures as `ApiError { status, code, message, fieldErrors?, details? }`.
`http()` builds one from a JSON error body of the form:

```json
{ "code": "SLOT_TAKEN", "message": "That time slot was just taken.", "fieldErrors": { "email": "Already registered" } }
```

Codes the UI reacts to specifically:

| Code | Where | UI behaviour |
| --- | --- | --- |
| `UNAUTHENTICATED` (401) | anywhere | global sign-out + redirect to login (`useSignOut`) |
| `SLOT_TAKEN` (409) | checkout | sends the user back to pick another slot |
| `PHONE_REQUIRED` (422) | checkout | prompts for a phone number on the profile |
| `PAYMENT_METHOD_DISABLED`, `MAINTENANCE` | checkout | inline message |
| `PAYMENT_DECLINED` (402) | checkout | processing modal shows a retry state |
| `SIGNUP_REQUIRED` | social login | opens sign-up prefilled with `details` |
| any + `fieldErrors` | forms | errors mapped onto the matching fields |

## 3. Auth

* `authApi.login / verifyOtp / signup / socialLogin` must return `{ user, token }`.
* The token is persisted by `src/store/auth.store.ts` (localStorage) and attached by `http()`.
* `authApi.restoreSession(token)` is called synchronously on boot; with a real backend
  keep a cached `user` in the store and refresh it via `authApi.me()` (already wired as a query).
* **Google** (`src/services/auth/providers/google.ts`) returns a Google ID token (JWT).
  The backend must verify signature, `aud` = your client ID, `iss`, `exp` and `nonce`.
* **Apple** (`apple.ts`) returns `{ id_token, code, user? }` from Sign in with Apple JS.
  Verify the ID token against Apple's JWKS and exchange `code` server-side.
* Set `VITE_AUTH_MODE=live` plus `VITE_GOOGLE_CLIENT_ID` / `VITE_APPLE_SERVICE_ID` /
  `VITE_APPLE_REDIRECT_URI` to turn the real buttons on.

## 4. Service modules

| Module | Functions |
| --- | --- |
| `authApi` | login, requestOtp, verifyOtp, signup, socialLogin, forgotPassword, updateProfile, changePassword, deleteAccount, me, restoreSession |
| `catalogApi` | getCities, getPaymentConfig, getCategories, getAllCategories, getCategory, getBanners, getServices, getPopularServices, getService, getProviders, getProvider, search, getServiceReviews, getSlots, getServicesByIds |
| `bookingsApi` | quote, create, listMine, get, cancel, reschedule, updateStatus, markPaid |
| `addressesApi`, `notificationsApi`, `walletApi`, `favoritesApi`, `reviewsApi`, `offersApi`, `supportApi`, `chatApi` | customer account features (shared by every role where relevant) |
| `providerApi` | dashboard, profile, updateProfile, uploadDocument, bookings, services, saveService, toggleService, deleteService, updateAvailability, promos, savePromo, deletePromo, earnings, requestPayout |
| `deliveryApi` | profile, setOnline, updateProfile, home, history, task, accept, reject, markPickedUp, markDelivered, earnings, requestPayout, taskForBooking |
| `adminApi` | dashboard, users, user, setUserStatus, providers, provider, setProviderStatus, setCommission, partners, setPartnerStatus, bookings, categories, saveCategory, deleteCategory, payouts, processPayout, promos, savePromo, togglePromo, deletePromo, banners, toggleBanner, settings, updateSettings, cities, toggleCity, addCity, broadcast |

All request/response shapes live in `src/types/models.ts`; use them as the API contract.

## 5. Business rules the server must own

The mock backend enforces these so the UI behaves realistically — the real API must too:

* **Pricing** — `bookingsApi.quote` is authoritative (subtotal, promo, visiting charge, tax from
  platform settings). The cart shows local estimates only until the quote returns.
* **Promos** — min order, expiry, usage limits, provider scoping (`src/utils/pricing.ts`).
* **Slots** — generated from provider working hours, breaks, blocked dates and existing
  bookings (`src/utils/slots.ts`); re-validate on `create` and return `SLOT_TAKEN`.
* **Status machine** — `STATUS_FLOW` in `bookings.api.ts`: pending → confirmed → on_the_way →
  in_progress → completed, plus rejected / cancelled. `in_progress` requires the customer's
  4-digit start code.
* **Pickup services** create a delivery task; delivery completion requires the customer's OTP.
* **Side effects** — status changes notify the other party, wallet refunds on cancel of paid
  bookings, provider/partner earnings and commission on completion, review aggregates.

## 6. Caching

Query keys are centralised in `src/hooks/queryKeys.ts`; mutations in `src/hooks/api.ts`
invalidate the right keys. With a real backend you can additionally push updates
(WebSocket/SSE) and call `queryClient.invalidateQueries({ queryKey: qk.bookings.all })`.

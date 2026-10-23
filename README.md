# Servio — web

Production-ready web frontend for **Servio**, the multi-service home-services marketplace
(cleaning, AC repair, electricians, plumbing, salon, pest control, laundry, car care…).
It is a full web port of the Servio mobile app: all four roles — **customer, service
provider, delivery partner and admin** — with every app feature, plus web-specific
improvements (desktop layouts, sortable tables, CSV export, printable invoices, SEO).

The backend is not included. A typed service layer runs against a realistic in-memory mock
backend so every flow works end to end today; see
[`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) to plug in a real API.

## Quick start

Requires **Node.js 20.19+ or 22.12+** (Vite 8).

```bash
npm install
npm run dev          # http://localhost:5173
```

Production build:

```bash
npm run build        # type-checks, then builds to dist/
npm run preview      # serves dist/ on http://localhost:4173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR (TanStack Query devtools included) |
| `npm run build` | `tsc -b` + optimised production build |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm test` | Unit tests (Vitest) — pricing, promos, slots, booking engine |
| `npm run e2e` | Playwright end-to-end tests against the production build (see below) |
| `npm run check` | typecheck + lint + unit tests + build |

### Environment

Copy `.env.example` to `.env.local`. All defaults work out of the box (mock backend,
demo social sign-in). Main switches: `VITE_USE_MOCKS`, `VITE_API_URL`, `VITE_AUTH_MODE`.

### Deploying

`dist/` is a static single-page app. Configure your host to fall back to `index.html` for
unknown paths (Netlify: `/* /index.html 200`; Vercel: a rewrite to `/index.html`; Nginx:
`try_files $uri /index.html;`). Cache `dist/assets/*` forever (file names are hashed);
don't cache `index.html`. Update `VITE_SITE_URL`, `public/sitemap.xml` and `public/robots.txt`
with your domain.

## Demo accounts

Password for all: **`Demo@1234`** · OTP for phone login: **`123456`**

| Role | Email | Lands on |
| --- | --- | --- |
| Customer | `customer@servio.app` | `/` |
| Service provider | `provider@servio.app` | `/provider` |
| Delivery partner | `delivery@servio.app` | `/delivery` |
| Admin | `admin@servio.app` | `/admin` |

The login page has one-click "fill" cards for each. Demo-only helpers are clearly labelled
in the UI: the job start code / delivery OTP are shown as hints, and typing `#fail` in the
checkout notes simulates a declined payment. Mock data lives in memory, so a full page reload
resets it (your session and cart are kept).

## Tech stack

React 19 · Vite 8 · TypeScript (strict) · Tailwind CSS 4 · TanStack Query 5 ·
React Router 8 · Zustand 5 · React Hook Form + Zod 4 · lucide icons · Inter (self-hosted) ·
Vitest · Playwright · oxlint.

## Project structure

```
src/
  app/            router (lazy routes), App, QueryClient, imperative navigation
  components/
    ui/           design-system primitives — Button, Card, Input, Modal/Sheet, Table, Tabs,
                  Chip, Select, Switch, OTP input, charts, Toast, loading/empty/error states
    domain/       marketplace components — service/provider/booking cards, price summary,
                  timeline, schedule picker, cart bar
    layout/       site header/footer, bottom tabs, account sidebar, role consoles, guards
  features/       cross-page feature blocks (social auth, filters, earnings, account menu)
  pages/          one folder per area: public, auth, customer, shared, provider, delivery, admin
  hooks/          TanStack Query hooks (api.ts), query keys, page meta/SEO, media queries
  services/       http client, session, auth providers (Google/Apple), api/* service modules
  mocks/          seed data + in-memory database used by the service layer
  store/          Zustand stores — auth, cart, app prefs, toasts (persisted safely)
  constants/      routes, roles, booking status metadata
  types/          domain models (the API contract)
  utils/          pricing, slots, formatting, validation, linking helpers
  styles/         index.css — the single theme file
e2e/              Playwright specs (user flows + every route at desktop & mobile)
docs/             backend integration guide
```

## Theming

Everything visual is driven from **`src/styles/index.css`** (Tailwind 4 `@theme`):
brand colours (Royal Blue primary, Saffron accent, Oxford neutrals), feedback colours,
semantic tokens (`background`, `surface`, `ink`, `border`…), the type scale, radii,
shadows, container widths and animations. Change a token there and it applies everywhere.

Components use only these tokens — no hard-coded colours. Variants are defined once:
`Button` (`variant`, `size`), `Badge` (`tone`), `Card`, `controlClasses` for all form
controls, `Modal` (`dialog` on desktop / bottom `sheet` on phones). Category colours and icons
come from the data (`ServiceThumb`).

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/explore`, `/category/:id`, `/services`, `/search?q=`, `/service/:id`, `/professionals`, `/professionals/:id`, `/offers`, `/legal/:doc`, `/cart` |
| Auth | `/welcome`, `/login` (`?role=`), `/login/otp`, `/signup` (`?role=customer\|provider\|delivery`, `?ref=`), `/forgot-password` |
| Customer | `/checkout/schedule`, `/checkout`, `/booking-success/:id`, `/bookings`, `/bookings/:id`, `/bookings/:id/review`, `/bookings/:id/invoice`, `/account`, `/account/{addresses,wallet,favorites,refer,notifications,messages,support,profile,password,settings}` |
| Provider | `/provider`, `/provider/{bookings,services,availability,reviews,earnings,business,documents,promos,account,messages,notifications,support,settings}` |
| Delivery | `/delivery`, `/delivery/{history,tasks/:id,earnings,vehicle,account,notifications,support,settings}` |
| Admin | `/admin`, `/admin/{bookings,providers,users,partners,payouts,categories,promos,banners,reviews,support,platform,cities,broadcast,reports,more,notifications,settings}` |

Private areas are protected by role guards that redirect to login and back (`?next=`).

## Feature coverage (app → web)

**Customer** — city picker, home with banners/categories/popular services, explore, category
pages with sub-categories, search with recents, filters & sorting, service details (includes,
excludes, reviews, provider), professional profiles, favourites, single-provider cart with
replace-cart prompt, server-side quote, promo codes, scheduling with live slot availability,
address book with geolocation, checkout (card/UPI/netbanking/wallet/cash per admin config),
payment processing & failure states, booking success, bookings tabs, live status timeline,
start code, cancel with reason & refund, reschedule, pay-after-service, rate & review,
printable invoice, wallet top-up and history, refer & earn, chat, notifications,
help centre/FAQ and support tickets, profile, password, settings, delete account.

**Provider** — dashboard (today, requests, earnings), accept/reject requests, job workflow
(on the way → start with customer code → complete, collect cash), services CRUD with
activation, availability (hours, breaks, days off, blocked dates), reviews & replies,
earnings with payout requests, business profile, KYC documents, own promo codes, chat,
support.

**Delivery partner** — online/offline toggle, available pickup tasks, accept/reject,
pickup and OTP-verified delivery, maps/call shortcuts, history, earnings & payouts,
vehicle details.

**Admin** — KPI dashboard with revenue chart, status mix, top categories/providers;
bookings with filters, sortable table and CSV export; provider and partner approval,
suspension and commission; users; payouts; categories; promo codes; banners; review
moderation; support desk; platform settings (fees, tax, payment methods, maintenance
mode); cities; broadcast notifications; reports with CSV export.

### Web improvements over the app

Desktop layouts with persistent sidebars and wide tables, URL-addressable state (tabs,
filters, search query, sort) so pages can be bookmarked and shared, full keyboard navigation, printable invoices, CSV exports, SEO metadata per page with
canonical URLs, Open Graph and JSON-LD, sitemap/robots, installable web manifest, offline
banner, route progress bar and chunk-load recovery.

## Quality

* **Performance** — every route is lazy-loaded; vendor code is split (react, router, query,
  forms, ui, mock-api). Initial JS ≈ 190 KB gzipped; fonts self-hosted; images lazy-loaded
  with explicit sizes; inline boot splash avoids a blank screen.
* **Accessibility** — semantic landmarks, skip link, labelled controls, focus-trapped modals
  with Escape, visible focus rings, `aria-live` toasts, respects `prefers-reduced-motion`,
  colour contrast checked on the token palette.
* **States** — every data view has skeleton loading, empty and retryable error states.

### End-to-end tests

```bash
npx playwright install chromium     # once
npm run e2e
```

The suite builds the app, starts `vite preview`, then runs on desktop and Pixel 7 viewports:
the full guest → sign-in → schedule → checkout → track booking flow, cancellation, the
provider job lifecycle with start code, delivery with OTP, admin approvals and payouts, form
validation and role guards, and a crawl of **every route** for every role checking for
runtime errors, failed data loads and horizontal overflow. To use an existing Chromium,
set `CHROME_PATH=/path/to/chromium`.

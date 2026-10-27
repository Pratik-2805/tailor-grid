# Raffu — On-Demand Clothing Alterations Platform

> **Own your fit.** Raffu connects customers who need clothing alterations with verified local tailoring studios. Customers book online with upfront pricing; nearby partner studios receive the request in real time, accept it, and the customer drops the garment off at the studio for an in-person fitting.

This repository is a monorepo containing the customer website, the studio partner app, the admin console, the marketing site, and the shared backend API.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start (Local Development)](#quick-start-local-development)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Database](#database)
9. [Core Feature: Booking & Order Dispatch](#core-feature-booking--order-dispatch)
10. [Authentication](#authentication)
11. [Notifications (Push, Email, SMS)](#notifications-push-email-sms)
12. [API Reference](#api-reference)
13. [Applications](#applications)
14. [Testing & Load Testing](#testing--load-testing)
15. [Deployment](#deployment)
16. [Security](#security)
17. [Troubleshooting](#troubleshooting)
18. [Contributing](#contributing)
19. [License](#license)

---

## Architecture

```
                 ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
                 │  Customer site    │   │  Studio app       │   │  Admin console    │
                 │  frontend/ :3000  │   │  studio/ :3001    │   │  admin/ :3002     │
                 └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
                           │      HTTPS / JSON (cookies + Bearer JWT)      │
                           └───────────────────────┼───────────────────────┘
                                                   ▼
                                     ┌───────────────────────────┐
                                     │  Backend API (Express 5)  │
                                     │  backend/ :5000  /api/*   │
                                     └──┬──────────┬──────────┬──┘
                                        │          │          │
                         ┌──────────────▼──┐  ┌────▼─────┐  ┌─▼─────────────────────────┐
                         │ PostgreSQL       │  │ Google   │  │ Resend (email)            │
                         │ (Prisma ORM)     │  │ Routes   │  │ AWS SNS (SMS OTP)         │
                         │ incl. dispatch   │  │ API      │  │ Web Push (VAPID)          │
                         │ sessions         │  └──────────┘  └───────────────────────────┘
                         └──────────────────┘

                 raffulabs/ — standalone marketing site (no backend dependency)
```

- All three product apps talk to a single backend over `/api`.
- The backend is **stateless**: live dispatch searches are stored in PostgreSQL, so the API can be restarted or horizontally scaled without losing in-flight bookings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend apps | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4 |
| UI / motion | lucide-react, motion / framer-motion, lottie, react-toastify |
| Maps | Google Maps JavaScript API (`@googlemaps/js-api-loader`) |
| Backend | Node.js, Express 5, helmet, cors, express-rate-limit |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT (access + refresh), Google OAuth, phone/email OTP |
| Routing | Google Routes API (`computeRouteMatrix`) for road distance |
| Email | Resend |
| SMS | AWS SNS |
| Push | Web Push (`web-push`, VAPID) + service worker |
| Load testing | k6 |

---

## Repository Structure

```
tailor-grid/
├── frontend/          # Customer website (raffu.com) — browse, book, track orders
│   ├── app/           # Routes: /, /book, /orders, /order/[slug_id], /profile, /about, ...
│   ├── components/    # Views, map (CleanGoogleMap), modals, header/footer
│   └── lib/           # API client, auth cookies, geocode cache, route constants
├── studio/            # Studio partner app — incoming requests, orders, catalog, earnings
│   └── app/(workbench)/  # dashboard, orders, catalog, earnings, payouts, profile, settings
├── admin/             # Internal admin console — customers, studios, orders, inquiries
├── backend/           # REST API
│   ├── server.js      # Express app, security middleware, route mounting
│   ├── routes/        # auth, orders, admin, services, push, newsletter, contact
│   ├── services/      # dispatch, routing (road distance), locate (nearby), push
│   ├── lib/           # prisma client, auth middleware, email, sms, password hashing
│   ├── prisma/        # schema.prisma, migrations/, seed.js
│   └── scripts/       # admin creation, seeding and data clean-up utilities
├── raffulabs/         # Standalone marketing / company site
├── loadtest.js        # k6 load test for the public site + API
└── studio_concurrency_test.js  # k6 race test for simultaneous studio accepts
```

---

## Prerequisites

- **Node.js 20.19+** (Next.js 16 and Prisma 7 requirement; developed on Node 26)
- **npm** 10+
- **PostgreSQL** 14+
- A **Google Cloud** project with:
  - Maps JavaScript API + Places API + Geocoding API (browser key, frontend apps)
  - Routes API (server key, backend — optional but recommended)
  - OAuth 2.0 client (Google sign-in)
- Optional: **Resend** account (email), **AWS** account with SNS (SMS), **k6** (load tests)

---

## Quick Start (Local Development)

```bash
# 1. Clone
git clone <repo-url> tailor-grid
cd tailor-grid

# 2. Backend
cd backend
cp .env.example .env            # then fill in values (see below)
npm install                     # also runs `prisma generate`
npx prisma migrate deploy       # create / update all tables
npm run seed                    # optional: sample categories & services
npm run admin:create -- admin@example.com 'StrongPassword!'   # optional: first admin
npm run dev                     # http://localhost:5000

# 3. Customer website (new terminal)
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3000

# 4. Studio app (new terminal)
cd ../studio
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3001

# 5. Admin console (new terminal)
cd ../admin
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3002

# 6. Marketing site (optional)
cd ../raffulabs
npm install
npx next dev -p 3003            # default port 3000 clashes with frontend/
```

Health check: `GET http://localhost:5000/api/services` should return the service catalog.

---

## Environment Variables

Never commit real `.env` files — they are git-ignored. Each app ships an `.env.example`.

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | | API port (default `5000`) |
| `NODE_ENV` | | `development` or `production` (tightens rate limits, cookie flags) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `FRONTEND_URL` | ✅ | Customer site origin (CORS, email links) |
| `STUDIO_URL` | ✅ | Studio app origin |
| `ADMIN_URL` | ✅ | Admin console origin |
| `ALLOWED_ORIGINS` | | Extra comma-separated CORS origins |
| `COOKIE_DOMAIN` | prod | Shared cookie domain, e.g. `.raffu.com`; empty on localhost |
| `JWT_SECRET` | ✅ | Access-token signing secret (32+ random chars) |
| `JWT_REFRESH_SECRET` | ✅ | Refresh-token signing secret (different from above) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth credentials |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | | Same client id, used for ID-token audience checks |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | SMS | AWS SNS for phone OTP |
| `RESEND_API_KEY` | email | Resend API key |
| `DEFAULT_FROM_EMAIL` | email | Sender, e.g. `Raffu <no-reply@raffu.com>` |
| `SUPPORT_EMAIL` | | Recipient for contact-form inquiries |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | push | Web Push keys (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | | Push contact, default `mailto:support@raffu.com` |
| `GOOGLE_ROUTES_API_KEY` | recommended | Server-only key with **Routes API** enabled. Without it, dispatch uses straight-line distance |
| `ROUTES_TRAVEL_MODE` | | `DRIVE` (default), `TWO_WHEELER`, `WALK`, `BICYCLE` |

### Customer site (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL incl. `/api`, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_STUDIO_URL` | Studio app URL (studio users are redirected there) |
| `NEXT_PUBLIC_CUSTOMER_SITE_URL` | This site's public URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser Maps key (restrict by HTTP referrer) |
| `NEXT_PUBLIC_DEFAULT_CITY`, `NEXT_PUBLIC_DEFAULT_LAT`, `NEXT_PUBLIC_DEFAULT_LNG` | Optional map fallback when location is unavailable |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Optional search-console verification |

### Studio app (`studio/.env.local`) and Admin (`admin/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL incl. `/api` |
| `NEXT_PUBLIC_STUDIO_URL` | Studio app URL |
| `NEXT_PUBLIC_CUSTOMER_SITE_URL` | Customer site URL |
| `NEXT_PUBLIC_ADMIN_URL` | Admin URL (studio app only) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser Maps key |

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start API with file watching |
| `npm start` | Start API (production) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Create & apply a new migration (development) |
| `npx prisma migrate deploy` | Apply pending migrations (CI / production) |
| `npm run prisma:push` | Push schema without a migration (prototyping only) |
| `npm run prisma:studio` | Open Prisma Studio DB browser |
| `npm run seed` | Seed categories / services |
| `npm run admin:create -- <email> <password>` | Create a super-admin account |
| `node scripts/seed-maharashtra-studios.js` | Seed sample partner studios |
| `node scripts/clean-dummy-data.js`, `node scripts/clean-test-studios.js` | Remove test data |

### Frontend apps (`frontend/`, `studio/`, `admin/`, `raffulabs/`)

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

---

## Database

Schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma). Migrations live in `backend/prisma/migrations/` and **must be applied** (`npx prisma migrate deploy`) before starting the API.

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Customers, studio owners and admins (`role`: `CUSTOMER`, `TEMP_STUDIO`, `STUDIO`, `ADMIN`) |
| `OtpVerification` | | Phone / email one-time codes |
| `GarmentCategory`, `AlterationService` | | Platform service catalog |
| `PartnerStore` | `partner_stores` | Tailoring studios incl. coordinates (`lat`, `lng`) |
| `StudioCatalogItem` | `studio_catalog_items` | Per-studio services, prices and on/off toggles |
| `Order` | | Confirmed and scheduled orders (`status`: `Allocated` → `Accepted` → … → `Collected` / `Closed`) |
| `DispatchSession` | `dispatch_sessions` | Live dispatch searches (see below) |
| `PushSubscription` | `push_subscriptions` | Web Push endpoints per studio / customer |
| `NewsletterSubscription` | | Newsletter sign-ups |
| `ContactInquiry` | `contact_inquiries` | Contact-form submissions |

---

## Core Feature: Booking & Order Dispatch

This is the heart of the platform: getting a customer's request to the **nearest available studio by road**, fast, with exactly one studio winning the order.

### 1. Customer books (`/book`)

1. **Location** — GPS, saved address, or search. On phones / portrait tablets, the customer picks the spot on a full-screen map (centre pin, search, pinch-zoom anchored on the pin) and taps **Confirm location**, then fills in address details in a full-height sheet (draggable to reveal the map). On landscape tablets / desktop, the address card sits beside the map. **No studio lookups happen until the location is confirmed.**
2. **Request** — category, service, quantity, optional photos and notes → **Book now**.
3. The page calls `POST /api/orders/dispatch/start` and polls `GET /api/orders/:id/dispatch/status` (~350 ms) for the outcome.

> The studio markers on the customer map are a preview (straight-line 5 mi, `GET /api/tailors/nearby`). Who actually receives the request is decided independently by the dispatch engine below.

### 2. Building the candidate pool (once per order)

Implemented in `fetchEligible5MilePool` — [`backend/services/dispatch.service.js`](backend/services/dispatch.service.js):

1. **Geospatial shortlist** — bounding-box DB query, then a straight-line check ≤ 5 mi. A road route is never shorter than the straight line, so this never misses a studio that is within 5 road miles.
2. **Eligibility** — drop studios with no active priced service or that disabled the requested service.
3. **Road distance** — [`backend/services/routing.service.js`](backend/services/routing.service.js) calls Google Routes `computeRouteMatrix` for the shortlist only (batches of 100, 4 s timeout, 6 h cache keyed by ~110 m customer location + studio). Falls back to straight-line distance if no key / API error.
4. **Filter & sort** — keep studios ≤ **5 road miles**, nearest first. Empty pool → `ZERO_TAILORS`.

### 3. Progressive stages

| Stage | Window | Studios that see the request |
|---|---|---|
| 1 | 0–15 s | ≤ 1 road mile |
| 2 | 15–30 s | ≤ 3 road miles |
| 3 | 30–45 s | ≤ 5 road miles |

- Stages are cumulative; a hard cap ends the search at **45 s**.
- A studio that **skips** never sees that order again. If everyone in the current stage skips, the next stage starts immediately; if the whole pool skips, the search ends as `EXHAUSTED`.
- Config: `STAGE_CONFIG` and `HARD_TIMEOUT_SEC` in `dispatch.service.js`.

### 4. How studios receive it

- **Web Push** to every candidate when a stage activates (e.g. *"Hem · 1.4 mi · 4 min away · 15s to accept"*).
- **Studio app** polls `GET /api/orders/dispatch/pending`; a request is returned only while the search is live, the studio is a current-stage candidate, hasn't skipped, and still has the service enabled.

### 5. Accept — exactly one winner

1. The accept atomically claims the session (`SEARCHING → ACCEPTING`); only one claim can succeed, even across servers.
2. The confirmed `Order` is created (price / payout from the studio's catalog), the session becomes `ASSIGNED`, the customer gets a push notification and a PIN email.
3. Later accepts get `ORDER_ALREADY_ASSIGNED`; accepts after the search ended get `REQUEST_EXPIRED`.

### 6. Outcomes shown to the customer

| Session status | Customer UI |
|---|---|
| `ASSIGNED` | Redirect to order tracking |
| `ZERO_TAILORS` | **No Tailors Available Right Now** |
| `EXHAUSTED` | **All Our Tailors Are Busy** |

Both "no tailor" screens offer **Try Again** (`POST /:id/dispatch/retry`), **Schedule for Later** (`POST /:id/dispatch/schedule`, saves an `Allocated` order) and **Modify request details**. Cancelling (`POST /:id/dispatch/cancel`) deletes the session.

### 7. Reliability & scaling

- Sessions are rows in `dispatch_sessions` — **restarts don't lose searches**, and **multiple API instances** can run behind a load balancer.
- No in-process timers: each instance runs a 1 s sweeper and every read lazily applies due stage changes.
- Every write is guarded by a `version` column (optimistic concurrency), so concurrent instances apply each transition — and send each push — exactly once.
- A claim left by a crashed instance is released after 30 s. Finished sessions are purged after 10 min.

---

## Authentication

- **Methods:** email + password, Google OAuth, phone OTP (AWS SNS), email OTP (Resend).
- **Tokens:** short-lived **access token** (15 min, cookie `tg_token` + `Authorization: Bearer`) and **refresh token** (15 days, httpOnly cookie). Clients refresh silently via `POST /api/auth/refresh`.
- **Roles:** `CUSTOMER` → customer site; `STUDIO` / `TEMP_STUDIO` → redirected to the studio app; `ADMIN` → admin console only (blocked on the storefront).
- Cross-app hand-off uses a single-use OAuth code exchange (`/api/auth/oauth/code` → `/api/auth/oauth/exchange`, 60 s TTL).

---

## Notifications (Push, Email, SMS)

| Channel | Used for | Setup |
|---|---|---|
| Web Push | Incoming dispatch (studios), order accepted (customers) | `VAPID_*` env vars; clients subscribe via `/api/push/subscribe` |
| Email (Resend) | OTP, order PIN, welcome, contact inquiries | `RESEND_API_KEY`, `DEFAULT_FROM_EMAIL` |
| SMS (AWS SNS) | Phone OTP | `AWS_*` env vars |

Generate VAPID keys once and keep them stable (rotating them invalidates existing subscriptions):

```bash
npx web-push generate-vapid-keys
```

---

## API Reference

Base URL: `{API_HOST}/api`. JSON in / JSON out. Protected routes need the access token.

<details>
<summary><strong>Auth</strong> — <code>/api/auth</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/send-otp`, `/send-email-otp` | Send phone / email OTP |
| POST | `/verify-otp`, `/verify-phone-otp`, `/verify-email-otp` | Verify OTP |
| POST | `/signup`, `/login` | Email account sign-up / login |
| POST | `/google` | Google sign-in |
| POST | `/link-phone` | Attach a verified phone to the account |
| GET | `/check-email`, `/check-phone` | Account existence checks |
| GET | `/me` | Current user |
| POST | `/update-profile` | Update profile |
| POST | `/refresh`, `/logout` | Token refresh / sign out |
| POST | `/oauth/code`, `/oauth/exchange` | Cross-app session hand-off |
| POST | `/send-welcome-email` | Welcome email |
</details>

<details>
<summary><strong>Orders & Dispatch</strong> — <code>/api/orders</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/dispatch/start` | Start a dispatch search for a new booking |
| GET | `/:id/dispatch/status` | Live search status (customer) |
| POST | `/:id/dispatch/cancel` | Cancel the search |
| POST | `/:id/dispatch/retry` | Restart the search |
| POST | `/:id/dispatch/schedule` | Schedule for later |
| GET | `/dispatch/pending` | Pending requests for the signed-in studio |
| POST | `/:id/dispatch/respond` | Studio accept / skip |
| GET | `/`, `/:id` | List / get orders |
| POST | `/` | Create order |
| PUT | `/:id` | Update order (status progression) |
| DELETE | `/:id` | Delete order |
| GET | `/studio/stats` | Studio dashboard stats |
| POST | `/:id/send-otp-email` | Re-send order PIN |
| POST | `/lookup-by-pin`, `/:id/verify-pin` | Drop-off PIN verification at the studio |
</details>

<details>
<summary><strong>Catalog, Studios & Location</strong> — <code>/api</code></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/services` | Platform categories and services |
| GET / POST | `/stores` | List / register partner studios |
| GET | `/tailors/nearby`, `/locate/tailors` | Studios within a radius (`lat`, `lng`, `radiusMiles` ≤ 50) |
| GET / POST | `/studio/catalog` | Studio's own price catalog |
| POST / DELETE | `/studio/catalog/item`, `/studio/catalog/item/:id` | Add / remove a catalog item |
</details>

<details>
<summary><strong>Push, Newsletter, Contact, Admin</strong></summary>

| Method | Path | Description |
|---|---|---|
| GET | `/api/push/vapid-key` | Public VAPID key |
| POST | `/api/push/subscribe`, `/api/push/unsubscribe`, `/api/push/test` | Manage / test push |
| POST | `/api/newsletter/subscribe`, `/unsubscribe` | Newsletter |
| GET | `/api/newsletter/subscribers` | Subscriber list (admin) |
| POST | `/api/contact` | Contact form |
| POST | `/api/admin/login` · GET `/api/admin/me`, `/overview`, `/search` | Admin session & dashboard |
| GET/POST/PUT | `/api/admin/customers[/:id]`, `/studios[/:id]`, `/orders[/:id]` | Admin management |
| GET/PUT/DELETE | `/api/admin/inquiries[/:id]` | Contact inquiries |
</details>

**Rate limits:** `/api/*` 600 requests / 15 min per IP; OTP, login and newsletter endpoints 20 requests / 10 min (production values; loopback is exempt in development).

---

## Applications

### Customer site — `frontend/`
Public pages (home, how it works, about, for partners, contact, privacy, terms) and the signed-in customer area: **book** (map + dispatch), **orders**, **order tracking** (`/order/[slug_id]`), **profile** (saved addresses). Fully responsive, with mobile-specific map interactions.

### Studio app — `studio/`
Onboarding plus a workbench: **dashboard** (incoming dispatch requests with countdown, accept / skip), **orders**, **catalog** (prices and service toggles that drive dispatch eligibility), **earnings**, **payouts**, **profile**, **settings**.

### Admin console — `admin/`
Overview metrics, customer and studio management, order oversight, and contact-inquiry handling.

### Marketing site — `raffulabs/`
Independent Next.js site; no backend required.

---

## Testing & Load Testing

Load tests use [k6](https://k6.io/):

```bash
# Public site + API load profile
k6 run -e BASE_URL=http://localhost:3000 -e API_URL=http://localhost:5000/api loadtest.js

# Race test: many studios accepting the same request concurrently
k6 run -e BASE_URL=http://localhost:5000 studio_concurrency_test.js
```

Before releasing changes to dispatch, verify:
- A search survives an API restart mid-flight.
- With 2+ API instances, simultaneous accepts produce exactly one order.
- Stage pushes are delivered once per studio per stage.

---

## Deployment

1. **Database** — provision PostgreSQL and run `npx prisma migrate deploy` as part of every release, **before** starting the new API version.
2. **Backend** — `npm ci && npm start` behind HTTPS. Set `NODE_ENV=production`, `COOKIE_DOMAIN`, all URLs and secrets. Multiple instances are supported (dispatch state is in the DB).
3. **Frontend apps** — `npm ci && npm run build && npm start` (or deploy to Vercel). Set `NEXT_PUBLIC_*` variables at build time.
4. **Domains** — typical layout: `raffu.com` (customer), studio and admin on subdomains, API at `backend.raffu.com`. `www.raffu.com` and `raffu.in` permanently redirect to `raffu.com`.
5. **Google keys** — browser Maps key restricted by HTTP referrer; Routes key restricted by server IP and API.

---

## Security

- `helmet` security headers, strict CORS allow-list, per-IP rate limiting.
- JWT access tokens are short-lived; refresh tokens are httpOnly cookies.
- Passwords are hashed (`backend/lib/password.js`).
- Never commit `.env` files or API keys; never reuse the public Maps key on the server.
- Report vulnerabilities privately to the maintainers rather than via public issues.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module 'web-push'` on API start | Run `npm install` in `backend/` |
| Dispatch fails with *table `dispatch_sessions` does not exist* | Run `npx prisma migrate deploy` in `backend/` |
| Log: `GOOGLE_ROUTES_API_KEY not set` | Expected without a key — dispatch uses straight-line distance |
| Customer map shows empty ocean / "Set location" | Allow browser location, or set `NEXT_PUBLIC_DEFAULT_CITY/LAT/LNG` |
| Map grey / not loading | Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and its referrer restrictions |
| Stuck on "LOADING" screen | API unreachable — check the backend is running and `NEXT_PUBLIC_API_URL` (loader gives up after 8 s) |
| "Another next dev server is already running" | Stop the other instance or use a different port (`-p`) |
| Push notifications never arrive | Set `VAPID_*` keys; the browser must grant notification permission over HTTPS (or localhost) |
| CORS errors | Add the origin to `FRONTEND_URL` / `STUDIO_URL` / `ADMIN_URL` / `ALLOWED_ORIGINS` |

---

## Contributing

1. Branch from `main` (`feat/…`, `fix/…`).
2. Keep changes scoped to one app where possible; schema changes require a Prisma migration (`npm run prisma:migrate`) committed with the code.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:` …).
4. Verify the affected app builds (`npm run build`) and test on mobile and desktop widths for UI changes.
5. Open a pull request describing what changed and how it was tested.

---

## License

Proprietary. © Raffu Labs Ltd. All rights reserved.

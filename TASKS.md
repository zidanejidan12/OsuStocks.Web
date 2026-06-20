# OsuStocks.Web — Tasks

Single source of truth for project work (see [CLAUDE.md](CLAUDE.md) for the
workflow). Tasks flow: **Backlog → To Do → In Progress → Done (Archived)**.

## In Progress

_Empty — nothing in flight._

## To Do

- [ ] Add `quantity` to the trade response (`POST /trading/buy|sell` → `TradeResult`) on the backend, then render `result.quantity` in the trade receipt instead of the client-side snapshot in `StockDetail.tsx` (also guards against server-side rounding / partial fills). Verified 2026-06-20 still missing: `BuyStockResponse`/`SellStockResponse` expose only `TradeId`/`UnitPrice`/`TotalAmount`. Frontend snapshots the submitted quantity as a stopgap.
- [ ] **Backend: sync osu! profile cover/banner.** The frontend now renders `StockSummary.bannerUrl` (optional) on the stock-detail header with a gradient fallback, but the API doesn't supply it yet — and unlike the avatar it can't be derived from the user id. Mirror the avatarUrl/countryCode path: map osu! `cover.url` in `OsuApiClient` → `banner_url` column on `tracked_players` (migration) → `PlayerSynchronizationService` → market read models/DTOs (`MarketStockDetailsReadModel`, `GetMarketStockDetailsResponse`, list + top-mover models) → `MarketEndpoints`.
- [ ] Full legal review of Terms/Privacy by a qualified person — optional contact-email + governing-law clause are now env-wired, and the Privacy Policy was corrected to disclose the optional PostHog analytics.
- [ ] Replace `public/osu-coin.svg` with real (licensed) osu! coin artwork — the current SVG is a refined placeholder.
- [ ] Run the Playwright e2e smoke once browsers are available (`npx playwright install` → `npm run test:e2e`); wire it into CI.

## Backlog

- [ ] Surface backend-ahead features the frontend doesn't use yet (confirmed present in `OsuStocks.API`, 2026-06-20): daily-login reward (`GET /daily-login`, `POST /daily-login/claim`), the profit & most-active-trader leaderboards (`/leaderboards/profit`, `/leaderboards/traders` — only `/wealth` is wired), and the investor level returned inline on `/auth/me` (the `InvestorLevel` type exists but isn't surfaced).

## Done (Archived)

_Newest first._

- [x] 2026-06-21 -- Removed the dead "I have a token" hero CTA (`app/page.tsx`) — it pointed at `/login`, but the JWT-paste sign-in path was already removed (osu! OAuth only), so it was dev-only and unused. Hero now has a single "Get started" CTA. Verified: `tsc --noEmit` clean, confirmed gone in preview.
- [x] 2026-06-21 -- Sponsor credit "Sponsored by Raids" surfaced beyond the footer. Extracted a reusable `SponsorCredit` component (single source of truth: osu! profile link `/users/15640966` + osu!-CDN avatar + pink hover + `↗`, aria-labelled) and wired it into four surfaces: (1) footer bottom bar; (2) landing hero, under the "Get started" CTA (larger `sm` avatar); (3) live market ticker as a pinned, non-scrolling slug after the "Live" pill (hidden `<sm` so the marquee keeps room; only when the ticker is active); (4) topbar — full phrase for guests (`lg+`, room to spare) and a compact `Raids ↗` chip for signed-in users at `xl+` only, to avoid crowding the 7-link nav. Verified: `tsc --noEmit` clean; no new lint errors (8 pre-existing remain in unrelated files); confirmed topbar + hero + footer render and the avatar loads (a.ppy.sh) in preview at desktop (1320) and mobile (375). Not verified live: signed-in topbar chip (no backend/login in preview — placement reasoned from the lg→xl container slack) and the ticker slug (needs movers data).
- [x] 2026-06-20 -- Trade-panel buy sizing + osu! profile banners + About page (verified: lint, `next build` typecheck, `npm test` 10/10; About page + footer confirmed in preview — trade panel not exercised live, no local backend):
  - **Buy sizing (`StockDetail.tsx`):** the trade panel loads wallet balance + outstanding supply and shows a live est. cost, quick `25% / 50% / Max` presets, and a concrete clickable "you can buy up to N shares" — the min of balance affordability and the 25% per-trader cap (`supply = marketCap/price`, solving `(owned+q)/(supply+q) ≤ 0.25`). Buy disables when the estimate exceeds balance; a 0.5% slippage margin keeps Max from tripping `INSUFFICIENT_BALANCE` on the bonding curve.
  - **Quantity stepper:** replaced the native number-input spin arrows (suppressed via a `.no-spinner` utility) with a styled −/+ stepper matching the design system.
  - **Profile banners:** `StockSummary.bannerUrl` wired optional and rendered on the stock-detail cover via a new `ProfileCover` (real osu! `cover.url` when present, osu! gradient fallback + graceful 404 recovery). Lights up once the backend syncs covers (tracked in To Do).
  - **About page:** new `/about` with a project overview + the dev-team credit; removed the Development Team block from the sitewide footer and linked `/about` from the footer Game nav.
  - **Login:** removed the development-only "paste a JWT" sign-in path from `/login` — osu! OAuth is the only sign-in now.
- [x] 2026-06-20 -- Frontend critique fixes (verified: lint, `next build`, `npm test`, mobile/desktop preview):
  - **Mobile nav:** added a `lg:hidden` hamburger + slide-in drawer exposing all destinations (+ notifications/admin/profile, login/logout) in both auth states, with Escape/scroll-lock/aria — fixes the 5 unreachable destinations below 1024px. Logout now has an `aria-label`.
  - **Trade feedback:** receipt quantity is now snapshotted at execution time (no longer live-bound to the input); after a successful trade the header price/volume, chart, and analytics silently refresh, and the user's holding reloads. Sell is validated against shares owned (with a "sell max" affordance) and disabled at zero.
  - **Fractional shares:** new `formatShares` helper used for all quantities (receipt, trades, portfolio) so 0.5/1.25 shares no longer round to whole numbers.
  - **PriceChange:** added a `percent` mode (no coin, `%` suffix) for top-play impact; Trending Most Bought/Most Sold now render trade **counts**, not coin amounts; direction exposed to assistive tech.
  - **Resilience:** graceful `?? []` guards in `getTrending` (per-bucket), `getMarketEvents`/`getStockEvents`, `getLeaderboard`, `getTrackedPlayers`; notification type cast falls back to `System`.
  - **State/UX:** home clears `unauthorized` on refetch; activity poll race guarded by a request-sequence id + timestamp now visible on mobile; notifications mark-read failures surface a toast, `markAllRead` uses a functional snapshot, and polling pauses on hidden tabs / debounces focus; admin "Remove player" now has an inline confirm, maintenance/active toggles got switch/`aria-pressed` semantics.
  - **Responsive/perf/a11y:** portfolio (6→4 cols) and trades (hide Unit) tables collapse on phones; chart controls and pagination enlarged for touch; `MotionConfig reducedMotion="user"` honors OS reduce-motion; danger toasts announce assertively; `optimizePackageImports` for `@phosphor-icons/react`.
- [x] 2026-06-08 -- Tests: Vitest unit suite for `lib/format` + `lib/api` client (10 passing via `npm test`); Playwright e2e smoke scaffold (`npm run test:e2e`). `tests/` excluded from the Next typecheck.
- [x] 2026-06-08 -- Admin UI (`/admin`, admin-gated): market settings (trading toggle, cooldown, position limit) + tracked-player management (add / pause / remove) with optimistic updates + toasts.
- [x] 2026-06-08 -- Stock detail: OHLC candlestick chart with candle/line toggle + 1h/24h/7d/30d range selector (replaces the sparkline), plus an analytics panel (market cap, 24h/7d volume, 7d volatility, holders, active traders).
- [x] 2026-06-08 -- Trade UX polish: sitewide toast system (`ToastProvider`/`useToast`), per-stock 30s trade-cooldown countdown, and a position-limit hint on the trade panel.
- [x] 2026-06-08 -- Product analytics events through the seam: login funnel (`login_started`/`login_completed`), `stock_viewed`, `trade_executed`, `trade_rejected` (with reason), `portfolio_viewed`, `wallet_viewed`.
- [x] 2026-06-08 -- Market activity feed (`/activity`): live-refreshing price/trade event stream with Load more.
- [x] 2026-06-08 -- Notifications (`/notifications`): nav bell with unread badge, polling context, mark-read / mark-all-read (optimistic).
- [x] 2026-06-08 -- Trending (`/trending`): most bought / most sold / fastest rising / fastest falling / highest volume buckets.
- [x] 2026-06-08 -- Leaderboard (`/leaderboard`): portfolio-value ranking with podium chips + "you" highlight, paginated.
- [x] 2026-06-08 -- Trade history page (`/trades`): paginated buy/sell ledger (`GET /trading/history`).
- [x] 2026-06-08 -- API client + types for all of the above (frontend-ahead, flagged in `types.ts`); Nav extended with Trending/Leaderboard links, notifications bell, and an admin gear.
- [x] 2026-06-08 -- Generated favicon + Apple touch icon (`app/icon.tsx`, `app/apple-icon.tsx`); refined the `osu-coin.svg` placeholder.
- [x] 2026-06-08 -- Legal: env-wired optional contact email + governing-law clause (Terms/Privacy); corrected the Privacy Policy to disclose the optional PostHog analytics; hardened `/auth/callback` `returnTo` against open redirects.
- [x] 2026-06-08 -- ESLint: allow `require()` in CommonJS `*.config.js` (PM2 `ecosystem.config.js`) so `npm run lint` is fully green.
- [x] 2026-06-08 -- Analytics: wired PostHog (the only supported vendor) into the `lib/analytics` seam, and made it fully optional — off unless `NEXT_PUBLIC_POSTHOG_KEY` is set, in which case the vendor is lazy-loaded (separate chunk, never shipped when disabled) and initialized from `src/instrumentation-client.ts`, capturing the initial pageview + every SPA navigation (`capture_pageview: 'history_change'`). `identify`/`track`/`reset` forward to PostHog and buffer until load; call sites (`AuthProvider`) unchanged. Documented optional `NEXT_PUBLIC_POSTHOG_KEY`/`_HOST` in `.env(.example)` + README.
- [x] 2026-06-08 -- API dependencies delivered by the backend (contract dated 2026-06-07): /auth/me now returns avatarUrl + countryCode, and the stock DTOs now return countryCode. Wired Me.avatarUrl and StockSummary.countryCode into the frontend API types.
- [x] 2026-06-08 -- Fixed top-mover card: the contract returns topGainer/topLoser as an empty object {} (not null) when there are no movers; the guard now treats a stockId-less mover as empty instead of rendering a broken card / Link to /stocks/undefined.
- [x] 2026-06-07 — Fixed all `react-hooks/set-state-in-effect` lint errors across the client pages (market home, stock detail, portfolio, wallet): scoped overrides on the intentional fetch-skeleton resets, folded the page-reset state-sync effect into the query handlers, and removed an unused `useMemo` import
- [x] 2026-06-07 — Player avatars (frontend): `<Avatar>` primitive (osu! image + tinted initial fallback) wired into the market list, stock detail, top-mover cards, portfolio holdings, and the hero ticker; `avatarUrl` added (optional) to stock/holding/trade types so it renders as soon as the API supplies it
- [x] 2026-06-07 — Added Terms of Use + Privacy Policy pages and a sitewide footer (virtual-currency / not-affiliated / not-gambling disclaimers)
- [x] 2026-06-07 — Replaced the "$" symbol with an osu! coin glyph (placeholder `osu-coin.svg` + `<Coin>`/`<Money>` components; baked into `PriceChange`)
- [x] 2026-06-07 — Premium UI redesign (taste-skill): Framer Motion + Phosphor icons, design-system primitives, asymmetric layouts, mono numerics, skeleton/empty/error states across every page
- [x] 2026-06-07 — OpenGraph + Twitter card support with a generated OG image (`opengraph-image.tsx`)
- [x] 2026-06-07 — Removed stock Next.js icons (SVGs + favicon)
- [x] 2026-06-07 — Single-source web port via `.env` + `scripts/run-next.mjs` launcher (PM2 & Compose read it too)
- [x] 2026-06-07 — Docker support: multi-stage `Dockerfile`, `docker-compose.yml`, prune scripts, `.dockerignore`
- [x] 2026-06-07 — PM2 scripts + `ecosystem.config.js`
- [x] 2026-06-07 — App shell: nav, root layout, shared UI components, dark theme
- [x] 2026-06-07 — Pages: market home, stock detail (sparkline + buy/sell), portfolio, wallet
- [x] 2026-06-07 — Auth: token storage, `AuthProvider`/`useAuth`, osu! login + OAuth callback, dev token paste
- [x] 2026-06-07 — API client, types, and formatters (`src/lib/api`, `src/lib/format`)
- [x] 2026-06-07 — Scaffolded Next.js 16 + React 19 + TypeScript + Tailwind v4

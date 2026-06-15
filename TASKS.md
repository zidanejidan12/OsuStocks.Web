# OsuStocks.Web — Tasks

Single source of truth for project work (see [CLAUDE.md](CLAUDE.md) for the
workflow). Tasks flow: **Backlog → To Do → In Progress → Done (Archived)**.

## In Progress

_Empty — nothing in flight._

## To Do

- [ ] Reconcile the frontend-ahead API contracts (trending, market events, notifications, leaderboard, stock analytics, OHLC history, admin) with the real backend DTOs once the endpoints land — see the contracts note in `src/lib/api/types.ts`.
- [ ] Confirm the OAuth callback token hand-off against the live API (the exact token param name/shape) — `/auth/callback` now also hardens `returnTo` against open redirects.
- [ ] Full legal review of Terms/Privacy by a qualified person — optional contact-email + governing-law clause are now env-wired, and the Privacy Policy was corrected to disclose the optional PostHog analytics.
- [ ] Replace `public/osu-coin.svg` with real (licensed) osu! coin artwork — the current SVG is a refined placeholder.
- [ ] Run the Playwright e2e smoke once browsers are available (`npx playwright install` → `npm run test:e2e`); wire it into CI.

## Backlog

_Empty — everything's queued in To Do._

## Done (Archived)

_Newest first._

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

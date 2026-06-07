# OsuStocks.Web — Tasks

Single source of truth for project work (see [CLAUDE.md](CLAUDE.md) for the
workflow). Tasks flow: **Backlog → To Do → In Progress → Done (Archived)**.

## In Progress

- [ ] Analytics — added a vendor-agnostic `lib/analytics` seam (`identify`/`track`/`reset`, no-op until a vendor is chosen) wired into `AuthProvider`, and made `Me.countryCode` optional. **Next:** pick a vendor (PostHog vs Umami), add `instrumentation-client.ts` for init + SPA pageviews, and fill in the seam.

## To Do

_Nothing queued — pull the next item from the Backlog._

## Backlog

- [ ] API dependency: return `countryCode` (osu! ISO 3166-1 alpha-2) from `/me` — and ideally the auth callback — so geographic cohorts work. Frontend `Me.countryCode` is already optional-ready.
- [ ] API dependency: add `avatarUrl` to the public stock DTOs (stock summary, market top movers, holdings, trades) — today it's only on admin `tracked-players/search`. The BE already fetches/stores it per tracked player, so this is surfacing existing data; the frontend renders it the moment it's present.
- [ ] Once an analytics vendor is chosen, instrument product events: login funnel, `stock_viewed`, `trade_executed`, `trade_rejected` (cooldown/limit), portfolio/wallet views.
- [ ] Lint: `ecosystem.config.js` (PM2 config) trips `@typescript-eslint/no-require-imports` — add an eslint override/ignore for CommonJS config files so `npm run lint` is fully green
- [ ] Add a real favicon / app icon (the stock Next.js icons were removed)
- [ ] Replace the placeholder `public/osu-coin.svg` with the real osu! coin artwork
- [ ] Legal review of Terms/Privacy; optionally add a contact email and a governing-law jurisdiction
- [ ] Confirm the OAuth callback token hand-off against the live API and adjust `/auth/callback` if needed
- [ ] Admin UI — market settings + tracked-player management (API endpoints exist)
- [ ] Trade history page (`GET /trading/history` exists)
- [ ] Leaderboard view (API Phase 1.5)
- [ ] Tests — unit (`lib/api` client, `lib/format`) and an e2e smoke test
- [ ] UX polish — error toasts, trade-cooldown countdown, position-limit hint before confirm

## Done (Archived)

_Newest first._

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

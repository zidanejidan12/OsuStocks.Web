# Changes — `feature/tix-fix-lmaoaoao` (OsuStocks.Web)

Frontend changes for: **silent session refresh** (no more re-login every ~15 min),
a **subtle AI-assistance disclosure**, and **removing every em-dash** from the frontend.
Companion backend changes (the refresh endpoint, rate-limiting, edge hardening) live in the
sibling `OsuStocks.API` repo (see its `CHANGES.md`).

---

## 1. Auth — silent refresh + 401 auto-retry

Consumes the backend's new rotating refresh token so an expired access token renews
transparently instead of bouncing the user to the osu! login.

| File | Change |
|------|--------|
| `src/lib/auth/token.ts` | `StoredAuth` extended with optional `refreshToken` / `refreshExpiresAt`; added `getRefreshToken()` (null when absent/expired). `getAccessToken()` unchanged. |
| `src/lib/api/client.ts` | Added `refreshSession()` (POSTs `/auth/refresh`, stores the rotated tokens) with a **single-flight** guard so concurrent 401s share one refresh. `request()` now does **one** silent refresh + replay on a 401 before surfacing the error. A rejected refresh clears auth. |
| `src/lib/auth/auth-context.tsx` | On load, if the access token is missing/expired but a refresh token survives, restore the session silently. Added a **proactive timer** that refreshes ~2 min before expiry and reschedules itself while a session is active. |
| `src/app/auth/callback/page.tsx` | Reads `refreshToken` / `refreshExpiresAt` from the callback URL fragment and persists them via `setAuth`. |

The access token stays short-lived; the (rotating, single-use) refresh token carries the
long session. Tokens live in `localStorage`, consistent with the existing model.

---

## 2. Subtle AI-assistance disclosure

| File | Change |
|------|--------|
| `src/app/about/page.tsx` | Added a muted paragraph to **About → Development Team**: *"OsuStocks was conceived, designed, and directed entirely by its developers. AI coding tools only helped speed up routine, repetitive work; the concept, the content, and every creative decision are ours."* (human-led framing, no em-dashes). |

---

## 3. Em-dash removal (frontend-wide)

Removed **every em-dash (and the lone en-dash): 150 occurrences across 43 files**, rephrasing
the surrounding copy and code comments to read naturally (commas, full stops, parentheses,
"to" for ranges) rather than swapping in a hyphen. Arrows (`→`), middots (`·`), and the math
minus sign (`−`) were intentionally left untouched. Verified: a repo-wide grep for
`—`/`&mdash;`/`–`/`&ndash;` returns **nothing**.

**User-visible "no data" placeholders** (the literal `—` shown when a value is missing) were
changed to a plain hyphen `-` in:
`src/components/market/StockDetail.tsx`, `src/app/portfolio/page.tsx`, `src/app/admin/page.tsx`,
`src/components/ui/Money.tsx`, `src/components/ui/PriceChange.tsx`.

**Other user-facing copy** rephrased (em-dashes in JSX text / metadata): `src/app/about/page.tsx`,
`src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/leaderboard/page.tsx`, `src/app/privacy/page.tsx`,
`src/app/terms/page.tsx`, `src/app/trending/layout.tsx`, `src/components/Footer.tsx`,
`src/components/SponsorCredit.tsx`, `src/components/market/StockList.tsx`,
`src/components/market/LiveMarketPanel.tsx`, plus SEO metadata in `src/app/layout.tsx`,
`src/app/manifest.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`.

**Comment-only** em-dash rephrasing (no behavior change): `src/lib/api/client.ts`,
`src/lib/api/types.ts`, `src/lib/auth/auth-context.tsx`, `src/lib/auth/token.ts`, `src/lib/format.ts`,
`src/lib/legal.ts`, `src/lib/motion.ts`, `src/lib/analytics.ts`, `src/lib/notifications/notifications-context.tsx`,
`src/instrumentation-client.ts`, `src/app/auth/callback/page.tsx`, `src/app/missions/page.tsx`,
`src/app/patch-notes/page.tsx`, `src/app/stocks/[stockId]/page.tsx`, `src/app/trades/page.tsx`,
`src/app/trending/page.tsx`, `src/app/wallet/page.tsx`, `src/app/leaderboard/layout.tsx`,
`src/components/Nav.tsx`, `src/components/MarketTicker.tsx`, `src/components/MotionProvider.tsx`,
`src/components/ui/Avatar.tsx`, `src/components/ui/Coin.tsx`, and `src/app/globals.css`.

---

## 4. Tracking

| File | Change |
|------|--------|
| `TASKS.md` | Logged the four workstreams under Done (Archived), dated 2026-06-24. |

---

## Verification (this machine)
- `npx tsc --noEmit` — clean.
- `npm test` (vitest) — **10/10 pass**.
- `npm run lint` — only the **8 pre-existing** `react-hooks/refs` errors remain (documented in `TASKS.md`); no new lint errors introduced.
- Preview: `/about` and `/` render with **no console errors**; the disclosure shows in the muted style and no stray dashes appear.
- Not exercised locally: the end-to-end refresh / 401-retry flow needs a running backend with osu! credentials (the logic is covered by backend unit/integration tests).

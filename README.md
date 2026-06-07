# OsuStocks.Web

The web frontend for **OsuStocks** — an osu! "stock market" game where you trade
virtual shares tied to osu! players' performance. Browse the market, inspect a
player's price history, buy and sell shares, and track your portfolio and wallet.

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.
It is fully client-rendered: every page fetches from the API in the browser using
a JWT bearer token stored in `localStorage`.

Backend API: <https://github.com/zidanejidan12/OsuStocks.API>

## Prerequisites

- Node.js 20+
- The OsuStocks API running locally at `http://localhost:5152`

## Setup

```bash
npm install
```

### Configuration

All configuration lives in **`.env`** — the single source of truth, committed
with non-secret defaults. Put machine-specific overrides or secrets in
`.env.local` (gitignored), which takes precedence.

```
# .env
PORT=3000                                          # web app port
NEXT_PUBLIC_API_BASE_URL=http://localhost:5152     # API base; requests go to <base>/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000         # public origin; base for OpenGraph image URLs
```

**Changing the web port:** edit `PORT` in `.env`. That one value flows to
`npm run dev`, `npm start`, PM2, and Docker Compose. (Next.js can't read `PORT`
from `.env` directly — its server boots before env files load — so the small
launcher `scripts/run-next.mjs` passes it to `next dev`/`next start`; PM2 and
Compose read `.env` too.)

> If you change the port, update the API's CORS allow-list to include the new
> origin (it defaults to `http://localhost:3000`). `NEXT_PUBLIC_API_BASE_URL` is
> inlined at build time, so changing it requires a rebuild.

## Run

```bash
npm run dev
```

The app serves on <http://localhost:3000> — this origin is the one allow-listed
in the API's CORS configuration, so run it on port 3000 during development.

## Production

Create an optimized build first:

```bash
npm run build
```

### PM2

[PM2](https://pm2.keymetrics.io/) runs the production server (`next start`) with
auto-restart and log management. Configuration lives in `ecosystem.config.js`.

```bash
npm run pm2:deploy     # build, then start (or reload) under PM2
npm run pm2:logs       # tail logs
npm run pm2:status     # process status
npm run pm2:stop       # stop the app
npm run pm2:delete     # remove it from PM2
```

To use all CPU cores, set `instances: 'max'` and `exec_mode: 'cluster'` in
`ecosystem.config.js`.

### Docker

A multi-stage `Dockerfile` builds the app and serves it under `pm2-runtime`,
orchestrated by `docker-compose.yml`.

```bash
npm run docker:up      # build + start (detached), then prune leftover images
npm run docker:logs    # follow the logs
npm run docker:down    # stop and remove the container
```

The container publishes the app on <http://localhost:3000>.

### Pruning unused Docker resources

`npm run docker:up` runs `docker compose up --build -d` and then
`docker image prune -f`, which removes the now-dangling image left behind by the
rebuild. Build cache is intentionally kept so subsequent rebuilds stay fast.

To reclaim more space, prune all unused resources at once — stopped containers,
unused networks, dangling images, and build cache:

```bash
npm run docker:prune   # docker system prune -f
```

See Docker's [pruning guide](https://docs.docker.com/engine/manage-resources/pruning/)
for the full set of `prune` commands (`docker image prune -a`, `docker builder
prune`, `docker volume prune`, etc.).

> **Note:** `NEXT_PUBLIC_API_BASE_URL` is inlined into the client bundle at
> **build time**, so it is passed as a Docker build arg (default
> `http://localhost:5152`). Since API calls happen in your browser, the default
> works for a local API. To target a different API, set it before building:
>
> ```bash
> NEXT_PUBLIC_API_BASE_URL=https://api.example.com docker compose build
> ```

## Pages

- `/` — Market overview and stock list (requires login)
- `/login` — osu! login button + a development-only token-paste box
- `/auth/callback` — receives the token after OAuth and redirects back
- `/stocks/[stockId]` — stock detail, price history, and buy/sell
- `/portfolio` — your holdings and profit/loss (requires login)
- `/wallet` — your balance and transaction history (requires login)

## Authentication

Login starts a full-page redirect to the API
(`<base>/api/v1/auth/login?returnUrl=…`). After you authorize on osu!, the API
issues a JWT and sends you to `/auth/callback`, which reads `accessToken` and
`expiresAt` from the URL, stores them in `localStorage`, and redirects you back
to where you started.

Because the exact token hand-off depends on the API callback, the `/login` page
also includes a clearly labelled **development-only** token-paste box. Paste a
JWT there to use the app without completing the full OAuth flow.

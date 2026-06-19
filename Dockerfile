# syntax=docker/dockerfile:1
#
# OsuStocks.Web production image.
# Builds the Next.js 16 app and serves it under PM2 (pm2-runtime).
# The web port comes from the PORT build arg / env (default 3000), sourced from .env by Compose.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1) Install all dependencies (incl. dev) needed to build
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# 2) Build the app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time, so the
# API base URL must be provided here (not just at runtime). Override via build arg.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5152
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Server-side proxy target for the /api/v1/* rewrite. Next.js evaluates rewrites()
# at BUILD time and freezes the destination into routes-manifest.json, so this MUST
# be set here — a runtime-only env var is ignored by `next start`/pm2.
ARG API_PROXY_TARGET=http://localhost:5152
ENV API_PROXY_TARGET=$API_PROXY_TARGET
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) Slim runtime: production deps + global PM2 only
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3000
ENV PORT=$PORT
RUN npm install -g pm2
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY ecosystem.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE ${PORT}
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

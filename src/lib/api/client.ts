// HTTP layer for the OsuStocks API.

import { getAccessToken } from "@/lib/auth/token";
import type {
  AchievementsResponse,
  AdminTrade,
  AdminWalletTransaction,
  AppNotification,
  Candle,
  HealthStatus,
  HistoryRange,
  InvestorLevel,
  LeaderboardEntry,
  MarketEvent,
  MarketOverview,
  LiveMover,
  MarketCountry,
  MarketSettings,
  Me,
  Mission,
  Paged,
  Portfolio,
  PricePoint,
  TopPlay,
  HoldingFlat,
  StockAnalytics,
  TradeQuote,
  StockSort,
  StockSummary,
  Trade,
  TrackedPlayer,
  TradeRequest,
  TradeResult,
  TradeType,
  Trending,
  TrendingStock,
  Wallet,
  WalletTransaction,
  WalletTransactionType,
} from "@/lib/api/types";

// Empty by default → requests are relative (same-origin): the browser only ever
// sees /api/v1/* on this app's own origin, and the Next.js rewrite in
// next.config.ts proxies them to the real backend server-side. The backend
// origin is therefore never exposed in the Network tab or the JS bundle.
// Set NEXT_PUBLIC_API_BASE_URL only for an intentional direct-to-backend setup.
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  code: string;
  status: number;
  traceId?: string;

  constructor(message: string, code: string, status: number, traceId?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.traceId = traceId;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token !== null) {
    headers.set("Authorization", "Bearer " + token);
  }

  const response = await fetch(API_BASE_URL + "/api/v1" + path, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let code = "UNKNOWN";
    let message = response.statusText || "Request failed";
    let traceId: string | undefined;
    try {
      const body = await response.json();
      if (body && typeof body === "object") {
        if (typeof body.code === "string") code = body.code;
        if (typeof body.message === "string") message = body.message;
        if (typeof body.traceId === "string") traceId = body.traceId;
      }
    } catch {
      // Ignore JSON parse failures; fall back to status-based defaults.
    }
    throw new ApiError(message, code, response.status, traceId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const str = String(value);
    if (str === "") continue;
    search.set(key, str);
  }
  const query = search.toString();
  return query ? "?" + query : "";
}

export function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/health");
}

export function getMe(): Promise<Me> {
  return request<Me>("/auth/me");
}

export function getMarketOverview(): Promise<MarketOverview> {
  return request<MarketOverview>("/market");
}

export function getStocks(params?: {
  page?: number;
  pageSize?: number;
  sort?: StockSort;
  search?: string;
  /** ISO 3166-1 alpha-2 country filter; empty/"ALL" = all countries (omitted). */
  country?: string;
}): Promise<Paged<StockSummary>> {
  // buildQuery already drops undefined/empty values; treat "ALL" as no filter too.
  const country =
    params?.country && params.country.toUpperCase() !== "ALL"
      ? params.country
      : undefined;
  return request<Paged<StockSummary>>(
    "/market/stocks" + buildQuery({ ...params, country }),
  );
}

/** Distinct countries present among tracked stocks, with a count each. */
export function getMarketCountries(): Promise<MarketCountry[]> {
  return request<{ items: MarketCountry[] }>("/market/countries").then(
    (r) => r.items ?? [],
  );
}

export function getStock(stockId: string): Promise<StockSummary> {
  return request<StockSummary>("/market/stocks/" + stockId);
}

// Public (no auth) — top movers for the landing-page live ticker.
export function getLiveMovers(limit = 8): Promise<LiveMover[]> {
  return request<{ items: LiveMover[] }>(
    "/market/movers?limit=" + limit,
  ).then((r) => r.items);
}

export function getStockHistory(stockId: string): Promise<PricePoint[]> {
  return request<PricePoint[]>("/market/stocks/" + stockId + "/history");
}

export function getStockTopPlays(
  stockId: string,
  limit = 5,
): Promise<TopPlay[]> {
  return request<{ items: TopPlay[] }>(
    "/market/stocks/" + stockId + "/top-plays?limit=" + limit,
  ).then((r) => r.items);
}

export function buy(body: TradeRequest): Promise<TradeResult> {
  return request<TradeResult>("/trading/buy", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function sell(body: TradeRequest): Promise<TradeResult> {
  return request<TradeResult>("/trading/sell", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getTradeHistory(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<Trade>> {
  return request<Paged<Trade>>("/trading/history" + buildQuery(params));
}

export function getPortfolio(): Promise<Portfolio> {
  return request<Portfolio>("/portfolio");
}

export function getHoldings(): Promise<Paged<HoldingFlat>> {
  return request<Paged<HoldingFlat>>("/portfolio/holdings");
}

export function getWallet(): Promise<Wallet> {
  return request<Wallet>("/wallet");
}

export function getWalletTransactions(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<WalletTransaction>> {
  return request<Paged<WalletTransaction>>("/wallet/transactions" + buildQuery(params));
}

// --- Phase 3: Economy expansion (investor level, achievements, missions) ---

export function getInvestorLevel(): Promise<InvestorLevel> {
  return request<InvestorLevel>("/investor/level");
}

export function getAchievements(): Promise<AchievementsResponse> {
  return request<AchievementsResponse>("/achievements");
}

export function getMissions(): Promise<Mission[]> {
  return request<{ items: Mission[] }>("/missions").then((r) => r.items);
}

// Sets the player's equipped title + showcased achievements. The server validates
// that every code is one the caller has actually unlocked.
export function updateProfileShowcase(body: {
  equippedTitleCode: string | null;
  showcasedAchievementCodes: string[];
}): Promise<{
  equippedTitleCode: string | null;
  equippedTitle: string | null;
  showcasedAchievementCodes: string[];
}> {
  return request("/profile/showcase", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// --- Frontend-ahead endpoints --------------------------------------------------
// These adapt the real API wire shapes to the types the UI consumes (same pattern
// as getNotifications), so components stay decoupled from the backend field names.

/** BE returns { range, candles: [{ bucketStart, ... }] }; the chart wants Candle[] with `timestamp`. */
export function getStockCandles(
  stockId: string,
  range: HistoryRange,
): Promise<Candle[]> {
  return request<{
    range: string;
    candles: Array<{
      bucketStart: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  }>("/market/stocks/" + stockId + "/history" + buildQuery({ range })).then((r) =>
    (r.candles ?? []).map((c) => ({
      timestamp: c.bucketStart,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    })),
  );
}

/** BE splits volume into shares/value and names the trader count activeTraders24h. */
// Accurate pre-trade estimate (fill incl. slippage/spread + the progressive fee),
// computed server-side with the same engine as a real trade.
export function getTradeQuote(
  stockId: string,
  quantity: number,
  side: "buy" | "sell",
): Promise<TradeQuote> {
  return request<TradeQuote>(
    "/market/stocks/" + stockId + "/quote" + buildQuery({ quantity, side }),
  );
}

export function getStockAnalytics(stockId: string): Promise<StockAnalytics> {
  return request<{
    volume24hShares: number;
    volume24hValue: number;
    volume7dShares: number;
    volume7dValue: number;
    volatility7d: number;
    ownershipCount: number;
    activeTraders24h: number;
    marketCap: number;
    liquidity: number;
    liquidityTier: string;
    totalShares: number;
    maxOwnershipPercentage: number;
    referenceSupplyShares?: number;
  }>("/market/stocks/" + stockId + "/analytics").then((r) => ({
    volume24h: r.volume24hShares,
    volume7d: r.volume7dShares,
    volatility7d: r.volatility7d,
    ownershipCount: r.ownershipCount,
    activeTraders: r.activeTraders24h,
    marketCap: r.marketCap,
    liquidity: r.liquidity,
    liquidityTier: r.liquidityTier,
    totalShares: r.totalShares,
    maxOwnershipPercentage: r.maxOwnershipPercentage,
    referenceSupplyShares: r.referenceSupplyShares,
  }));
}

/** Each bucket item carries one polymorphic `metricValue`; map it into the field that bucket renders. */
export function getTrending(): Promise<Trending> {
  const base = (r: RawTrendingStock): TrendingStock => ({
    stockId: r.stockId,
    playerName: r.playerName,
    avatarUrl: r.avatarUrl,
    countryCode: r.countryCode,
    currentPrice: r.currentPrice,
    volume: 0,
    priceChange24h: 0,
  });
  // Partial + `?? []` per bucket: a missing/renamed bucket degrades to empty
  // instead of throwing and failing the whole Trending page.
  return request<Partial<Record<keyof Trending, RawTrendingStock[]>>>(
    "/market/trending",
  ).then((raw) => ({
    // most bought / most sold carry a *trade count*, not a price delta — keep it
    // in tradeCount so the UI renders a count, not a misleading coin amount.
    mostBought: (raw.mostBought ?? []).map((r) => ({ ...base(r), tradeCount: r.metricValue })),
    mostSold: (raw.mostSold ?? []).map((r) => ({ ...base(r), tradeCount: r.metricValue })),
    fastestRising: (raw.fastestRising ?? []).map((r) => ({ ...base(r), priceChange24h: r.metricValue })),
    fastestFalling: (raw.fastestFalling ?? []).map((r) => ({ ...base(r), priceChange24h: r.metricValue })),
    highestVolume: (raw.highestVolume ?? []).map((r) => ({ ...base(r), volume: r.metricValue })),
  }));
}

interface RawTrendingStock {
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  metricValue: number;
  currentPrice: number;
}

// BE activity-feed item shape; the feed is price-history only, so everything is a PriceChange.
interface RawMarketEvent {
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  reason: string;
  description: string;
  percentChange: number | null;
  newPrice: number | null;
  occurredAt: string;
}

function toMarketEvent(e: RawMarketEvent): MarketEvent {
  return {
    eventId: `${e.stockId}-${e.occurredAt}`,
    type: "PriceChange",
    stockId: e.stockId,
    playerName: e.playerName,
    avatarUrl: e.avatarUrl,
    price: e.newPrice ?? undefined,
    priceChange: e.percentChange ?? undefined,
    occurredAt: e.occurredAt,
  };
}

export function getMarketEvents(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<MarketEvent>> {
  return request<Paged<RawMarketEvent>>(
    "/market/events" + buildQuery(params),
  ).then((page) => ({ ...page, items: (page.items ?? []).map(toMarketEvent) }));
}

export function getStockEvents(
  stockId: string,
  params?: { page?: number; pageSize?: number },
): Promise<Paged<MarketEvent>> {
  return request<Paged<RawMarketEvent>>(
    "/market/events/" + stockId + buildQuery(params),
  ).then((page) => ({ ...page, items: (page.items ?? []).map(toMarketEvent) }));
}

// BE route is /leaderboards/wealth and uses `value` / `periodChange` per entry.
export function getLeaderboard(params?: {
  page?: number;
  pageSize?: number;
  period?: "daily" | "weekly" | "monthly";
}): Promise<Paged<LeaderboardEntry>> {
  return request<{
    items: Array<{
      rank: number;
      userId: string;
      username: string;
      avatarUrl?: string | null;
      countryCode?: string | null;
      equippedTitle?: string | null;
      value: number;
      periodChange?: number | null;
    }>;
    page: number;
    pageSize: number;
  }>("/leaderboards/wealth" + buildQuery(params)).then((raw) => ({
    items: (raw.items ?? []).map((e) => ({
      rank: e.rank,
      userId: e.userId,
      username: e.username,
      avatarUrl: e.avatarUrl,
      countryCode: e.countryCode,
      equippedTitle: e.equippedTitle,
      portfolioValue: e.value,
      profitLoss: e.periodChange ?? undefined,
    })),
    page: raw.page,
    pageSize: raw.pageSize,
  }));
}

// The API returns { id, type, title, body, data, isRead, createdAt }; adapt it to the
// AppNotification shape the UI uses (notificationId/message) here so components stay decoupled
// from the wire format.
interface RawNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: string | null;
  isRead: boolean;
  createdAt: string;
}

const KNOWN_NOTIFICATION_TYPES = new Set<AppNotification["type"]>([
  "TradeExecuted",
  "PriceAlert",
  "Reward",
  "System",
]);

export function getNotifications(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<AppNotification>> {
  return request<Paged<RawNotification>>(
    "/notifications" + buildQuery(params),
  ).then((page) => ({
    ...page,
    items: (page.items ?? []).map((n) => {
      // Event notifications carry { stockId } in `data` — deep-link them to the stock page.
      let link: string | null = null;
      if (n.data) {
        try {
          const parsed = JSON.parse(n.data) as { stockId?: string };
          if (parsed?.stockId) link = `/stocks/${parsed.stockId}`;
        } catch {
          /* malformed data — leave the notification non-clickable */
        }
      }
      return {
        notificationId: n.id,
        // Keep the union truthful: an unknown server type falls back to "System"
        // (rendered with the generic icon) instead of a lying cast.
        type: KNOWN_NOTIFICATION_TYPES.has(n.type as AppNotification["type"])
          ? (n.type as AppNotification["type"])
          : "System",
        title: n.title,
        message: n.body,
        isRead: n.isRead,
        createdAt: n.createdAt,
        link,
      };
    }),
  }));
}

export function markNotificationRead(notificationId: string): Promise<void> {
  return request<void>("/notifications/" + notificationId + "/read", {
    method: "POST",
  });
}

export function markAllNotificationsRead(): Promise<void> {
  return request<void>("/notifications/read-all", { method: "POST" });
}

// --- Admin (endpoints exist server-side; paths assumed under /admin) -------

export function getMarketSettings(): Promise<MarketSettings> {
  return request<MarketSettings>("/admin/market-settings");
}

// PUT returns 204 No Content — don't expect a body back.
export function updateMarketSettings(body: MarketSettings): Promise<void> {
  return request<void>("/admin/market-settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// BE list item names the tier `trackingTier`; carry avatarUrl/stockId through.
// Paginated server-side — the tracked-players set can be in the thousands, so always
// pass page/pageSize (and optional search) rather than fetching the whole list.
export function getTrackedPlayers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<Paged<TrackedPlayer>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params?.page ?? 1));
  qs.set("pageSize", String(params?.pageSize ?? 25));
  if (params?.search?.trim()) qs.set("search", params.search.trim());

  return request<{
    items: Array<{
      trackedPlayerId: string;
      osuUserId: number;
      username: string;
      trackingTier: TrackedPlayer["tier"];
      isActive: boolean;
      avatarUrl: string | null;
      stockId: string | null;
    }>;
    page?: number;
    pageSize?: number;
    totalCount?: number;
  }>(`/admin/tracked-players?${qs.toString()}`).then((raw) => ({
    items: (raw.items ?? []).map((p) => ({
      trackedPlayerId: p.trackedPlayerId,
      osuUserId: p.osuUserId,
      username: p.username,
      tier: p.trackingTier,
      isActive: p.isActive,
      avatarUrl: p.avatarUrl,
      stockId: p.stockId,
    })),
    page: raw.page,
    pageSize: raw.pageSize,
    totalCount: raw.totalCount,
  }));
}

// BE expects `trackingTier` in the body and returns the full object; map it to a TrackedPlayer.
export function addTrackedPlayer(body: {
  osuUserId: number;
  tier: TrackedPlayer["tier"];
}): Promise<TrackedPlayer> {
  return request<{
    trackedPlayerId: string;
    osuUserId: number;
    username: string;
    trackingTier: TrackedPlayer["tier"];
    isActive: boolean;
    avatarUrl: string | null;
    stockId: string | null;
  }>("/admin/tracked-players", {
    method: "POST",
    body: JSON.stringify({ osuUserId: body.osuUserId, trackingTier: body.tier }),
  }).then((r) => ({
    trackedPlayerId: r.trackedPlayerId,
    osuUserId: r.osuUserId,
    username: r.username,
    tier: r.trackingTier,
    isActive: r.isActive,
    avatarUrl: r.avatarUrl,
    stockId: r.stockId,
  }));
}

// BE exposes separate /enable and /disable routes (PATCH, no body, 204) — no generic update.
export function updateTrackedPlayer(
  trackedPlayerId: string,
  body: { isActive?: boolean },
): Promise<void> {
  const action = body.isActive ? "enable" : "disable";
  return request<void>(
    "/admin/tracked-players/" + trackedPlayerId + "/" + action,
    { method: "PATCH" },
  );
}

// DELETE 204 on success; 409 CONFLICT if the player's stock has trades or holdings.
export function removeTrackedPlayer(trackedPlayerId: string): Promise<void> {
  return request<void>("/admin/tracked-players/" + trackedPlayerId, {
    method: "DELETE",
  });
}

// --- Admin transaction monitor --------------------------------------------
// Read-only cross-user feeds. BE serializes items in the AdminTrade /
// AdminWalletTransaction shape already (camelCase), so no field remapping.

export function getAdminTrades(params?: {
  userId?: string;
  stockId?: string;
  tradeType?: TradeType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paged<AdminTrade>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params?.page ?? 1));
  qs.set("pageSize", String(params?.pageSize ?? 25));
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.stockId) qs.set("stockId", params.stockId);
  if (params?.tradeType) qs.set("tradeType", params.tradeType);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);

  return request<{
    items: AdminTrade[];
    page?: number;
    pageSize?: number;
    totalCount?: number;
  }>(`/admin/transactions/trades?${qs.toString()}`).then((raw) => ({
    items: raw.items ?? [],
    page: raw.page,
    pageSize: raw.pageSize,
    totalCount: raw.totalCount,
  }));
}

export function getAdminWalletTransactions(params?: {
  userId?: string;
  type?: WalletTransactionType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}): Promise<Paged<AdminWalletTransaction>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params?.page ?? 1));
  qs.set("pageSize", String(params?.pageSize ?? 25));
  if (params?.userId) qs.set("userId", params.userId);
  if (params?.type) qs.set("type", params.type);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);

  return request<{
    items: AdminWalletTransaction[];
    page?: number;
    pageSize?: number;
    totalCount?: number;
  }>(`/admin/transactions/wallet?${qs.toString()}`).then((raw) => ({
    items: raw.items ?? [],
    page: raw.page,
    pageSize: raw.pageSize,
    totalCount: raw.totalCount,
  }));
}

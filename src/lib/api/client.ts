// HTTP layer for the OsuStocks API.

import { getAccessToken } from "@/lib/auth/token";
import type {
  AppNotification,
  Candle,
  HealthStatus,
  HistoryRange,
  LeaderboardEntry,
  MarketEvent,
  MarketOverview,
  MarketSettings,
  Me,
  Paged,
  Portfolio,
  PricePoint,
  HoldingFlat,
  StockAnalytics,
  StockSort,
  StockSummary,
  Trade,
  TrackedPlayer,
  TradeRequest,
  TradeResult,
  Trending,
  Wallet,
  WalletTransaction,
} from "@/lib/api/types";

export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5152";

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
}): Promise<Paged<StockSummary>> {
  return request<Paged<StockSummary>>("/market/stocks" + buildQuery(params));
}

export function getStock(stockId: string): Promise<StockSummary> {
  return request<StockSummary>("/market/stocks/" + stockId);
}

export function getStockHistory(stockId: string): Promise<PricePoint[]> {
  return request<PricePoint[]>("/market/stocks/" + stockId + "/history");
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

// --- Frontend-ahead endpoints (see the contracts note in types.ts) ---------

/** OHLC candles for a range. Backs the stock-detail chart's candle/line modes. */
export function getStockCandles(
  stockId: string,
  range: HistoryRange,
): Promise<Candle[]> {
  return request<Candle[]>(
    "/market/stocks/" + stockId + "/history" + buildQuery({ range }),
  );
}

export function getStockAnalytics(stockId: string): Promise<StockAnalytics> {
  return request<StockAnalytics>("/market/stocks/" + stockId + "/analytics");
}

export function getTrending(): Promise<Trending> {
  return request<Trending>("/market/trending");
}

export function getMarketEvents(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<MarketEvent>> {
  return request<Paged<MarketEvent>>("/market/events" + buildQuery(params));
}

export function getStockEvents(
  stockId: string,
  params?: { page?: number; pageSize?: number },
): Promise<Paged<MarketEvent>> {
  return request<Paged<MarketEvent>>(
    "/market/events/" + stockId + buildQuery(params),
  );
}

export function getLeaderboard(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<LeaderboardEntry>> {
  return request<Paged<LeaderboardEntry>>("/leaderboard" + buildQuery(params));
}

export function getNotifications(params?: {
  page?: number;
  pageSize?: number;
}): Promise<Paged<AppNotification>> {
  return request<Paged<AppNotification>>("/notifications" + buildQuery(params));
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
  return request<MarketSettings>("/admin/market/settings");
}

export function updateMarketSettings(
  body: MarketSettings,
): Promise<MarketSettings> {
  return request<MarketSettings>("/admin/market/settings", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getTrackedPlayers(): Promise<Paged<TrackedPlayer>> {
  return request<Paged<TrackedPlayer>>("/admin/tracked-players");
}

export function addTrackedPlayer(body: {
  osuUserId: number;
  tier: TrackedPlayer["tier"];
}): Promise<TrackedPlayer> {
  return request<TrackedPlayer>("/admin/tracked-players", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateTrackedPlayer(
  trackedPlayerId: string,
  body: { tier?: TrackedPlayer["tier"]; isActive?: boolean },
): Promise<TrackedPlayer> {
  return request<TrackedPlayer>("/admin/tracked-players/" + trackedPlayerId, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function removeTrackedPlayer(trackedPlayerId: string): Promise<void> {
  return request<void>("/admin/tracked-players/" + trackedPlayerId, {
    method: "DELETE",
  });
}

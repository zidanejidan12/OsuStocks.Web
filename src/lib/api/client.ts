// HTTP layer for the OsuStocks API.

import { getAccessToken } from "@/lib/auth/token";
import { getWalletStanding } from "@/lib/wallet-tiers";
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

function getMockResponse(path: string, init?: RequestInit): any {
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK === "false" || process.env.NODE_ENV === "test") {
    return undefined;
  }
  // Extract path and query params
  const cleanPath = path.split("?")[0];
  const method = init?.method?.toUpperCase() ?? "GET";

  const mockStocks = [
    { stockId: "mrekk", playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", currentPrice: 2450.5, volume: 45000, priceChange24h: 15.2, globalRank: 1, currentPp: 27150, countryCode: "AU" },
    { stockId: "akolibed", playerName: "Akolibed", avatarUrl: "https://a.ppy.sh/9284234", currentPrice: 2310.0, volume: 38000, priceChange24h: 8.7, globalRank: 2, currentPp: 26890, countryCode: "LV" },
    { stockId: "lifeline", playerName: "lifeline", avatarUrl: "https://a.ppy.sh/11367222", currentPrice: 1870.0, volume: 29000, priceChange24h: 4.5, globalRank: 3, currentPp: 24500, countryCode: "ID" },
    { stockId: "shigetora", playerName: "Cookiezi", avatarUrl: "https://a.ppy.sh/124128", currentPrice: 1982.0, volume: 15000, priceChange24h: -1.5, globalRank: 120, currentPp: 16540, countryCode: "KR" },
    { stockId: "whitecat", playerName: "WhiteCat", avatarUrl: "https://a.ppy.sh/4505068", currentPrice: 1540.2, volume: 21000, priceChange24h: 2.1, globalRank: 10, currentPp: 21500, countryCode: "DE" },
    { stockId: "vaxei", playerName: "Vaxei", avatarUrl: "https://a.ppy.sh/4787150", currentPrice: 1420.0, volume: 12000, priceChange24h: 0.0, globalRank: 45, currentPp: 19800, countryCode: "US" },
    { stockId: "rafis", playerName: "Rafis", avatarUrl: "https://a.ppy.sh/4946922", currentPrice: 1100.5, volume: 14000, priceChange24h: 1.2, globalRank: 32, currentPp: 20100, countryCode: "PL" },
    { stockId: "chicony", playerName: "Chicony", avatarUrl: "https://a.ppy.sh/11235678", currentPrice: 850.0, volume: 8000, priceChange24h: -8.4, globalRank: 8, currentPp: 22800, countryCode: "RU" },
    { stockId: "gasha", playerName: "Gasha", avatarUrl: "https://a.ppy.sh/9243724", currentPrice: 950.0, volume: 6200, priceChange24h: -5.2, globalRank: 78, currentPp: 18200, countryCode: "RU" },
    { stockId: "kalanluu", playerName: "Kalanluu", avatarUrl: "https://a.ppy.sh/11421465", currentPrice: 720.0, volume: 5100, priceChange24h: 11.4, globalRank: 95, currentPp: 17400, countryCode: "FI" },
    { stockId: "ryuk", playerName: "Ryuk", avatarUrl: "https://a.ppy.sh/6560131", currentPrice: 1040.0, volume: 11200, priceChange24h: 3.8, globalRank: 67, currentPp: 18900, countryCode: "CA" },
    { stockId: "nishinoflower", playerName: "Nishino Flower", avatarUrl: "https://a.ppy.sh/6560131", currentPrice: 620.0, volume: 3400, priceChange24h: -2.3, globalRank: 154, currentPp: 15900, countryCode: "JP" }
  ];

  if (cleanPath === "/health") {
    return { status: "Healthy", checks: [], totalDuration: 0.05 };
  }

  if (cleanPath === "/auth/me") {
    return {
      userId: "12345",
      osuUserId: 124128,
      username: "Peppy",
      avatarUrl: "https://a.ppy.sh/124128",
      role: "Admin",
      countryCode: "JP",
      equippedTitle: "Market Legend",
      showcasedAchievementCodes: ["ach_1", "ach_2", "ach_3"]
    };
  }

  if (cleanPath === "/market") {
    return {
      totalStocks: mockStocks.length,
      totalVolume: 182000,
      topGainer: {
        stockId: "mrekk",
        playerName: "mrekk",
        avatarUrl: "https://a.ppy.sh/7562902",
        currentPrice: 2450.5,
        priceChange24h: 15.2
      },
      topLoser: {
        stockId: "chicony",
        playerName: "Chicony",
        avatarUrl: "https://a.ppy.sh/11235678",
        currentPrice: 850.0,
        priceChange24h: -8.4
      }
    };
  }

  if (cleanPath === "/market/stocks") {
    return {
      items: mockStocks,
      page: 1,
      pageSize: 25,
      totalCount: mockStocks.length
    };
  }

  if (cleanPath.startsWith("/market/stocks/")) {
    const parts = cleanPath.split("/");
    const stockId = parts[3];
    const isHistory = parts[4] === "history";
    const isAnalytics = parts[4] === "analytics";
    const isTopPlays = parts[4] === "top-plays";
    const isQuote = parts[4] === "quote";

    const stock = mockStocks.find(s => s.stockId === stockId) || mockStocks[0];

    if (isHistory) {
      const now = new Date();
      const points = [];
      let basePrice = stock.currentPrice;
      for (let i = 30; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        basePrice = basePrice * (1 + (Math.random() - 0.48) * 0.05);
        points.push({
          timestamp: time.toISOString(),
          open: basePrice * 0.98,
          high: basePrice * 1.02,
          low: basePrice * 0.97,
          close: basePrice,
          volume: Math.floor(Math.random() * 2000)
        });
      }
      const hasRange = path.includes("range=");
      if (hasRange) {
        return {
          range: "30d",
          candles: points.map(p => ({
            bucketStart: p.timestamp,
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
            volume: p.volume
          }))
        };
      }
      return points.map(p => ({ timestamp: p.timestamp, price: p.close }));
    }

    if (isAnalytics) {
      return {
        volume24hShares: Math.floor(stock.volume / 10),
        volume24hValue: Math.floor(stock.volume / 10) * stock.currentPrice,
        volume7dShares: stock.volume,
        volume7dValue: stock.volume * stock.currentPrice,
        volatility7d: 0.12 + Math.random() * 0.08,
        ownershipCount: 45 + Math.floor(Math.random() * 100),
        activeTraders24h: 12 + Math.floor(Math.random() * 30),
        marketCap: stock.currentPrice * 10000,
        liquidity: 150000,
        liquidityTier: "Deep",
        totalShares: 10000,
        maxOwnershipPercentage: 25.0,
        referenceSupplyShares: 5000
      };
    }

    if (isTopPlays) {
      return {
        items: [
          { scoreId: 1001, pp: 1250, coverUrl: "https://assets.ppy.sh/beatmaps/10101/covers/cover.jpg", title: "mrekk - Blue Dragon [Blue Dragon] +DT", percentChange: 4.2, newPrice: stock.currentPrice, occurredAt: new Date().toISOString() },
          { scoreId: 1002, pp: 1180, coverUrl: "https://assets.ppy.sh/beatmaps/10102/covers/cover.jpg", title: "Akolibed - Valley of the Vale [Top] +HRDT", percentChange: 2.8, newPrice: stock.currentPrice * 0.96, occurredAt: new Date(Date.now() - 3600000).toISOString() }
        ]
      };
    }

    if (isQuote) {
      const searchParams = new URL(path, "http://localhost").searchParams;
      const qty = Number(searchParams.get("quantity") ?? 1);
      const isSell = searchParams.get("side") === "sell";
      const gross = qty * stock.currentPrice;
      const feeRate = getWalletStanding(25420.5).currentTier.feeRate;
      const fee = gross * feeRate;
      return {
        quantity: qty,
        unitPrice: stock.currentPrice,
        grossAmount: gross,
        fee: fee,
        total: isSell ? gross - fee : gross + fee,
        newPrice: isSell ? stock.currentPrice * 0.99 : stock.currentPrice * 1.01,
        isSell: isSell
      };
    }

    return stock;
  }

  if (cleanPath === "/market/countries") {
    return {
      items: [
        { countryCode: "AU", count: 1 },
        { countryCode: "LV", count: 1 },
        { countryCode: "DE", count: 1 },
        { countryCode: "KR", count: 1 },
        { countryCode: "US", count: 1 },
        { countryCode: "ID", count: 1 },
        { countryCode: "RU", count: 1 },
        { countryCode: "PL", count: 1 }
      ]
    };
  }

  if (cleanPath === "/market/movers") {
    return {
      items: [
        { stockId: "mrekk", playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", currentPrice: 2450.5, priceChange24h: 15.2 },
        { stockId: "akolibed", playerName: "Akolibed", avatarUrl: "https://a.ppy.sh/9284234", currentPrice: 2310.0, priceChange24h: 8.7 },
        { stockId: "chicony", playerName: "Chicony", avatarUrl: "https://a.ppy.sh/11235678", currentPrice: 850.0, priceChange24h: -8.4 }
      ]
    };
  }

  if (cleanPath === "/market/trending") {
    const list = mockStocks.map((s, idx) => ({
      ...s,
      tradeCount: 15 + Math.floor(Math.random() * 40) + (12 - idx) * 3,
      netQuantity: Math.floor((Math.random() - 0.4) * 200)
    }));
    return {
      mostBought: [...list].sort((a, b) => b.tradeCount - a.tradeCount).slice(0, 10),
      mostSold: [...list].sort((a, b) => a.tradeCount - b.tradeCount).slice(0, 10),
      fastestRising: [...list].sort((a, b) => b.priceChange24h - a.priceChange24h).slice(0, 10),
      fastestFalling: [...list].sort((a, b) => a.priceChange24h - b.priceChange24h).slice(0, 10),
      highestVolume: [...list].sort((a, b) => b.volume - a.volume).slice(0, 10)
    };
  }

  if (cleanPath === "/market/events") {
    return {
      items: [
        { stockId: "mrekk", playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", reason: "RankChanged", description: "Set new top play", percentChange: 4.2, newPrice: 2450.5, occurredAt: new Date().toISOString() },
        { stockId: "akolibed", playerName: "Akolibed", avatarUrl: "https://a.ppy.sh/9284234", reason: "PpIncreased", description: "FC'd complex stream map", percentChange: 2.1, newPrice: 2310.0, occurredAt: new Date(Date.now() - 120000).toISOString() }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  if (cleanPath === "/trading/buy" || cleanPath === "/trading/sell") {
    const isSell = cleanPath.endsWith("sell");
    let qty = 1;
    let stockId = "mrekk";
    try {
      const body = JSON.parse(init?.body as string);
      qty = body.quantity ?? 1;
      stockId = body.stockId ?? "mrekk";
    } catch {}

    const stock = mockStocks.find(s => s.stockId === stockId) || mockStocks[0];
    const total = qty * stock.currentPrice;
    const feeRate = getWalletStanding(25420.5).currentTier.feeRate;
    const fee = total * feeRate;

    return {
      tradeId: "tr_" + Math.random().toString(36).substring(2, 9),
      quantity: qty,
      unitPrice: stock.currentPrice,
      totalAmount: isSell ? total - fee : total + fee,
      fee: fee,
      status: "Executed"
    };
  }

  if (cleanPath === "/trading/history") {
    return {
      items: [
        { tradeId: "tr_1", stockId: "mrekk", tradeType: "Buy", quantity: 5, unitPrice: 2400.0, totalAmount: 12000.0, executedAt: new Date(Date.now() - 3600000).toISOString(), playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902" },
        { tradeId: "tr_2", stockId: "shigetora", tradeType: "Sell", quantity: 10, unitPrice: 2000.0, totalAmount: 20000.0, executedAt: new Date(Date.now() - 86400000).toISOString(), playerName: "Cookiezi", avatarUrl: "https://a.ppy.sh/124128" }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  if (cleanPath === "/portfolio") {
    return {
      currentValue: 45000.0,
      costBasis: 40000.0,
      profitLoss: 5000.0,
      holdings: [
        { holdingId: "h_1", stockId: "mrekk", playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", quantity: 15, averagePrice: 2300.0, currentPrice: 2450.5, costBasis: 34500.0, currentValue: 36757.5, profitLoss: 2257.5 },
        { holdingId: "h_2", stockId: "whitecat", playerName: "WhiteCat", avatarUrl: "https://a.ppy.sh/4505068", quantity: 5, averagePrice: 1500.0, currentPrice: 1540.2, costBasis: 7500.0, currentValue: 7701.0, profitLoss: 201.0 }
      ]
    };
  }

  if (cleanPath === "/portfolio/holdings") {
    return {
      items: [
        { holdingId: "h_1", stockId: "mrekk", playerName: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", quantity: 15, averagePrice: 2300.0, currentPrice: 2450.5 },
        { holdingId: "h_2", stockId: "whitecat", playerName: "WhiteCat", avatarUrl: "https://a.ppy.sh/4505068", quantity: 5, averagePrice: 1500.0, currentPrice: 1540.2 }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  if (cleanPath === "/wallet") {
    return { balance: 25420.5 };
  }

  if (cleanPath === "/wallet/transactions") {
    return {
      items: [
        { transactionId: "tx_1", transactionType: "DailyReward", amount: 1000.0, referenceId: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { transactionId: "tx_2", transactionType: "BuyStock", amount: -12120.0, referenceId: "tr_1", createdAt: new Date(Date.now() - 7200000).toISOString() }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  if (cleanPath === "/investor/level") {
    return {
      level: 15,
      title: "Active Speculator",
      totalXp: 15420,
      xpIntoLevel: 420,
      xpForNextLevel: 1000,
      progressToNext: 0.42
    };
  }

  if (cleanPath === "/achievements") {
    return {
      unlockedCount: 1,
      totalCount: 9,
      items: [
        { code: "ach_1", name: "First Steps", description: "Execute your first trade.", category: "Trading", metric: "trades_count", threshold: 1, currentValue: 1, rewardCredits: 300, unlocked: true, unlockedAt: new Date(Date.now() - 86400000).toISOString() },
        { code: "ach_2", name: "Getting Active", description: "Execute 10 trades.", category: "Trading", metric: "trades_count", threshold: 10, currentValue: 1, rewardCredits: 800, unlocked: false, unlockedAt: null },
        { code: "ach_3", name: "Seasoned Trader", description: "Execute 100 trades.", category: "Trading", metric: "trades_count", threshold: 100, currentValue: 1, rewardCredits: 3000, unlocked: false, unlockedAt: null },
        { code: "ach_4", name: "Big Spender", description: "Trade 100,000 credits of volume.", category: "Trading", metric: "volume_traded", threshold: 100000, currentValue: 51, rewardCredits: 1500, unlocked: false, unlockedAt: null },
        { code: "ach_5", name: "High Roller", description: "Trade 1,000,000 credits of volume.", category: "Trading", metric: "volume_traded", threshold: 1000000, currentValue: 51, rewardCredits: 8000, unlocked: false, unlockedAt: null },
        { code: "ach_6", name: "Diversified", description: "Buy 5 different stocks.", category: "Portfolio", metric: "unique_stocks", threshold: 5, currentValue: 1, rewardCredits: 1500, unlocked: false, unlockedAt: null },
        { code: "ach_7", name: "Portfolio Mogul", description: "Buy 20 different stocks.", category: "Portfolio", metric: "unique_stocks", threshold: 20, currentValue: 1, rewardCredits: 5000, unlocked: false, unlockedAt: null },
        { code: "ach_8", name: "Rising Investor", description: "Reach investor level 10.", category: "Progression", metric: "level", threshold: 10, currentValue: 1, rewardCredits: 3000, unlocked: false, unlockedAt: null },
        { code: "ach_9", name: "Market Veteran", description: "Reach investor level 25.", category: "Progression", metric: "level", threshold: 25, currentValue: 1, rewardCredits: 10000, unlocked: false, unlockedAt: null }
      ]
    };
  }

  if (cleanPath === "/missions") {
    return {
      items: [
        { code: "m_1", name: "Daily Trade", description: "Execute any trade today.", period: "Daily", periodKey: "2026-06-28", metric: "trades", target: 1, currentValue: 1, rewardCredits: 50, completed: true, completedAt: new Date(Date.now() - 3600000 * 2).toISOString(), resetsAt: new Date(Date.now() + 3600000 * 14).toISOString() },
        { code: "m_2", name: "Weekly Volume", description: "Trade 50 shares this week.", period: "Weekly", periodKey: "2026-w26", metric: "volume", target: 50, currentValue: 15, rewardCredits: 300, completed: false, completedAt: null, resetsAt: new Date(Date.now() + 3600000 * 24 * 3).toISOString() }
      ]
    };
  }

  if (cleanPath === "/notifications") {
    return {
      items: [
        { id: "not_1", type: "TradeExecuted", title: "Trade Executed", body: "Successfully bought 15 shares of mrekk", data: JSON.stringify({ stockId: "mrekk" }), isRead: false, createdAt: new Date().toISOString() },
        { id: "not_2", type: "Reward", title: "Daily Reward Claimed", body: "You received 1,000 credits!", data: null, isRead: true, createdAt: new Date(Date.now() - 3600000).toISOString() }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  if (cleanPath === "/leaderboards/wealth") {
    return {
      items: [
        { rank: 1, userId: "user_1", username: "mrekk", avatarUrl: "https://a.ppy.sh/7562902", countryCode: "AU", equippedTitle: "10* Passer", value: 1250420, periodChange: 15.2 },
        { rank: 2, userId: "user_2", username: "Akolibed", avatarUrl: "https://a.ppy.sh/9284234", countryCode: "LV", equippedTitle: "Speed Demon", value: 980310, periodChange: 8.7 },
        { rank: 3, userId: "user_3", username: "lifeline", avatarUrl: "https://a.ppy.sh/11367222", countryCode: "ID", equippedTitle: "Active Trader", value: 870100, periodChange: 4.5 },
        { rank: 4, userId: "user_4", username: "Cookiezi", avatarUrl: "https://a.ppy.sh/124128", countryCode: "KR", equippedTitle: "Clicking Circles", value: 654200, periodChange: -1.5 },
        { rank: 5, userId: "user_5", username: "WhiteCat", avatarUrl: "https://a.ppy.sh/4505068", countryCode: "DE", equippedTitle: "Aim God", value: 540200, periodChange: 2.1 },
        { rank: 6, userId: "user_6", username: "Vaxei", avatarUrl: "https://a.ppy.sh/4787150", countryCode: "US", equippedTitle: "Tournament Monster", value: 420000, periodChange: 0.0 },
        { rank: 7, userId: "user_7", username: "Rafis", avatarUrl: "https://a.ppy.sh/4946922", countryCode: "PL", equippedTitle: "Grandpa", value: 310500, periodChange: 1.2 },
        { rank: 8, userId: "user_8", username: "Chicony", avatarUrl: "https://a.ppy.sh/11235678", countryCode: "RU", equippedTitle: "Top 10", value: 250000, periodChange: -8.4 },
        { rank: 9, userId: "user_9", username: "Ryuk", avatarUrl: "https://a.ppy.sh/6560131", countryCode: "CA", equippedTitle: "Old School Legend", value: 198000, periodChange: 3.8 },
        { rank: 10, userId: "user_10", username: "Kalanluu", avatarUrl: "https://a.ppy.sh/11421465", countryCode: "FI", equippedTitle: "Double Tap Master", value: 145000, periodChange: 11.4 }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 10
    };
  }

  if (cleanPath === "/admin/market-settings") {
    return { ppMultiplier: 1.0, tradeMultiplier: 1.0, decayMultiplier: 1.0, tradeFeeMultiplier: 1.0, isMaintenanceMode: false };
  }

  if (cleanPath === "/admin/tracked-players") {
    return {
      items: [
        { trackedPlayerId: "tp_1", osuUserId: 7562902, username: "mrekk", trackingTier: "Tier1", isActive: true, avatarUrl: "https://a.ppy.sh/7562902", stockId: "mrekk" },
        { trackedPlayerId: "tp_2", osuUserId: 9284234, username: "Akolibed", trackingTier: "Tier1", isActive: true, avatarUrl: "https://a.ppy.sh/9284234", stockId: "akolibed" }
      ],
      page: 1,
      pageSize: 25,
      totalCount: 2
    };
  }

  return undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const mockResult = getMockResponse(path, init);
  if (mockResult !== undefined) {
    return Promise.resolve(mockResult as T);
  }

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

// Shared API types and interfaces. Types only — no runtime code.

export type UserRole = "User" | "Admin";

export type TradeType = "Buy" | "Sell";

export type WalletTransactionType =
  | "InitialGrant"
  | "BuyStock"
  | "SellStock"
  | "DailyReward"
  | "AdminGrant"
  | "AdminDeduction";

export type TrackingTier = "Tier1" | "Tier2" | "Tier3";

export type StockSort =
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "volume_asc"
  | "volume_desc"
  | "change24h_asc"
  | "change24h_desc";

export interface Me {
  userId: string;
  osuUserId: number;
  username: string;
  /** osu! profile image URL. Optional until the API returns it. */
  avatarUrl?: string | null;
  role: UserRole;
  /** osu! profile country, ISO 3166-1 alpha-2 (e.g. "US"). Optional until the API returns it. */
  countryCode?: string | null;
}

export interface TopMover {
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  currentPrice: number;
  priceChange24h: number;
}

export interface MarketOverview {
  totalStocks: number;
  totalVolume: number;
  topGainer: TopMover | null;
  topLoser: TopMover | null;
}

export interface StockSummary {
  stockId: string;
  playerName: string;
  /** osu! profile image URL. Optional until the API returns it. */
  avatarUrl?: string | null;
  /** osu! profile country, ISO 3166-1 alpha-2 (e.g. "US"). Optional until the API returns it. */
  countryCode?: string | null;
  currentPrice: number;
  volume: number;
  priceChange24h: number;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

export interface Paged<T> {
  items: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
}

export interface TradeRequest {
  stockId: string;
  quantity: number;
}

export interface TradeResult {
  tradeId: string;
  unitPrice: number;
  totalAmount: number;
  status: string;
}

export interface Trade {
  tradeId: string;
  stockId: string;
  tradeType: TradeType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  executedAt: string;
  playerName: string;
  avatarUrl?: string | null;
}

export interface Holding {
  holdingId: string;
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  costBasis: number;
  currentValue: number;
  profitLoss: number;
}

export interface HoldingFlat {
  holdingId: string;
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

export interface Portfolio {
  currentValue: number;
  costBasis: number;
  profitLoss: number;
  holdings: Holding[];
}

export interface Wallet {
  balance: number;
}

export interface WalletTransaction {
  transactionId: string;
  transactionType: WalletTransactionType;
  amount: number;
  referenceId: string | null;
  createdAt: string;
}

export interface HealthStatus {
  status: string;
  checks: {
    name: string;
    status: string;
    duration: number;
    description: string | null;
    exception: string | null;
  }[];
  totalDuration: number;
}

// ---------------------------------------------------------------------------
// Frontend-ahead contracts.
//
// The shapes below are built against the documented endpoints in TASKS.md
// before the backend DTOs are pinned down (same approach as the avatarUrl /
// countryCode rollout). Fields the UI can render without are marked optional so
// a partial/renamed backend response degrades gracefully rather than throwing.
// Reconcile field names with the API once the endpoints land.
// ---------------------------------------------------------------------------

// --- Leaderboard (GET /leaderboard) ---------------------------------------
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  countryCode?: string | null;
  /** Mark-to-market value of the user's holdings. */
  portfolioValue: number;
  /** Holdings + wallet balance. Optional until the API supplies it. */
  netWorth?: number;
  /** All-time profit/loss. Optional until the API supplies it. */
  profitLoss?: number;
}

// --- Trending (GET /market/trending) --------------------------------------
/** A stock plus the metric that earned it a spot in a trending bucket. */
export interface TrendingStock extends StockSummary {
  /** Trades in the window (drives most-bought / most-sold). Optional. */
  tradeCount?: number;
  /** Net buys − sells in the window. Optional. */
  netQuantity?: number;
}

export interface Trending {
  mostBought: TrendingStock[];
  mostSold: TrendingStock[];
  fastestRising: TrendingStock[];
  fastestFalling: TrendingStock[];
  highestVolume: TrendingStock[];
}

// --- Market activity feed (GET /market/events[, /{stockId}]) ---------------
export type MarketEventType =
  | "PriceChange"
  | "Trade"
  | "NewStock"
  | "Halted"
  | "Resumed";

export interface MarketEvent {
  eventId: string;
  type: MarketEventType;
  stockId: string;
  playerName: string;
  avatarUrl?: string | null;
  /** Price after the event. Optional (not every event type carries one). */
  price?: number;
  /** Signed price delta for PriceChange events. Optional. */
  priceChange?: number;
  /** Quantity for Trade events. Optional. */
  quantity?: number;
  occurredAt: string;
}

// --- Notifications (GET /notifications, POST .../read, .../read-all) -------
export type NotificationType =
  | "TradeExecuted"
  | "PriceAlert"
  | "Reward"
  | "System";

/** Named AppNotification to avoid shadowing the DOM `Notification` global. */
export interface AppNotification {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  /** Optional in-app deep link (e.g. /stocks/{id}). */
  link?: string | null;
}

// --- Stock analytics (GET /market/stocks/{id}/analytics) -------------------
export interface StockAnalytics {
  volume24h: number;
  volume7d: number;
  /** 7-day price volatility, as a fraction (0.12 = 12%). */
  volatility7d: number;
  /** Distinct holders. */
  ownershipCount: number;
  /** Distinct traders active in the last 24h. */
  activeTraders: number;
  /** currentPrice × outstanding shares. */
  marketCap: number;
}

// --- OHLC history (GET /market/stocks/{id}/history?range=…) -----------------
export type HistoryRange = "1h" | "24h" | "7d" | "30d";

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// --- Admin (market settings + tracked players) -----------------------------
export interface MarketSettings {
  /** Master switch for trading. */
  tradingEnabled: boolean;
  /** Seconds a user must wait between trades on the same stock. */
  tradeCooldownSeconds: number;
  /** Max shares of a single stock one user may hold. */
  maxPositionPerStock: number;
  /** How often prices recompute, in seconds. Optional. */
  priceUpdateIntervalSeconds?: number;
}

export interface TrackedPlayer {
  trackedPlayerId: string;
  osuUserId: number;
  username: string;
  avatarUrl?: string | null;
  tier: TrackingTier;
  isActive: boolean;
  /** The stock minted for this player, once one exists. Optional. */
  stockId?: string | null;
}

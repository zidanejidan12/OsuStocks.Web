// Shared API types and interfaces. Types only — no runtime code.

export type UserRole = "User" | "Admin";

export type TradeType = "Buy" | "Sell";

export type WalletTransactionType =
  | "InitialGrant"
  | "BuyStock"
  | "SellStock"
  | "DailyReward"
  | "AdminGrant"
  | "AdminDeduction"
  | "MissionReward"
  | "AchievementReward"
  | "TradeFee";

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
  /** osu! profile banner (cover.url). Optional. */
  coverUrl?: string | null;
  /** Equipped achievement code whose name is shown as the player's title (null = use level title). */
  equippedTitleCode?: string | null;
  /** Resolved display name of the equipped title (null when none equipped). */
  equippedTitle?: string | null;
  /** Achievement codes pinned to the profile showcase (max 3). */
  showcasedAchievementCodes: string[];
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
  /**
   * osu! profile cover/banner image URL (the osu! API `cover.url`). Optional —
   * the backend does not sync osu! covers yet (flagged in TASKS.md), and unlike
   * the avatar it can't be derived from the user id, so it only renders once the
   * API supplies it; the stock-detail header falls back to its gradient meanwhile.
   */
  bannerUrl?: string | null;
  /** osu! profile country, ISO 3166-1 alpha-2 (e.g. "US"). Optional until the API returns it. */
  countryCode?: string | null;
  currentPrice: number;
  volume: number;
  priceChange24h: number;
  /** Latest synced osu! global rank. Null until the player has been synced. */
  globalRank?: number | null;
  /** Latest synced osu! performance points (pp). Null until synced. */
  currentPp?: number | null;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

// A distinct country present among tracked stocks, with how many stocks it has.
// Backed by GET /market/countries → { items: [{ countryCode, count }] }.
export interface MarketCountry {
  /** ISO 3166-1 alpha-2 country code (e.g. "FR"). */
  countryCode: string;
  /** Number of tracked stocks with this country code. */
  count: number;
}

// A top mover for the public landing-page live ticker.
export interface LiveMover {
  stockId: string;
  playerName: string;
  avatarUrl: string | null;
  currentPrice: number;
  priceChange24h: number;
}

// A recent osu! top play that moved a stock's price. percentChange/newPrice are null
// when no correlated price-history row was found for the event.
export interface TopPlay {
  scoreId: number;
  pp: number | null;
  coverUrl: string | null;
  title: string | null;
  percentChange: number | null;
  newPrice: number | null;
  occurredAt: string;
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
  /** Executed quantity echoed by the server. Optional until the API ships it (OsuStocks.API #31). */
  quantity?: number;
  unitPrice: number;
  totalAmount: number;
  /** Progressive service fee charged on the trade (burned). Optional for older responses. */
  fee?: number;
  status: string;
}

/** Pre-trade estimate matching execution: exact fill + progressive fee. */
export interface TradeQuote {
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  fee: number;
  /** Wallet debit when buying (gross + fee) or net proceeds when selling (gross − fee). */
  total: number;
  newPrice: number;
  isSell: boolean;
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
  /** Equipped achievement title shown as a flair next to the name. Optional. */
  equippedTitle?: string | null;
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
  /** Float + recent volume — how easily the stock trades without moving its price. */
  liquidity: number;
  /** Qualitative liquidity band: "Thin" | "Moderate" | "Deep". */
  liquidityTier: string;
  /** Total shares held across all users (the float) — drives the per-trader buy cap. */
  totalShares: number;
  /** Single-trader ownership cap, as a percentage (e.g. 25). */
  maxOwnershipPercentage: number;
  /**
   * Virtual "reference supply" added to the float when enforcing the cap, so the
   * effective cap is `25% of (totalShares + referenceSupplyShares)`. Lets the
   * "max you can buy" match the server on thin/new stocks. Optional until the API
   * returns it (falls back to a client default).
   */
  referenceSupplyShares?: number;
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
  /** Multiplier applied to pp-driven price moves. */
  ppMultiplier: number;
  /** Multiplier applied to trade-driven price moves. */
  tradeMultiplier: number;
  /** Multiplier applied to idle price decay. */
  decayMultiplier: number;
  /** Scales the progressive trade fee live (0 = fees off, 1 = configured rates, 2 = double). */
  tradeFeeMultiplier: number;
  /** When true, trading is halted for maintenance. */
  isMaintenanceMode: boolean;
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

// --- Admin transaction monitor (GET /admin/transactions/{trades,wallet}) ----
/** A trade row across all users, for the admin monitor. */
export interface AdminTrade {
  tradeId: string;
  /** The trader. */
  userId: string;
  username: string;
  avatarUrl?: string | null;
  /** The traded stock + the osu! player it tracks. */
  stockId: string;
  playerName?: string | null;
  tradeType: TradeType;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  executedAt: string;
}

/** A wallet-ledger row across all users, for the admin monitor. */
export interface AdminWalletTransaction {
  id: string;
  /** The wallet owner. */
  userId: string;
  username: string;
  transactionType: WalletTransactionType;
  /** Stored as a positive magnitude; sign is derived from the type (see CREDIT_TYPES). */
  amount: number;
  referenceId: string | null;
  createdAt: string;
}

// --- Investor level (GET /investor/level) ----------------------------------
export interface InvestorLevel {
  /** Current level, soft-capped at 100. */
  level: number;
  /** Cosmetic rank name for the current level. */
  title: string;
  /** Lifetime XP earned. */
  totalXp: number;
  /** XP accumulated within the current level. */
  xpIntoLevel: number;
  /** XP required to reach the next level. 0 when at the cap. */
  xpForNextLevel: number;
  /** Progress toward the next level, as a 0..1 fraction. */
  progressToNext: number;
}

// --- Achievements (GET /achievements) --------------------------------------
export interface Achievement {
  code: string;
  name: string;
  description: string;
  category: string;
  metric: string;
  threshold: number;
  currentValue: number;
  rewardCredits: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementsResponse {
  unlockedCount: number;
  totalCount: number;
  items: Achievement[];
}

// --- Missions (GET /missions) ----------------------------------------------
export type MissionPeriod = "Daily" | "Weekly";

export interface Mission {
  code: string;
  name: string;
  description: string;
  period: MissionPeriod;
  periodKey: string;
  metric: string;
  target: number;
  currentValue: number;
  rewardCredits: number;
  completed: boolean;
  completedAt: string | null;
  resetsAt: string;
}

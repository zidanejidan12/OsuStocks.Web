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
  role: UserRole;
  /** osu! profile country, ISO 3166-1 alpha-2 (e.g. "US"). Optional until the API returns it. */
  countryCode?: string;
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
  currentPrice: number;
  volume: number;
  priceChange24h: number;
}

export interface PricePoint {
  timestamp: string;
  price: number;
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

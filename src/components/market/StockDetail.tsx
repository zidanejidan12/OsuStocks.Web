"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CaretLeft,
  ChartLineUp,
  ChartBar,
  ChartLine,
  CheckCircle,
  WarningCircle,
  Lock,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Coins,
  Users,
  Pulse,
  Timer,
  Trophy,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type {
  Candle,
  HistoryRange,
  StockAnalytics,
  StockSummary,
  TopPlay,
  TradeResult,
  TradeQuote,
} from "@/lib/api/types";
import {
  getStock,
  getStockCandles,
  getStockAnalytics,
  getStockTopPlays,
  getHoldings,
  getWallet,
  getTradeQuote,
  buy,
  sell,
  ApiError,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";
import * as analytics from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Money } from "@/components/ui/Money";
import { Coin } from "@/components/ui/Coin";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { scaleIn, EASE_OUT_EXPO } from "@/lib/motion";
import {
  formatNumber,
  formatShares,
  formatCompact,
  formatPercent,
  formatDateTime,
} from "@/lib/format";

const RANGES: HistoryRange[] = ["1h", "24h", "7d", "30d"];
const COOLDOWN_MS = 30_000; // documented per-stock trade cooldown
const CHART_W = 640;
const CHART_H = 200;
const CHART_PAD = 10;

function chartBounds(min: number, max: number) {
  const span = max - min || 1;
  const yFor = (price: number) =>
    CHART_PAD + (CHART_H - CHART_PAD * 2) * (1 - (price - min) / span);
  return { yFor };
}

/** Candlestick chart over OHLC data — emerald up / rose down. */
function CandleChart({ candles }: { candles: Candle[] }) {
  const reduceMotion = useReducedMotion();
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const { yFor } = chartBounds(min, max);
  const slot = (CHART_W - CHART_PAD * 2) / candles.length;
  const bodyW = Math.max(1.5, Math.min(slot * 0.62, 16));

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
      className="h-48 w-full sm:h-56"
      role="img"
      aria-label="Price history candlestick chart"
    >
      <motion.g
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 0.5 }}
      >
        {candles.map((c, i) => {
          const cx = CHART_PAD + slot * i + slot / 2;
          const up = c.close >= c.open;
          const color = up ? "#34d399" : "#fb7185"; // emerald-400 / rose-400
          const yOpen = yFor(c.open);
          const yClose = yFor(c.close);
          const bodyY = Math.min(yOpen, yClose);
          const bodyH = Math.max(1, Math.abs(yOpen - yClose));
          return (
            <g key={`${c.timestamp}-${i}`}>
              <line
                x1={cx}
                x2={cx}
                y1={yFor(c.high)}
                y2={yFor(c.low)}
                stroke={color}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={cx - bodyW / 2}
                y={bodyY}
                width={bodyW}
                height={bodyH}
                fill={color}
                rx={0.5}
              />
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}

/** Smooth area/line view over candle closes. */
function LineChart({ candles }: { candles: Candle[] }) {
  const reduceMotion = useReducedMotion();
  const closes = candles.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const { yFor } = chartBounds(min, max);
  const stepX = (CHART_W - CHART_PAD * 2) / (candles.length - 1);
  const coords = candles.map((c, i) => ({
    x: CHART_PAD + i * stepX,
    y: yFor(c.close),
  }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");
  const areaPath =
    `M${coords[0].x.toFixed(2)},${(CHART_H - CHART_PAD).toFixed(2)} ` +
    coords.map((c) => `L${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ") +
    ` L${coords[coords.length - 1].x.toFixed(2)},${(CHART_H - CHART_PAD).toFixed(2)} Z`;
  const rising = closes[closes.length - 1] >= closes[0];
  const stroke = rising ? "#34d399" : "#fb7185";
  const gradientId = `area-grad-${rising ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
      className="h-48 w-full sm:h-56"
      role="img"
      aria-label="Price history area chart"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={areaPath}
        fill={`url(#${gradientId})`}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={
          reduceMotion ? undefined : { duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }
        }
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={reduceMotion ? undefined : { pathLength: 1 }}
        transition={reduceMotion ? undefined : { duration: 1.1, ease: EASE_OUT_EXPO }}
      />
    </svg>
  );
}

function PriceChartCard({
  stockId,
  refreshKey,
}: {
  stockId: string;
  refreshKey: number;
}) {
  const [range, setRange] = useState<HistoryRange>("24h");
  const [mode, setMode] = useState<"candle" | "line">("candle");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoaded(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    getStockCandles(stockId, range)
      .then((data) => {
        if (!cancelled) setCandles(data);
      })
      .catch(() => {
        if (!cancelled) setCandles([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [stockId, range]);

  // Silent refetch after a trade moves the price — no skeleton flash.
  useEffect(() => {
    if (refreshKey === 0) return;
    let cancelled = false;
    getStockCandles(stockId, range)
      .then((data) => {
        if (!cancelled) setCandles(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const first = candles[0];
  const last = candles[candles.length - 1];
  const min = candles.length ? Math.min(...candles.map((c) => c.low)) : 0;
  const max = candles.length ? Math.max(...candles.map((c) => c.high)) : 0;

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChartLineUp size={18} weight="bold" className="text-pink-400" />
          <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
            Price history
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Candle / line mode toggle */}
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
            {(["candle", "line"] as const).map((m) => {
              const Icon = m === "candle" ? ChartBar : ChartLine;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-label={m === "candle" ? "Candlestick" : "Line"}
                  className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${
                    mode === m
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon size={15} weight="bold" />
                </button>
              );
            })}
          </div>
          {/* Range selector */}
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium tabular-nums transition-colors ${
                  range === r
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="space-y-3">
          <Skeleton className="h-48 w-full rounded-xl sm:h-56" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ) : candles.length < 2 ? (
        <EmptyState
          title="Not enough history"
          message="Price history will appear here once more data is available."
          icon={<ChartLineUp size={20} weight="bold" />}
        />
      ) : (
        <div className="w-full">
          <div className="relative">
            {mode === "candle" ? (
              <CandleChart candles={candles} />
            ) : (
              <LineChart candles={candles} />
            )}
            <span className="pointer-events-none absolute right-0 top-0 rounded-md bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-zinc-400 backdrop-blur-sm">
              <Money value={max} />
            </span>
            <span className="pointer-events-none absolute bottom-0 right-0 rounded-md bg-zinc-950/60 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-zinc-400 backdrop-blur-sm">
              <Money value={min} />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                Open
              </span>
              <span className="font-mono text-xs tabular-nums text-zinc-300">
                <Money value={first.open} />
              </span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-500">
                {formatDateTime(first.timestamp)}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                Close
              </span>
              <span className="font-mono text-xs tabular-nums text-zinc-300">
                <Money value={last.close} />
              </span>
              <span className="font-mono text-[10px] tabular-nums text-zinc-500">
                {formatDateTime(last.timestamp)}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3.5">
      <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-zinc-100">
        {value}
      </div>
    </div>
  );
}

function AnalyticsPanel({
  stockId,
  refreshKey,
}: {
  stockId: string;
  refreshKey: number;
}) {
  const [data, setData] = useState<StockAnalytics | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoaded(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    getStockAnalytics(stockId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [stockId]);

  // Silent refetch after a trade — keep the panel mounted, no skeleton flash.
  useEffect(() => {
    if (refreshKey === 0) return;
    let cancelled = false;
    getStockAnalytics(stockId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Frontend-ahead: if analytics isn't available yet, skip the panel quietly.
  if (loaded && data === null) return null;

  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Pulse size={18} weight="bold" className="text-pink-400" />
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Analytics
        </h2>
      </div>
      {!loaded || !data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat
            label="Market Cap"
            value={
              <span className="inline-flex items-center gap-1">
                <Coin />
                {formatCompact(data.marketCap)}
              </span>
            }
          />
          <MiniStat label="Volume 24h" value={formatCompact(data.volume24h)} />
          <MiniStat label="Volume 7d" value={formatCompact(data.volume7d)} />
          <MiniStat label="Volatility 7d" value={formatPercent(data.volatility7d)} />
          <MiniStat
            label="Holders"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Users size={15} weight="bold" className="text-zinc-500" />
                {formatNumber(data.ownershipCount)}
              </span>
            }
          />
          <MiniStat label="Active Traders" value={formatNumber(data.activeTraders)} />
          <MiniStat
            label="Liquidity"
            value={`${data.liquidityTier} · ${formatCompact(data.liquidity)}`}
          />
        </div>
      )}
    </Card>
  );
}

/** Position cap (matches the backend's MaxOwnershipPercentage, default 25%). */
const POSITION_LIMIT = 0.25;

function TradePanel({
  stockId,
  currentPrice,
  onTraded,
}: {
  stockId: string;
  /** Latest unit price — drives the live cost preview and the "max you can buy". */
  currentPrice: number;
  /** Fired after a successful trade so the parent can refresh price/chart/analytics. */
  onTraded?: () => void;
}) {
  const { user } = useAuth();
  const { notify } = useToast();
  // Raw input string so decimals (incl. a trailing ".") type smoothly; `quantity` is the
  // derived numeric value rounded to 2 dp (fractional shares, matching the API's 2-dp limit).
  const [quantityInput, setQuantityInput] = useState("1");
  const quantity = Math.round((Number(quantityInput) || 0) * 100) / 100;
  const [pending, setPending] = useState<"buy" | "sell" | null>(null);
  const [result, setResult] = useState<TradeResult | null>(null);
  // The quantity actually traded, snapshotted at execution time so the receipt is
  // frozen (the API's TradeResult doesn't echo quantity — flagged as a BE gap).
  const [resultQty, setResultQty] = useState<number | null>(null);
  // Shares the user holds of this stock (null = unknown/not yet loaded).
  const [owned, setOwned] = useState<number | null>(null);
  // Wallet balance and the stock's outstanding supply (null = unknown/not yet loaded),
  // used to estimate how much the user can afford / is allowed to buy.
  const [balance, setBalance] = useState<number | null>(null);
  // Authoritative float + per-trader cap from analytics (so the "max you can buy"
  // matches what the server will allow).
  const [totalShares, setTotalShares] = useState<number | null>(null);
  const [ownershipCapPct, setOwnershipCapPct] = useState<number | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);
  // Accurate, fee-inclusive buy estimate from the server (debounced). Computed with the
  // same engine as a real trade, so the shown total matches what the wallet is charged.
  const [quote, setQuote] = useState<TradeQuote | null>(null);

  useEffect(() => {
    if (!user || !(quantity > 0) || !(currentPrice > 0)) return;
    let cancelled = false;
    const t = setTimeout(() => {
      getTradeQuote(stockId, quantity, "buy")
        .then((q) => {
          if (!cancelled) setQuote(q);
        })
        .catch(() => {
          /* leave the last good quote; the local fallback covers the estimate */
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, stockId, quantity, currentPrice]);

  const loadOwned = useCallback(() => {
    if (!user) return;
    getHoldings()
      .then((page) => {
        const holding = page.items.find((h) => h.stockId === stockId);
        setOwned(holding ? holding.quantity : 0);
      })
      .catch(() => setOwned(null));
  }, [user, stockId]);

  const loadWallet = useCallback(() => {
    if (!user) return;
    getWallet()
      .then((w) => setBalance(w.balance))
      .catch(() => setBalance(null));
  }, [user]);

  useEffect(() => {
    loadOwned();
    loadWallet();
  }, [loadOwned, loadWallet]);

  useEffect(() => {
    let cancelled = false;
    getStockAnalytics(stockId)
      .then((a) => {
        if (cancelled) return;
        setTotalShares(a.totalShares);
        setOwnershipCapPct(a.maxOwnershipPercentage);
      })
      .catch(() => {
        if (!cancelled) {
          setTotalShares(null);
          setOwnershipCapPct(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [stockId]);

  // Per-trader ownership cap as a fraction — the BE value, falling back to the
  // documented default until analytics loads.
  const capFraction =
    ownershipCapPct != null && ownershipCapPct > 0 && ownershipCapPct < 100
      ? ownershipCapPct / 100
      : POSITION_LIMIT;
  const capPctLabel = Math.round(capFraction * 100);
  // How many more shares the cap allows, solving
  // (owned + q)/(supply + q) ≤ cap  →  q ≤ (cap·supply − owned)/(1 − cap).
  // Only applies once a supply exists (the first buyer is unrestricted on the BE).
  const positionHeadroom =
    totalShares != null && totalShares > 0 && owned != null
      ? Math.max(0, (capFraction * totalShares - owned) / (1 - capFraction))
      : null;
  // Only trust the quote when it's for the currently-entered quantity (ignore in-flight/stale).
  const liveQuote = quote && quote.quantity === quantity ? quote : null;
  // Effective fee rate from the latest quote (progressive, so size-dependent); 0 until one loads.
  const quoteFeeRate =
    liveQuote && liveQuote.grossAmount > 0
      ? liveQuote.fee / liveQuote.grossAmount
      : 0;

  // What the wallet can afford, now fee-aware: the BE prices a buy at the *average* over the
  // move (slippage) AND charges the progressive fee on top, so discount by both. Trim 0.5%
  // so "Max" doesn't trip INSUFFICIENT_BALANCE.
  const affordable =
    balance != null && currentPrice > 0
      ? (balance / (currentPrice * (1 + quoteFeeRate))) * 0.995
      : null;
  const maxBuyRaw = Math.min(
    affordable ?? Infinity,
    positionHeadroom ?? Infinity,
  );
  const maxBuy = Number.isFinite(maxBuyRaw)
    ? Math.floor(maxBuyRaw * 100) / 100
    : null;

  // Estimated total debit: the exact fee-inclusive figure from the quote when available,
  // else a local cost (qty × price) as a fallback while the quote is loading.
  const localCost =
    currentPrice > 0 && Number.isFinite(quantity) ? quantity * currentPrice : 0;
  const estTotal = liveQuote ? liveQuote.total : localCost;
  const overBalance = balance != null && estTotal > balance;

  function adjustQty(delta: number) {
    const next = Math.max(
      0.01,
      Math.round(((Number(quantityInput) || 0) + delta) * 100) / 100,
    );
    setQuantityInput(String(next));
  }

  function setFraction(fraction: number) {
    if (maxBuy == null || maxBuy <= 0) return;
    const q = Math.max(0.01, Math.floor(maxBuy * fraction * 100) / 100);
    setQuantityInput(String(q));
  }

  // Tick once a cooldown is armed; clear it (and the timer) when it elapses.
  useEffect(() => {
    if (cooldownUntil === 0) return;
    // Prime the tick so the countdown reads correctly on first paint — the
    // documented exception to react-hooks/set-state-in-effect.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setNow(Date.now());
    const id = setInterval(() => {
      const t = Date.now();
      if (t >= cooldownUntil) {
        setCooldownUntil(0);
      } else {
        setNow(t);
      }
    }, 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownRemaining =
    cooldownUntil > 0 ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const onCooldown = cooldownRemaining > 0;

  // Single source for the receipt quantity: the server-echoed value when present
  // (OsuStocks.API #31), else the quantity snapshotted at execution time.
  const receiptQty = result?.quantity ?? resultQty ?? 0;

  const messageForError = useCallback((err: unknown): string => {
    if (!(err instanceof ApiError)) return "Something went wrong. Please try again.";
    switch (err.code) {
      case "TRADE_COOLDOWN":
        return "You're trading too fast. Please wait a moment (30s per stock) and try again.";
      case "POSITION_LIMIT_EXCEEDED":
        return "Position limit reached. You can hold at most 25% of a stock.";
      case "INVALID_STATE":
        return err.message || "Not enough balance or shares to complete this trade.";
      case "MAINTENANCE_MODE":
        return "Trading is temporarily unavailable for maintenance. Please try again later.";
      case "VALIDATION_ERROR":
        return err.message || "Invalid trade request.";
      default:
        return err.message || "Trade failed. Please try again.";
    }
  }, []);

  if (!user) {
    return (
      <Card>
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Trade
        </h2>
        <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-500">
            <Lock size={20} weight="bold" />
          </div>
          <p className="text-sm font-medium text-zinc-100">Sign in to trade</p>
          <p className="mt-1.5 max-w-xs text-sm text-zinc-400">
            Log in to buy or sell shares of this player.
          </p>
          <Link
            href="/login"
            className={buttonClasses({ variant: "primary", size: "md", className: "mt-6" })}
          >
            Log in
          </Link>
        </div>
      </Card>
    );
  }

  async function execute(action: "buy" | "sell") {
    if (pending || onCooldown) return;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      notify({ tone: "danger", title: "Invalid quantity", message: "Quantity must be at least 0.01." });
      return;
    }
    // Client-side guard so an oversell doesn't burn a round-trip for a vague error.
    if (action === "sell" && owned != null && quantity > owned) {
      notify({
        tone: "danger",
        title: "Not enough shares",
        message: `You only own ${formatShares(owned)} share${owned === 1 ? "" : "s"} of this stock.`,
      });
      return;
    }
    setPending(action);
    setResult(null);
    try {
      const fn = action === "buy" ? buy : sell;
      const res = await fn({ stockId, quantity });
      setResult(res);
      setResultQty(quantity);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      analytics.track("trade_executed", {
        stockId,
        action,
        quantity,
        total: res.totalAmount,
      });
      notify({
        tone: "success",
        title: `${action === "buy" ? "Bought" : "Sold"} ${formatShares(quantity)} share${quantity === 1 ? "" : "s"}`,
      });
      // Refresh the user's holding + wallet here and the parent's price/chart/analytics.
      loadOwned();
      loadWallet();
      onTraded?.();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "UNKNOWN";
      if (code === "TRADE_COOLDOWN") setCooldownUntil(Date.now() + COOLDOWN_MS);
      analytics.track("trade_rejected", { stockId, action, reason: code });
      notify({ tone: "danger", title: "Trade failed", message: messageForError(err) });
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
        Trade
      </h2>

      <div className="mt-5 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="trade-quantity"
            className="text-xs uppercase tracking-wider text-zinc-500"
          >
            Quantity
          </label>
          {balance != null && (
            <span className="text-xs text-zinc-500">
              Balance{" "}
              <span className="font-mono tabular-nums text-zinc-300">
                <Money value={balance} />
              </span>
            </span>
          )}
        </div>

        {/* −/+ stepper around the input — replaces the native number spinners. */}
        <div className="flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => adjustQty(-1)}
            disabled={quantity <= 0.01}
            aria-label="Decrease quantity"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-100 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            <Minus size={16} weight="bold" />
          </button>
          <input
            id="trade-quantity"
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            className="no-spinner h-11 min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 text-center text-sm font-mono tabular-nums text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
          <button
            type="button"
            onClick={() => adjustQty(1)}
            aria-label="Increase quantity"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-100 active:scale-[0.97]"
          >
            <Plus size={16} weight="bold" />
          </button>
        </div>

        {/* Quick-size presets — fractions of the most you're allowed to buy. */}
        {maxBuy != null && maxBuy > 0 && (
          <div className="flex items-center gap-2">
            {[
              { label: "25%", fraction: 0.25 },
              { label: "50%", fraction: 0.5 },
              { label: "Max", fraction: 1 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFraction(preset.fraction)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-pink-500/40 hover:bg-zinc-800/70 hover:text-pink-200 active:scale-[0.97]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Live order estimate so the cost is obvious before committing. */}
        {quantity > 0 && currentPrice > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/40 px-3.5 py-2.5 text-xs">
            <span className="text-zinc-500">Est. cost{liveQuote ? " (incl. fee)" : ""}</span>
            <span
              className={`font-mono tabular-nums ${overBalance ? "text-rose-300" : "text-zinc-200"}`}
            >
              &asymp; <Money value={estTotal} />
            </span>
          </div>
        )}

        {/* The buy estimate now includes the progressive service fee (quoted server-side with
            the same engine as a real trade), so it matches what the wallet is charged. */}
        {quantity > 0 && currentPrice > 0 && (
          <p className="text-[11px] leading-relaxed text-zinc-500">
            {liveQuote ? (
              <>
                Includes a <Money value={liveQuote.fee} /> progressive service fee
                (added on top when buying; taken from proceeds when selling).
              </>
            ) : (
              <>
                A progressive service fee is added on top of a buy — keep a little
                balance spare beyond the estimate.
              </>
            )}
          </p>
        )}

        {/* Concrete buying power when known, else the generic cap note. */}
        {maxBuy != null && maxBuy > 0 ? (
          <p className="text-xs text-zinc-500">
            You can buy up to{" "}
            <button
              type="button"
              onClick={() => setFraction(1)}
              className="rounded font-mono tabular-nums text-zinc-300 underline-offset-2 transition-colors hover:text-pink-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
            >
              {formatShares(maxBuy)}
            </button>{" "}
            share{maxBuy === 1 ? "" : "s"} — capped by your balance (fee included)
            and the {capPctLabel}% per-trader limit.
          </p>
        ) : (
          <p className="text-xs text-zinc-500">
            Limit: up to {capPctLabel}% of a player&apos;s outstanding shares per
            trader.
          </p>
        )}

        {owned != null && owned > 0 && (
          <button
            type="button"
            onClick={() => setQuantityInput(String(owned))}
            className="self-start rounded text-xs text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
          >
            You own{" "}
            <span className="font-mono tabular-nums text-zinc-200">
              {formatShares(owned)}
            </span>{" "}
            — sell max
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="success"
          onClick={() => execute("buy")}
          loading={pending === "buy"}
          disabled={pending !== null || onCooldown || overBalance || quantity <= 0}
          aria-describedby={overBalance ? "buy-balance-hint" : undefined}
        >
          {pending !== "buy" && <ArrowUp size={16} weight="bold" />}
          {pending === "buy" ? "Buying..." : "Buy"}
        </Button>
        <Button
          variant="danger"
          onClick={() => execute("sell")}
          loading={pending === "sell"}
          disabled={
            pending !== null || onCooldown || owned == null || owned === 0 || quantity <= 0
          }
        >
          {pending !== "sell" && <ArrowDown size={16} weight="bold" />}
          {pending === "sell" ? "Selling..." : "Sell"}
        </Button>
      </div>

      {/* Explain why Buy is disabled when the order exceeds the wallet balance. */}
      {overBalance && (
        <p id="buy-balance-hint" className="mt-2 text-xs text-rose-300">
          This order costs more than your balance. Lower the quantity or use a
          quick-size preset to buy what you can afford.
        </p>
      )}

      <AnimatePresence>
        {onCooldown && (
          <motion.div
            key="cooldown"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mt-4 flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-400"
          >
            <Timer size={16} weight="bold" className="shrink-0 text-zinc-500" />
            <span>
              You can trade this stock again in{" "}
              <span className="font-mono tabular-nums text-zinc-200">
                {cooldownRemaining}s
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            key="trade-result"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={18} weight="bold" className="shrink-0" />
              <span className="font-medium">Trade complete</span>
              <Badge tone="success" className="ml-auto capitalize">
                {result.status}
              </Badge>
            </div>

            <dl className="mt-4 space-y-2 border-t border-emerald-500/20 pt-3">
              <div className="flex items-center justify-between">
                <dt className="text-emerald-300/70">Quantity</dt>
                <dd className="font-mono tabular-nums text-emerald-200">
                  {formatShares(receiptQty)} share{receiptQty === 1 ? "" : "s"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-emerald-300/70">Unit price</dt>
                <dd className="font-mono tabular-nums text-emerald-200">
                  <Money value={result.unitPrice} />
                </dd>
              </div>
              {(result.fee ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-emerald-300/70">Service fee</dt>
                  <dd className="font-mono tabular-nums text-emerald-200">
                    <Money value={result.fee ?? 0} />
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-emerald-500/20 pt-2">
                <dt className="text-emerald-300/70">Total</dt>
                <dd className="font-mono text-base font-semibold tabular-nums text-emerald-100">
                  <Money value={result.totalAmount} />
                </dd>
              </div>
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function RecentTopPlays({ stockId }: { stockId: string }) {
  const [plays, setPlays] = useState<TopPlay[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStockTopPlays(stockId, 5)
      .then((data) => {
        if (!cancelled) setPlays(data);
      })
      .catch(() => {
        if (!cancelled) setPlays([]);
      });
    return () => {
      cancelled = true;
    };
  }, [stockId]);

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <Trophy size={18} weight="bold" className="text-amber-400" />
        <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
          Recent top plays
        </h2>
      </div>

      {plays === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : plays.length === 0 ? (
        <EmptyState
          title="No recent top plays"
          message="When this player sets a new top play, its market impact shows up here."
          icon={<Trophy size={20} weight="bold" />}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {plays.map((play) => (
            <li
              key={`${play.scoreId}-${play.occurredAt}`}
              className="relative overflow-hidden rounded-xl border border-zinc-800/60"
            >
              {/* Blurred beatmap cover behind the row, osu!-style, with a dark
                  left-to-right scrim so the text stays legible. */}
              {play.coverUrl && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={play.coverUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    width={900}
                    height={250}
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/80 to-zinc-950/40" />
                </>
              )}

              <div className="relative flex items-center justify-between gap-3 px-3.5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30">
                    <Trophy size={16} weight="fill" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-semibold tabular-nums text-zinc-50">
                      {play.pp != null
                        ? `${formatNumber(Math.round(play.pp))}pp`
                        : "New top play"}
                    </div>
                    {play.title && (
                      <div className="truncate text-[11px] text-zinc-300">
                        {play.title}
                      </div>
                    )}
                    <div className="font-mono text-[10px] tabular-nums text-zinc-400">
                      {formatDateTime(play.occurredAt)}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {play.percentChange != null && (
                    <PriceChange
                      value={play.percentChange}
                      format="percent"
                      className="text-sm"
                    />
                  )}
                  {play.scoreId > 0 && (
                    <a
                      href={`https://osu.ppy.sh/scores/${play.scoreId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View score on osu!"
                      className="text-zinc-400 transition-colors hover:text-pink-400"
                    >
                      <ArrowSquareOut size={16} weight="bold" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/**
 * osu!-userpage-style cover. Renders the player's real osu! profile banner when
 * the API supplies one (`cover.url`), and falls back to osu!'s pink-gradient
 * default otherwise — so it degrades cleanly until the backend syncs covers, and
 * recovers gracefully if a banner URL 404s.
 */
function ProfileCover({ bannerUrl }: { bannerUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const showBanner = Boolean(bannerUrl) && !failed;

  return (
    <div className="relative h-28 sm:h-36">
      {showBanner ? (
        <>
          {/* osu! covers redirect to arbitrary hosts; a plain <img> tolerates any
              host and degrades to the gradient on error (same rationale as Avatar). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl as string}
            alt=""
            aria-hidden="true"
            onError={() => setFailed(true)}
            width={1500}
            height={500}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Bottom-up scrim keeps the badge + overlapping avatar/name legible. */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-zinc-950/5" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/45 via-pink-500/10 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_150%_at_12%_-30%,rgba(236,72,153,0.40),transparent_55%)]" />
        </>
      )}
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.12]" />
      <span className="absolute left-5 top-4 rounded-md bg-zinc-950/40 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 backdrop-blur">
        Player Stock
      </span>
    </div>
  );
}

export function StockDetail({ stockId }: { stockId: string }) {
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  // Bumped after a trade so the price/volume header + chart + analytics refresh.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTraded = useCallback(() => {
    // Silently refresh the header price/volume so it isn't stale after the
    // trade the user just made (no skeleton — keep the page in place).
    getStock(stockId)
      .then((data) => setStock(data))
      .catch(() => {});
    setRefreshKey((k) => k + 1);
  }, [stockId]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setNotFound(false);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getStock(stockId)
      .then((data) => {
        if (cancelled) return;
        setStock(data);
        analytics.track("stock_viewed", { stockId, player: data.playerName });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
        } else if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError ? err.message : "Failed to load this stock.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stockId]);

  const backLink = (
    <Link
      href="/"
      className="group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
    >
      <CaretLeft
        size={16}
        weight="bold"
        className="transition-transform group-hover:-translate-x-0.5"
      />
      Market
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Skeleton className="h-5 w-24" />
        <div className="mt-8 flex flex-col gap-4 border-b border-zinc-800/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-6 md:col-span-2">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl md:col-span-1" />
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {backLink}
        <div className="mt-8">
          <EmptyState
            title="Please log in"
            message="You need to be signed in to view this stock."
            icon={<Lock size={20} weight="bold" />}
            action={
              <Link href="/login" className={buttonClasses({ variant: "primary" })}>
                Log in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {backLink}
        <div className="mt-8">
          <EmptyState
            title="Stock not found"
            message="We couldn't find a stock with that id."
            icon={<WarningCircle size={20} weight="bold" />}
            action={
              <Link href="/" className={buttonClasses({ variant: "secondary" })}>
                Back to market
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {backLink}
        <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
          <span>{error ?? "Failed to load this stock."}</span>
        </div>
        <Link
          href="/"
          className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-6" })}
        >
          Back to market
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {backLink}

      <Reveal className="mt-8">
        {/* osu!-userpage-style profile header: cover banner, overlapping avatar, stat tiles. */}
        <header className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
          {/* Cover banner — real osu! profile cover when available, else gradient. */}
          <ProfileCover bannerUrl={stock.bannerUrl} />

          <div className="px-5 pb-6 sm:px-7">
            {/* Identity row — avatar overlaps the banner */}
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="shrink-0 rounded-full ring-4 ring-zinc-900 shadow-xl shadow-black/40">
                  <Avatar src={stock.avatarUrl} name={stock.playerName} size="xl" />
                </div>
                <div className="pb-1">
                  <h1 className="text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl">
                    {stock.playerName}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                    {stock.countryCode && (
                      <span className="inline-flex items-center rounded-md bg-zinc-800/70 px-1.5 py-1 ring-1 ring-inset ring-zinc-700/50">
                        <Flag countryCode={stock.countryCode} className="h-3.5" />
                      </span>
                    )}
                    {stock.globalRank != null && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/70 px-2 py-0.5 font-mono tabular-nums text-zinc-300 ring-1 ring-inset ring-zinc-700/50">
                        <span className="text-zinc-500">#</span>
                        {formatNumber(stock.globalRank)}
                      </span>
                    )}
                    {stock.currentPp != null && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-pink-500/10 px-2 py-0.5 font-mono tabular-nums text-pink-300 ring-1 ring-inset ring-pink-500/25">
                        {formatNumber(Math.round(stock.currentPp))}
                        <span className="text-pink-400/70">pp</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={`https://osu.ppy.sh/users/${encodeURIComponent(stock.playerName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 self-start rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-pink-500/40 hover:text-pink-300 sm:self-auto"
              >
                View on osu!
                <ArrowSquareOut size={14} weight="bold" />
              </a>
            </div>

            {/* osu!-style stat tiles */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Price</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                  <Money value={stock.currentPrice} />
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">24h</div>
                <div className="mt-1.5">
                  <PriceChange value={stock.priceChange24h} className="text-lg" />
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Global Rank</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                  {stock.globalRank != null ? `#${formatNumber(stock.globalRank)}` : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">PP</div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                  {stock.currentPp != null ? formatNumber(Math.round(stock.currentPp)) : "—"}
                </div>
              </div>
              <div className="col-span-2 rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3 sm:col-span-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Volume</div>
                <div className="mt-1 inline-flex items-center gap-1.5 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                  <Coins size={18} weight="bold" className="text-zinc-500" />
                  {formatNumber(stock.volume)}
                </div>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <Reveal delay={0.08}>
            <PriceChartCard stockId={stockId} refreshKey={refreshKey} />
          </Reveal>

          <Reveal delay={0.12}>
            <AnalyticsPanel stockId={stockId} refreshKey={refreshKey} />
          </Reveal>

          <Reveal delay={0.14}>
            <RecentTopPlays stockId={stockId} />
          </Reveal>
        </div>

        <div className="md:col-span-1">
          <Reveal delay={0.16}>
            <TradePanel
              stockId={stockId}
              currentPrice={stock.currentPrice}
              onTraded={handleTraded}
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

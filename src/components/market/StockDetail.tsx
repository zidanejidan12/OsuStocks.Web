"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
} from "@/lib/api/types";
import {
  getStock,
  getStockCandles,
  getStockAnalytics,
  getStockTopPlays,
  buy,
  sell,
  ApiError,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";
import * as analytics from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Money } from "@/components/ui/Money";
import { Coin } from "@/components/ui/Coin";
import { Avatar } from "@/components/ui/Avatar";
import { scaleIn, EASE_OUT_EXPO } from "@/lib/motion";
import {
  formatNumber,
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
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {candles.map((c, i) => {
          const cx = CHART_PAD + slot * i + slot / 2;
          const up = c.close >= c.open;
          const color = up ? "#34d399" : "#fb7185"; // emerald-400 / rose-400
          const yOpen = yFor(c.open);
          const yClose = yFor(c.close);
          const bodyY = Math.min(yOpen, yClose);
          const bodyH = Math.max(1, Math.abs(yOpen - yClose));
          return (
            <g key={c.timestamp + i}>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
      />
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
      />
    </svg>
  );
}

function PriceChartCard({ stockId }: { stockId: string }) {
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
                  className={`grid h-7 w-7 place-items-center rounded-md transition-colors ${
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
                className={`rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
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
            <span className="pointer-events-none absolute right-0 top-0 font-mono text-[11px] tabular-nums text-zinc-500">
              <Money value={max} />
            </span>
            <span className="pointer-events-none absolute bottom-0 right-0 font-mono text-[11px] tabular-nums text-zinc-500">
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
              <span className="font-mono text-[10px] tabular-nums text-zinc-600">
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
              <span className="font-mono text-[10px] tabular-nums text-zinc-600">
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

function AnalyticsPanel({ stockId }: { stockId: string }) {
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
        </div>
      )}
    </Card>
  );
}

function TradePanel({ stockId }: { stockId: string }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState<"buy" | "sell" | null>(null);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

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
    if (!Number.isFinite(quantity) || quantity < 1) {
      notify({ tone: "danger", title: "Invalid quantity", message: "Quantity must be at least 1." });
      return;
    }
    setPending(action);
    setResult(null);
    try {
      const fn = action === "buy" ? buy : sell;
      const res = await fn({ stockId, quantity });
      setResult(res);
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      analytics.track("trade_executed", {
        stockId,
        action,
        quantity,
        total: res.totalAmount,
      });
      notify({
        tone: "success",
        title: `${action === "buy" ? "Bought" : "Sold"} ${quantity} share${quantity === 1 ? "" : "s"}`,
      });
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

      <div className="mt-5 flex flex-col gap-2">
        <label
          htmlFor="trade-quantity"
          className="text-xs uppercase tracking-wider text-zinc-500"
        >
          Quantity
        </label>
        <input
          id="trade-quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm font-mono tabular-nums text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
        {/* Position-limit hint, surfaced before the user commits. */}
        <p className="text-xs text-zinc-500">
          Limit: up to 25% of a player&apos;s outstanding shares per trader.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={() => execute("buy")}
          disabled={pending !== null || onCooldown}
          className="!bg-emerald-500 hover:!bg-emerald-400 !shadow-[0_10px_30px_-12px_rgba(16,185,129,0.7)]"
        >
          <ArrowUp size={16} weight="bold" />
          {pending === "buy" ? "Buying..." : "Buy"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => execute("sell")}
          disabled={pending !== null || onCooldown}
          className="!border-rose-500/40 !text-rose-300 hover:!border-rose-500/60 hover:!bg-rose-500/10"
        >
          <ArrowDown size={16} weight="bold" />
          {pending === "sell" ? "Selling..." : "Sell"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
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
                  {formatNumber(quantity)} share{quantity === 1 ? "" : "s"}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-emerald-300/70">Unit price</dt>
                <dd className="font-mono tabular-nums text-emerald-200">
                  <Money value={result.unitPrice} />
                </dd>
              </div>
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
                    <PriceChange value={play.percentChange} className="text-sm" />
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

export function StockDetail({ stockId }: { stockId: string }) {
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

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
        <header className="flex flex-col gap-6 border-b border-zinc-800/60 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={stock.avatarUrl} name={stock.playerName} size="lg" />
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                Player Stock
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-zinc-100 md:text-4xl">
                {stock.playerName}
              </h1>
            </div>
          </div>

          <div className="flex items-end gap-8">
            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-3xl font-semibold tabular-nums text-zinc-50 md:text-4xl">
                <Money value={stock.currentPrice} />
              </span>
              <PriceChange value={stock.priceChange24h} className="text-sm" />
            </div>
            <div className="hidden h-12 w-px bg-zinc-800/80 sm:block" />
            <div className="hidden sm:block">
              <Stat
                label="Volume"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Coins size={18} weight="bold" className="text-zinc-500" />
                    {formatNumber(stock.volume)}
                  </span>
                }
              />
            </div>
          </div>
        </header>
      </Reveal>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <Reveal delay={0.08}>
            <PriceChartCard stockId={stockId} />
          </Reveal>

          <Reveal delay={0.12}>
            <AnalyticsPanel stockId={stockId} />
          </Reveal>

          <Reveal delay={0.14}>
            <RecentTopPlays stockId={stockId} />
          </Reveal>
        </div>

        <div className="md:col-span-1">
          <Reveal delay={0.16}>
            <TradePanel stockId={stockId} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}

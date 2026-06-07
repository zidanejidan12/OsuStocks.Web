"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft,
  ChartLineUp,
  CheckCircle,
  WarningCircle,
  Lock,
  ArrowUp,
  ArrowDown,
  Coins,
} from "@phosphor-icons/react";
import type { PricePoint, StockSummary, TradeResult } from "@/lib/api/types";
import {
  getStock,
  getStockHistory,
  buy,
  sell,
  ApiError,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { scaleIn, EASE_OUT_EXPO } from "@/lib/motion";
import { formatNumber, formatDateTime } from "@/lib/format";

/**
 * Dependency-free premium area chart computed from price history.
 * Gradient fill + crisp line, colored by trend, with an animated draw-in.
 */
function AreaChart({ points }: { points: PricePoint[] }) {
  const width = 640;
  const height = 200;
  const pad = 10;

  if (points.length < 2) {
    return (
      <EmptyState
        title="Not enough history"
        message="Price history will appear here once more data is available."
        icon={<ChartLineUp size={20} weight="bold" />}
      />
    );
  }

  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = pad + (height - pad * 2) * (1 - (p.price - min) / span);
    return { x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");

  const areaPath =
    `M${coords[0].x.toFixed(2)},${(height - pad).toFixed(2)} ` +
    coords.map((c) => `L${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ") +
    ` L${coords[coords.length - 1].x.toFixed(2)},${(height - pad).toFixed(2)} Z`;

  const first = prices[0];
  const last = prices[prices.length - 1];
  const rising = last >= first;
  const stroke = rising ? "#34d399" : "#fb7185"; // emerald-400 / rose-400
  // Stable-ish gradient id so multiple charts don't collide.
  const gradientId = `area-grad-${rising ? "up" : "down"}`;

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
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

          {/* Gradient area fades in beneath the line. */}
          <motion.path
            d={areaPath}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 }}
          />

          {/* Crisp line draws in left-to-right via pathLength. */}
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

        {/* Min / max guides in mono. */}
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
            First
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-300">
            <Money value={first} />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-zinc-600">
            {formatDateTime(points[0].timestamp)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            Last
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-300">
            <Money value={last} />
          </span>
          <span className="font-mono text-[10px] tabular-nums text-zinc-600">
            {formatDateTime(points[points.length - 1].timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TradePanel({ stockId }: { stockId: string }) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState<"buy" | "sell" | null>(null);
  const [result, setResult] = useState<TradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  function messageForError(err: unknown): string {
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
  }

  async function execute(action: "buy" | "sell") {
    if (pending) return;
    if (!Number.isFinite(quantity) || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    setPending(action);
    setError(null);
    setResult(null);
    try {
      const fn = action === "buy" ? buy : sell;
      const res = await fn({ stockId, quantity });
      setResult(res);
    } catch (err) {
      setError(messageForError(err));
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
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={() => execute("buy")}
          disabled={pending !== null}
          className="!bg-emerald-500 hover:!bg-emerald-400 !shadow-[0_10px_30px_-12px_rgba(16,185,129,0.7)]"
        >
          <ArrowUp size={16} weight="bold" />
          {pending === "buy" ? "Buying..." : "Buy"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => execute("sell")}
          disabled={pending !== null}
          className="!border-rose-500/40 !text-rose-300 hover:!border-rose-500/60 hover:!bg-rose-500/10"
        >
          <ArrowDown size={16} weight="bold" />
          {pending === "sell" ? "Selling..." : "Sell"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="trade-error"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
          >
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
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

export function StockDetail({ stockId }: { stockId: string }) {
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Resetting fetch state synchronously is intentional: it shows the loading
    // skeleton while we refetch for the new stockId — the documented exception to
    // react-hooks/set-state-in-effect (this is not the derive-state anti-pattern).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setNotFound(false);
    setUnauthorized(false);
    setHistoryLoaded(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getStock(stockId)
      .then((data) => {
        if (!cancelled) setStock(data);
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

    // History is non-critical: failure should not block the page.
    getStockHistory(stockId)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoaded(true);
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

      {/* Asymmetric header: name on the left, price + change + volume on the right. */}
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
            <Card>
              <div className="mb-5 flex items-center gap-2">
                <ChartLineUp size={18} weight="bold" className="text-pink-400" />
                <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                  Price history
                </h2>
              </div>
              {!historyLoaded ? (
                <div className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl sm:h-56" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ) : history.length === 0 ? (
                <EmptyState
                  title="No price history"
                  message="There's no recorded price history for this stock yet."
                  icon={<ChartLineUp size={20} weight="bold" />}
                />
              ) : (
                <AreaChart points={history} />
              )}
            </Card>
          </Reveal>

          {/* Volume reprised on mobile, where the header stat is hidden. */}
          <Reveal delay={0.12} className="sm:hidden">
            <Card>
              <Stat
                label="Volume"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Coins size={18} weight="bold" className="text-zinc-500" />
                    {formatNumber(stock.volume)}
                  </span>
                }
              />
            </Card>
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

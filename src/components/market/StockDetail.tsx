"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/format";

/** Inline SVG sparkline computed from price history. No chart library. */
function Sparkline({ points }: { points: PricePoint[] }) {
  const width = 640;
  const height = 160;
  const pad = 8;

  if (points.length < 2) {
    return (
      <EmptyState
        title="Not enough history"
        message="Price history will appear here once more data is available."
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

  const rising = prices[prices.length - 1] >= prices[0];
  const stroke = rising ? "#34d399" : "#fb7185"; // emerald-400 / rose-400

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label="Price history sparkline"
      >
        <path d={areaPath} fill={stroke} fillOpacity={0.12} />
        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>{formatDateTime(points[0].timestamp)}</span>
        <span>{formatDateTime(points[points.length - 1].timestamp)}</span>
      </div>
    </div>
  );
}

function LoginNotice() {
  return (
    <Card>
      <p className="text-sm text-zinc-300">
        Please log in to continue.{" "}
        <Link href="/login" className="text-pink-400 hover:text-pink-300">
          Go to login
        </Link>
      </p>
    </Card>
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
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Trade</h2>
        <p className="text-sm text-zinc-400">
          <Link href="/login" className="text-pink-400 hover:text-pink-300">
            Log in
          </Link>{" "}
          to buy or sell shares.
        </p>
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
      <h2 className="mb-3 text-sm font-semibold text-zinc-200">Trade</h2>

      <label className="block text-xs uppercase tracking-wide text-zinc-400">
        Quantity
      </label>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
        className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-pink-500 focus:outline-none"
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => execute("buy")}
          disabled={pending !== null}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending === "buy" ? "Buying..." : "Buy"}
        </button>
        <button
          type="button"
          onClick={() => execute("sell")}
          disabled={pending !== null}
          className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending === "sell" ? "Selling..." : "Sell"}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-rose-900/60 bg-rose-950/30 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-3 text-sm text-emerald-200">
          <div className="font-medium capitalize">Trade {result.status}</div>
          <div className="mt-1 text-emerald-300/90">
            {formatNumber(quantity)} share{quantity === 1 ? "" : "s"} @{" "}
            {formatCurrency(result.unitPrice)} ={" "}
            <span className="font-semibold">{formatCurrency(result.totalAmount)}</span>
          </div>
        </div>
      )}
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
    setLoading(true);
    setError(null);
    setNotFound(false);
    setUnauthorized(false);
    setHistoryLoaded(false);

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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label="Loading stock..." />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <LoginNotice />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <EmptyState
          title="Stock not found"
          message="We couldn't find a stock with that id."
          action={
            <Link href="/" className="text-pink-400 hover:text-pink-300">
              Back to market
            </Link>
          }
        />
      </main>
    );
  }

  if (error || !stock) {
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm text-rose-300">
          {error ?? "Failed to load this stock."}
        </div>
        <Link
          href="/"
          className="mt-4 inline-block text-sm text-pink-400 hover:text-pink-300"
        >
          Back to market
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        ← Back to market
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-100">{stock.playerName}</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-zinc-100">
            {formatCurrency(stock.currentPrice)}
          </span>
          <PriceChange value={stock.priceChange24h} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-zinc-200">
              Price history
            </h2>
            {!historyLoaded ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner label="Loading history..." />
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                title="No price history"
                message="There's no recorded price history for this stock yet."
              />
            ) : (
              <Sparkline points={history} />
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <Stat
                label="Current Price"
                value={formatCurrency(stock.currentPrice)}
                sub={<PriceChange value={stock.priceChange24h} className="text-sm" />}
              />
            </Card>
            <Card>
              <Stat label="Volume" value={formatNumber(stock.volume)} />
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <TradePanel stockId={stockId} />
        </div>
      </div>
    </main>
  );
}

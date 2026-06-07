"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolio, ApiError } from "@/lib/api/client";
import type { Portfolio } from "@/lib/api/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { PriceChange } from "@/components/ui/PriceChange";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/auth-context";

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        title="Please log in"
        message="You need to be signed in to view your portfolio."
        action={
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-400"
          >
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUnauthorized(false);

    getPortfolio()
      .then((data) => {
        if (cancelled) return;
        setPortfolio(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load portfolio."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (!user || unauthorized) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PleaseLogIn />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Portfolio</h1>

      {loading && <Spinner label="Loading portfolio…" />}

      {!loading && error && (
        <Card className="border-rose-900/60 bg-rose-950/30">
          <p className="text-sm text-rose-300">{error}</p>
        </Card>
      )}

      {!loading && !error && portfolio && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <Stat
                label="Current Value"
                value={formatCurrency(portfolio.currentValue)}
              />
            </Card>
            <Card>
              <Stat
                label="Cost Basis"
                value={formatCurrency(portfolio.costBasis)}
              />
            </Card>
            <Card>
              <Stat
                label="Profit / Loss"
                value={<PriceChange value={portfolio.profitLoss} />}
              />
            </Card>
          </div>

          {portfolio.holdings.length === 0 ? (
            <Card>
              <EmptyState
                title="No holdings yet"
                message="You don't own any stocks. Browse the market to start trading."
                action={
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-400"
                  >
                    Browse the market
                  </Link>
                }
              />
            </Card>
          ) : (
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
                      <th className="px-4 py-3 font-medium">Player</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Avg Price
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Current
                      </th>
                      <th className="px-4 py-3 text-right font-medium">Value</th>
                      <th className="px-4 py-3 text-right font-medium">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.holdings.map((h) => (
                      <tr
                        key={h.holdingId}
                        className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/stocks/${h.stockId}`}
                            className="font-medium text-zinc-100 hover:text-pink-400"
                          >
                            {h.playerName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                          {formatNumber(h.quantity)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                          {formatCurrency(h.averagePrice)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                          {formatCurrency(h.currentPrice)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-zinc-100">
                          {formatCurrency(h.currentValue)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <PriceChange value={h.profitLoss} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

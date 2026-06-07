"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChartPieSlice,
  CaretRight,
  WarningCircle,
  Lock,
  Coins,
} from "@phosphor-icons/react";
import { getPortfolio, ApiError } from "@/lib/api/client";
import type { Portfolio } from "@/lib/api/types";
import { formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { PriceChange } from "@/components/ui/PriceChange";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>
  );
}

function PageHeader() {
  return (
    <Reveal>
      <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
        Portfolio
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Your holdings, cost basis, and unrealized performance at a glance.
      </p>
    </Reveal>
  );
}

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        icon={<Lock size={20} weight="bold" />}
        title="Please log in"
        message="You need to be signed in to view your portfolio."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

// Divided summary band: three headline stats sharing one surface.
function SummaryBand({ portfolio }: { portfolio: Portfolio }) {
  return (
    <Card className="p-0">
      <dl className="grid grid-cols-1 divide-y divide-zinc-800 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="p-5 sm:p-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Current Value
          </dt>
          <dd className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-zinc-50 sm:text-3xl">
            <Money value={portfolio.currentValue} />
          </dd>
        </div>
        <div className="p-5 sm:p-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Cost Basis
          </dt>
          <dd className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-zinc-50 sm:text-3xl">
            <Money value={portfolio.costBasis} />
          </dd>
        </div>
        <div className="p-5 sm:p-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            Profit / Loss
          </dt>
          <dd className="mt-1.5">
            <PriceChange
              value={portfolio.profitLoss}
              className="text-2xl font-semibold sm:text-3xl"
            />
          </dd>
        </div>
      </dl>
    </Card>
  );
}

function HoldingsEmpty() {
  return (
    <Card>
      <EmptyState
        icon={<ChartPieSlice size={20} weight="bold" />}
        title="No holdings yet"
        message="You don't own any players yet. Browse the market to make your first trade."
        action={
          <Link
            href="/"
            className={buttonClasses({ size: "sm", className: "gap-1.5" })}
          >
            <Coins size={16} weight="bold" />
            Browse the market
          </Link>
        }
      />
    </Card>
  );
}

function HoldingsTable({ portfolio }: { portfolio: Portfolio }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3 text-left font-medium">Player</th>
            <th className="px-4 py-3 text-right font-medium">Quantity</th>
            <th className="px-4 py-3 text-right font-medium">Avg Price</th>
            <th className="px-4 py-3 text-right font-medium">Current</th>
            <th className="px-4 py-3 text-right font-medium">Value</th>
            <th className="px-4 py-3 text-right font-medium">P&amp;L</th>
          </tr>
        </thead>
        <motion.tbody
          className="divide-y divide-zinc-800/60"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {portfolio.holdings.map((h) => (
            <motion.tr
              key={h.holdingId}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={spring}
              className="group transition-colors hover:bg-zinc-900/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/stocks/${h.stockId}`}
                  className="inline-flex items-center gap-1 font-medium text-zinc-100 transition-colors hover:text-pink-400"
                >
                  {h.playerName}
                  <CaretRight
                    size={14}
                    weight="bold"
                    className="text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-pink-400"
                  />
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">
                {formatNumber(h.quantity)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">
                <Money value={h.averagePrice} />
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">
                <Money value={h.currentPrice} />
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-100">
                <Money value={h.currentValue} />
              </td>
              <td className="px-4 py-3 text-right">
                <PriceChange value={h.profitLoss} className="justify-end" />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}

// Skeleton mirrors the final summary band + holdings table layout.
function PortfolioSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <Card className="p-0">
        <div className="grid grid-cols-1 divide-y divide-zinc-800 md:grid-cols-3 md:divide-x md:divide-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 sm:p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
            </div>
          ))}
        </div>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/80">
        <div className="border-b border-zinc-800 px-4 py-3">
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="divide-y divide-zinc-800/60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-4"
            >
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-6">
                <Skeleton className="hidden h-4 w-16 sm:block" />
                <Skeleton className="hidden h-4 w-20 sm:block" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
      <PageShell>
        <PageHeader />
        <PortfolioSkeleton />
      </PageShell>
    );
  }

  if (!user || unauthorized) {
    return (
      <PageShell>
        <PageHeader />
        <div className="mt-8">
          <PleaseLogIn />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader />

      {loading && <PortfolioSkeleton />}

      {!loading && error && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <WarningCircle
            size={18}
            weight="bold"
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && portfolio && (
        <div className="mt-8 space-y-8">
          <Reveal>
            <SummaryBand portfolio={portfolio} />
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Holdings
            </h2>
            {portfolio.holdings.length === 0 ? (
              <HoldingsEmpty />
            ) : (
              <HoldingsTable portfolio={portfolio} />
            )}
          </Reveal>
        </div>
      )}
    </PageShell>
  );
}

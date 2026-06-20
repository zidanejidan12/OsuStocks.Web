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
  Medal,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import {
  getPortfolio,
  getInvestorLevel,
  getStocks,
  getStock,
  ApiError,
} from "@/lib/api/client";
import type {
  Portfolio,
  InvestorLevel,
  Me,
  StockSummary,
} from "@/lib/api/types";
import { formatNumber, formatShares } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { PriceChange } from "@/components/ui/PriceChange";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import * as analytics from "@/lib/analytics";

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

// osu!-userpage-style profile header for the signed-in investor: cover banner,
// overlapping avatar, country flag, and portfolio stats as tiles.
function ProfileHeader({
  user,
  portfolio,
}: {
  user: Me;
  portfolio: Portfolio | null;
}) {
  return (
    <Reveal>
      <header className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40">
        <div className="relative h-28 sm:h-36">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/45 via-pink-500/10 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_150%_at_12%_-30%,rgba(236,72,153,0.40),transparent_55%)]" />
          <div className="grain pointer-events-none absolute inset-0 opacity-[0.12]" />
          <span className="absolute left-5 top-4 rounded-md bg-zinc-950/40 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-200 backdrop-blur">
            Investor
          </span>
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="shrink-0 rounded-full ring-4 ring-zinc-900 shadow-xl shadow-black/40">
                <Avatar src={user.avatarUrl} name={user.username} size="xl" />
              </div>
              <div className="pb-1">
                <h1 className="text-3xl font-semibold tracking-tighter text-zinc-50 md:text-4xl">
                  {user.username}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                  {user.countryCode && (
                    <span className="inline-flex items-center rounded-md bg-zinc-800/70 px-1.5 py-1 ring-1 ring-inset ring-zinc-700/50">
                      <Flag countryCode={user.countryCode} className="h-3.5" />
                    </span>
                  )}
                  {user.role === "Admin" && (
                    <span className="rounded-md bg-pink-500/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-pink-300 ring-1 ring-inset ring-pink-500/25">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <a
              href={`https://osu.ppy.sh/users/${user.osuUserId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-pink-500/40 hover:text-pink-300 sm:self-auto"
            >
              View on osu!
              <ArrowSquareOut size={14} weight="bold" />
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Current Value
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                {portfolio ? <Money value={portfolio.currentValue} /> : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Cost Basis
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                {portfolio ? <Money value={portfolio.costBasis} /> : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Profit / Loss
              </div>
              <div className="mt-1.5">
                {portfolio ? (
                  <PriceChange
                    value={portfolio.profitLoss}
                    className="text-lg"
                  />
                ) : (
                  <span className="font-mono text-2xl font-semibold text-zinc-50">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/50 px-4 py-3">
              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Holdings
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                {portfolio ? formatNumber(portfolio.holdings.length) : "—"}
              </div>
            </div>
          </div>
        </div>
      </header>
    </Reveal>
  );
}

// If the signed-in user is themselves a tracked player, surface their own stock
// as a profile-detail card (price, rank, pp, 24h). Matches the user's osu!
// username to a market stock; renders nothing when they aren't tracked.
function YourStockCard({ user }: { user: Me }) {
  const [stock, setStock] = useState<StockSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStocks({ search: user.username, pageSize: 5 })
      .then(async (page) => {
        const match = page.items.find(
          (s) => s.playerName.toLowerCase() === user.username.toLowerCase(),
        );
        if (!match) {
          if (!cancelled) setStock(null);
          return;
        }
        // Fetch the full detail so we get rank/pp (the list endpoint omits them).
        const detail = await getStock(match.stockId);
        if (!cancelled) setStock(detail);
      })
      .catch(() => {
        if (!cancelled) setStock(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user.username]);

  if (!stock) return null;

  return (
    <Reveal>
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <ChartPieSlice size={18} weight="bold" className="text-pink-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Your Stock</h2>
          <span className="text-xs text-zinc-500">
            You&apos;re a tracked player — this is your market stock.
          </span>
        </div>

        <Link
          href={`/stocks/${stock.stockId}`}
          className="group flex flex-col gap-4 rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-4 transition-colors hover:border-pink-500/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Avatar src={stock.avatarUrl} name={stock.playerName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 group-hover:text-pink-300">
                  {stock.playerName}
                </span>
                {stock.countryCode && (
                  <Flag countryCode={stock.countryCode} className="h-3" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                {stock.globalRank != null && (
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono tabular-nums text-zinc-300 ring-1 ring-inset ring-zinc-700/50">
                    <span className="text-zinc-500">#</span>
                    {formatNumber(stock.globalRank)}
                  </span>
                )}
                {stock.currentPp != null && (
                  <span className="inline-flex items-center gap-1 rounded bg-pink-500/10 px-1.5 py-0.5 font-mono tabular-nums text-pink-300 ring-1 ring-inset ring-pink-500/25">
                    {formatNumber(Math.round(stock.currentPp))}
                    <span className="text-pink-400/70">pp</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                <Money value={stock.currentPrice} />
              </div>
              <PriceChange value={stock.priceChange24h} className="justify-end text-sm" />
            </div>
            <CaretRight
              size={18}
              weight="bold"
              className="text-zinc-600 transition-colors group-hover:text-pink-400"
            />
          </div>
        </Link>
      </Card>
    </Reveal>
  );
}

// Self-contained Investor Level card: fetches its own data so the rest of the
// page renders even if this endpoint is slow/unavailable.
function InvestorLevelCard() {
  const [level, setLevel] = useState<InvestorLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getInvestorLevel()
      .then((data) => {
        if (!cancelled) setLevel(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (loading || !level) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        </div>
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
      </Card>
    );
  }

  const atMax = level.xpForNextLevel === 0 || level.level >= 100;
  const pct = atMax ? 100 : Math.min(100, Math.max(0, level.progressToNext * 100));

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/15 text-pink-300 ring-1 ring-inset ring-pink-500/25">
          <Medal size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-zinc-100">
              Level {formatNumber(level.level)}
            </span>
            <span className="truncate text-xs font-medium uppercase tracking-wider text-pink-300">
              {level.title}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            {formatNumber(level.totalXp)} total XP
          </div>
        </div>
        {atMax && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
            MAX
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs tabular-nums text-zinc-500">
          <span>{atMax ? "Max level reached" : "Next level"}</span>
          {!atMax && (
            <span className="font-mono text-zinc-400">
              {formatNumber(level.xpIntoLevel)} / {formatNumber(level.xpForNextLevel)} XP
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-pink-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
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
            <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
              Avg Price
            </th>
            <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
              Current
            </th>
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
                  className="inline-flex items-center gap-2.5 font-medium text-zinc-100 transition-colors hover:text-pink-400"
                >
                  <Avatar src={h.avatarUrl} name={h.playerName} size="sm" />
                  <span className="inline-flex items-center gap-1">
                    {h.playerName}
                    <CaretRight
                      size={14}
                      weight="bold"
                      className="text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-pink-400"
                    />
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">
                {formatShares(h.quantity)}
              </td>
              <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-zinc-300 sm:table-cell">
                <Money value={h.averagePrice} />
              </td>
              <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-zinc-300 sm:table-cell">
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
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
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
    // Resetting fetch state synchronously is intentional: it shows the loading
    // skeleton while we (re)fetch — the documented exception to
    // react-hooks/set-state-in-effect (this is not the derive-state anti-pattern).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getPortfolio()
      .then((data) => {
        if (cancelled) return;
        setPortfolio(data);
        analytics.track("portfolio_viewed", {
          holdings: data.holdings.length,
        });
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
      <ProfileHeader user={user} portfolio={portfolio} />

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
          <YourStockCard user={user} />

          <Reveal>
            <InvestorLevelCard />
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, WarningCircle, Lock } from "@phosphor-icons/react";
import type { MarketOverview, Paged, StockSort, StockSummary } from "@/lib/api/types";
import { getMarketOverview, getStocks, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { MarketOverviewCards } from "@/components/market/MarketOverviewCards";
import { StockList } from "@/components/market/StockList";
import { LiveMarketPanel } from "@/components/market/LiveMarketPanel";

const PAGE_SIZE = 25;

function LoginNotice() {
  return (
    <Card>
      <EmptyState
        title="Please log in"
        message="Your session has expired. Sign in again to continue trading."
        icon={<Lock size={22} weight="bold" />}
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Log in
          </Link>
        }
      />
    </Card>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
      <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      <div className="grid items-center gap-12 md:min-h-[60vh] md:grid-cols-2 md:gap-10">
        {/* LEFT: copy + CTAs */}
        <Reveal>
          <div className="flex items-center gap-2.5">
            <StatusDot tone="pink" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              The osu! stock market
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tighter text-zinc-50 md:text-7xl">
            Trade the players you{" "}
            <span className="text-pink-400">watch</span>.
          </h1>

          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-zinc-400">
            Buy and sell shares tied to osu! player performance. Track the
            market, build a portfolio, and ride every rank-up.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton
              onClick={onLogin}
              className={buttonClasses({ size: "lg" })}
            >
              Get started
              <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <Link
              href="/login"
              className={buttonClasses({ variant: "ghost", size: "lg" })}
            >
              I have a token
            </Link>
          </div>
        </Reveal>

        {/* RIGHT: decorative live-market panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="md:pl-4"
        >
          <LiveMarketPanel />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <Skeleton className="h-8 w-40" />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 md:col-span-5">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl md:col-span-4" />
        <Skeleton className="h-28 rounded-2xl md:col-span-3" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-11 w-full rounded-xl sm:max-w-xs" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-48" />
      </div>
      <Skeleton className="mt-4 h-80 rounded-2xl" />
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading, login } = useAuth();

  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<StockSort>("change24h_desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input so we don't fetch on every keystroke. Resetting to
  // page 1 belongs with the query change here, not in a separate state-sync effect.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch the market overview once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: clear any stale error before refetching
    setOverviewError(null);

    getMarketOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load market overview.";
        setOverviewError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fetch the paged stock list whenever the query parameters change.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // Intentional skeleton-on-refetch when the page/sort/search query changes;
    // the documented exception to react-hooks/set-state-in-effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStocksLoading(true);
    setStocksError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    getStocks({
      page,
      pageSize: PAGE_SIZE,
      sort,
      search: debouncedSearch || undefined,
    })
      .then((data: Paged<StockSummary>) => {
        if (cancelled) return;
        setStocks(data.items);
        setTotalCount(data.totalCount ?? data.items.length);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load stocks.";
        setStocksError(message);
        setStocks([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (!cancelled) setStocksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, page, sort, debouncedSearch]);

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Hero onLogin={() => login("/")} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-50 sm:text-4xl">
            Market
          </h1>
          <div className="flex items-center gap-2 pb-1">
            <StatusDot tone="emerald" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              Live
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-sm text-zinc-400">
          Welcome back, {user.username}.
        </p>
      </Reveal>

      {unauthorized ? (
        <div className="mt-8">
          <LoginNotice />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {overviewError ? (
            <ErrorNotice message={overviewError} />
          ) : overview ? (
            <Reveal delay={0.05}>
              <MarketOverviewCards overview={overview} />
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="grid grid-cols-2 gap-4 md:col-span-5">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
              <Skeleton className="h-28 rounded-2xl md:col-span-4" />
              <Skeleton className="h-28 rounded-2xl md:col-span-3" />
            </div>
          )}

          {stocksError && <ErrorNotice message={stocksError} />}

          <Reveal delay={0.1}>
            <StockList
              stocks={stocks}
              loading={stocksLoading}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </Reveal>
        </div>
      )}
    </div>
  );
}

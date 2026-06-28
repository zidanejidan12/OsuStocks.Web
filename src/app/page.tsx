"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, WarningCircle, Lock, Wallet as WalletIcon } from "@phosphor-icons/react";
import type { MarketOverview, Paged, StockSort, StockSummary, Wallet } from "@/lib/api/types";
import { getMarketOverview, getStocks, getWallet, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/SponsorCredit";
import { MarketOverviewCards } from "@/components/market/MarketOverviewCards";
import { StockList } from "@/components/market/StockList";
import { LiveMarketPanel } from "@/components/market/LiveMarketPanel";
import { Coin } from "@/components/ui/Coin";
import { Avatar } from "@/components/ui/Avatar";

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

function IceRain() {
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; size: number; delay: number; duration: number; type: "diamond" | "orb"; color: "pink" | "cyan" | "white" }[]>([]);

  useEffect(() => {
    const list = Array.from({ length: 40 }).map((_, i) => {
      const type = (Math.random() > 0.4 ? "diamond" : "orb") as "diamond" | "orb";
      const colorRand = Math.random();
      const color = (colorRand > 0.6 ? "pink" : colorRand > 0.3 ? "cyan" : "white") as "pink" | "cyan" | "white";
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: type === "diamond" ? Math.random() * 4 + 3 : Math.random() * 40 + 20,
        delay: Math.random() * -10,
        duration: type === "diamond" ? Math.random() * 8 + 6 : Math.random() * 20 + 15,
        type,
        color
      };
    });
    setParticles(list);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {particles.map((p) => {
        if (p.type === "diamond") {
          const bgGradient = p.color === "pink" 
            ? "from-pink-500/40 to-pink-400/20" 
            : p.color === "cyan" 
            ? "from-cyan-500/40 to-cyan-400/20" 
            : "from-white/40 to-zinc-400/20";
          const shadowColor = p.color === "pink"
            ? "rgba(236,72,153,0.3)"
            : p.color === "cyan"
            ? "rgba(6,182,212,0.3)"
            : "rgba(255,255,255,0.2)";
          
          return (
            <span
              key={p.id}
              className={`absolute transform rotate-45 bg-gradient-to-tr ${bgGradient} border border-white/10 animate-fall`}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                top: `-20px`,
                boxShadow: `0 0 8px ${shadowColor}`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                animationIterationCount: "infinite",
                animationTimingFunction: "linear"
              }}
            />
          );
        } else {
          const colorClass = p.color === "pink"
            ? "bg-pink-500/4"
            : p.color === "cyan"
            ? "bg-cyan-500/4"
            : "bg-zinc-400/3";
          
          return (
            <span
              key={p.id}
              className={`absolute rounded-full blur-xl animate-float ${colorClass}`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                animationIterationCount: "infinite"
              }}
            />
          );
        }
      })}
    </div>
  );
}

function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden">
      <IceRain />
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 grid items-center gap-12 md:grid-cols-2 md:gap-10">
        <Reveal>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white">
              Trade osu!<br className="hidden md:inline" />
              {" "}players like<br />
              <span className="text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.75)] animate-pulse">stocks.</span>
            </h1>

            <p className="mt-6 max-w-[44ch] text-lg sm:text-xl font-normal leading-relaxed text-zinc-400">
              Buy and sell shares tied to osu! player performance. Track the
              market, build a portfolio, and ride every rank-up.
            </p>

            <p className="mt-4 max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-500 font-normal">
              A free, fan-made game for fun. All credits, prices, and holdings are <strong className="text-zinc-400 font-semibold">virtual</strong>—they have no real-world value, can&apos;t be bought or cashed out, and this isn&apos;t real investing or gambling. Not affiliated with osu! or ppy Pty Ltd.
            </p>

            <div className="mt-8 flex flex-wrap justify-center md:justify-start items-center gap-3">
              <MagneticButton
                onClick={onLogin}
                className="relative group overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center gap-3"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                Get Started
                <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform duration-300" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:pl-4">
          <div className="flex flex-col gap-4">
            <SponsorCard />
            <LiveMarketPanel />
          </div>
        </Reveal>
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
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<StockSort>("change24h_desc");
  const [country, setCountry] = useState("ALL");
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
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: clear stale error/unauthorized before refetching */
    setOverviewError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

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

  // Fetch the wallet once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getWallet()
      .then((data) => {
        if (!cancelled) setWallet(data);
      })
      .catch(() => {
        // fail silently
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
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getStocks({
      page,
      pageSize: PAGE_SIZE,
      sort,
      search: debouncedSearch || undefined,
      country,
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
  }, [user, page, sort, country, debouncedSearch]);

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Hero onLogin={() => login("/")} />;
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Decorative ambient light gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-8 mb-8">
          {/* Welcome User Section */}
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatarUrl}
              name={user.username}
              size="lg"
              className="ring-2 ring-pink-500/20"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tighter text-zinc-100 sm:text-3xl">
                  {user.username}
                </h1>
                {user.equippedTitle && (
                  <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-400 border border-pink-500/20">
                    {user.equippedTitle}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Good to see you back on the stock market today.
              </p>
            </div>
          </div>

          {/* Quick Wallet Stats Widget */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 min-w-[200px]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <WalletIcon size={20} weight="bold" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 block font-medium">Available Balance</span>
              <span className="text-lg font-mono font-bold text-zinc-100 tabular-nums flex items-center gap-1.5 mt-0.5">
                <Coin />
                {wallet ? wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "..."}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Market Title and Status */}
      <Reveal delay={0.02}>
        <div className="flex items-end justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tighter text-zinc-100 sm:text-2xl">
              Market Overview
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20">
              <StatusDot tone="cyan" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400">
                Live
              </span>
            </div>
          </div>
        </div>
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
              country={country}
              onCountryChange={(value) => {
                setCountry(value);
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

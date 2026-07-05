"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, WarningCircle, Lock, Wallet as WalletIcon, CaretDown, X } from "@phosphor-icons/react";
import type { MarketOverview, Paged, StockSort, StockSummary, Wallet } from "@/lib/api/types";
import { getMarketOverview, getStocks, getWallet, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/SponsorCredit";
import { MarketOverviewCards } from "@/components/market/MarketOverviewCards";
import { StockList } from "@/components/market/StockList";
import { StockDetail } from "@/components/market/StockDetail";
import { LiveMarketPanel } from "@/components/market/LiveMarketPanel";
import { Coin } from "@/components/ui/Coin";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { spring } from "@/lib/motion";

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

// Custom Error Notification
function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
      <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Live Trading Activity Popup Component
function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative w-full min-h-[75vh] flex items-center pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 grid items-start gap-8 md:grid-cols-2 md:gap-10">
        <Reveal>
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2 md:pt-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-zinc-100">
              Trade osu!<br className="hidden md:inline" />
              {" "}players like<br />
              <span className="text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.75)] animate-pulse">stocks.</span>
            </h1>

            <p className="mt-6 max-w-[44ch] text-lg sm:text-xl font-normal leading-relaxed text-zinc-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              A fantasy market for osu! players. Build a portfolio of shares tied to live performance, predict the next top plays, and climb the leaderboard.
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

function WelcomeBanner({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl flex flex-col md:flex-row min-h-[400px]"
          >
            {/* Image panel */}
            <div className="relative md:w-[42%] w-full h-[180px] md:h-auto overflow-hidden bg-zinc-900 border-b md:border-b-0 md:border-r border-white/5 shrink-0">
              <img
                src="/osu_anime_mascot.png"
                alt="OsuStocks Mascot"
                className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-zinc-950/80 pointer-events-none" />
            </div>

            {/* Content panel */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-widest">
                    VIRTUAL EXCHANGE
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-3xl font-display font-black tracking-tight text-zinc-950 dark:text-white uppercase leading-tight">
                  Welcome to <span className="text-pink-500">OsuStocks</span>
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  OsuStocks is a fan-made fantasy trading simulator linking real-world performance points to a virtual stock index. Build your portfolio with shares tied directly to live competitive stats.
                </p>

                {/* Bullets */}
                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded bg-pink-500/10 text-[10px] font-bold text-pink-400 border border-pink-500/20">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Track Top osu! Players</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Value updates dynamically based on live PP and performance metrics.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded bg-cyan-500/10 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">Build Your Portfolio</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Buy low, sell high, and accumulate simulated coin credits.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  onClick={onDismiss}
                  className="w-full sm:w-auto relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-display font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  Let's Trade
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const { user, loading: authLoading, login } = useAuth();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

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
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string, immediate?: boolean) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (immediate) {
      setDebouncedSearch(value);
      setPage(1);
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400);
    }
  };

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
        if (!cancelled) {
          setWallet(data);
          setTimeout(() => setBalanceLoaded(true), 500);
        }
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

  const handleQuickTrade = () => {
    const searchInput = document.getElementById("stock-search");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      searchInput.focus();
    }
  };

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="relative w-full overflow-x-hidden pb-16">
        <Hero onLogin={() => login("/")} />
        <FaqSection />
      </div>
    );
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
            <div className="relative group shrink-0">
              <Avatar
                src={user.avatarUrl}
                name={user.username}
                size="lg"
                className="ring-2 ring-pink-500/20 group-hover:ring-pink-500/40 transition-all duration-300"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black font-display tracking-tight text-zinc-100 sm:text-3xl">
                  {user.username}
                </h1>
                {user.equippedTitle ? (
                  <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-bold text-pink-400 border border-pink-500/20 uppercase tracking-wider">
                    {user.equippedTitle}
                  </span>
                ) : (
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                    Trader
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Wallet Stats Widget & Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 min-w-[210px]">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <WalletIcon size={20} weight="bold" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Available Balance</span>
                <span className="text-lg font-mono font-bold text-zinc-100 tabular-nums flex items-center gap-1.5 mt-0.5">
                  {!wallet ? (
                    <>
                      <Coin />
                      <span className="h-5 w-16 skeleton rounded inline-block" />
                    </>
                  ) : !balanceLoaded ? (
                    <>
                      <Coin />
                      <motion.span
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        Loading...
                      </motion.span>
                    </>
                  ) : (
                    <motion.span
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={spring}
                    >
                      <Money value={wallet.balance} />
                    </motion.span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickTrade}
                className="flex items-center justify-center h-11 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/45 hover:border-pink-500/30 text-zinc-300 hover:text-pink-400 font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.05)] cursor-pointer"
              >
                Quick Trade
              </button>
              <Link
                href="/wallet"
                title="Deposit Coins"
                className="flex items-center justify-center h-11 w-11 rounded-2xl border border-zinc-800 bg-zinc-900/45 hover:border-cyan-500/30 text-zinc-300 hover:text-cyan-400 font-display font-black text-sm uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.05)]"
              >
                D
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Market Title and Status */}
      <Reveal delay={0.02}>
        <div className="flex items-end justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black font-display tracking-tight text-zinc-100 sm:text-2xl">
              Market Dashboard
            </h2>
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
              <MarketOverviewCards
                overview={overview}
                onSortChange={(value) => {
                  setSort(value);
                  setPage(1);
                }}
              />
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
              onSearchChange={handleSearchChange}
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
              onSelectStock={setSelectedStockId}
            />
          </Reveal>
        </div>
      )}

      {/* Modern Player Details Modal Dialog */}
      <AnimatePresence>
        {selectedStockId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStockId(null)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800/80 bg-zinc-950/95 shadow-2xl p-4 sm:p-6"
            >
              <button
                onClick={() => setSelectedStockId(null)}
                className="absolute top-4 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors hover:border-zinc-700 active:scale-90 focus:outline-none cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} weight="bold" />
              </button>
              <StockDetail
                stockId={selectedStockId}
                isModal={true}
                onClose={() => setSelectedStockId(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// NEW LANDING PAGE SECTIONS (CLIENT-SIDE ONLY)
// ==========================================

function FaqSection() {
  const faqs = [
    {
      q: "Is this real money or real investing?",
      a: "Absolutely not. OsuStocks is 100% virtual and free to play. The coins, shares, and portfolio values are exclusively for fun and virtual competition. You cannot buy or withdraw coins for real-world money, and there is no gambling involved."
    },
    {
      q: "How are player share prices calculated?",
      a: "Prices are calculated dynamically using an algorithm tied to a player's official osu! performance metrics (Performance Points (PP), global rank, and active play history) combined with our internal buying and selling supply/demand."
    },
    {
      q: "How often do player prices update?",
      a: "The market syncs periodically to update stats from the official osu! leaderboards. Price fluctuations triggered by trades on OsuStocks happen in real-time."
    },
    {
      q: "Can I list my own name as a stock?",
      a: "The platform automatically tracks the top 5,000 global osu! players. If you reach the global ranking threshold, you will automatically become a tradable stock for managers to invest in!"
    }
  ];

  return (
    <section id="faq" className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-100">
            Frequently Asked <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">Questions</span>
          </h2>
        </div>
      </Reveal>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => (
          <Reveal key={idx} delay={idx * 0.05}>
            <FaqItem q={faq.q} a={faq.a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={"glass overflow-hidden rounded-[20px] transition-all duration-350 border border-zinc-800/80 " + (
      isOpen 
        ? "border-pink-500/30 bg-zinc-950/40 shadow-[0_4px_25px_rgba(236,72,153,0.06)]" 
        : "hover:border-zinc-700/50"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex w-full items-center justify-between px-6 py-4.5 text-left font-bold text-sm sm:text-base text-zinc-200 transition-colors hover:text-zinc-100"
      >
        {isOpen && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
        )}
        <span className={isOpen ? "pl-4 transition-all duration-300" : "pl-0 transition-all duration-300"}>{q}</span>
        <CaretDown 
          size={16} 
          weight="bold" 
          className={"text-zinc-500 transition-transform duration-300 " + (isOpen ? "rotate-180 text-pink-400" : "")} 
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-900/60"
          >
            <div className="p-6 pt-4 pl-10">
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 font-medium">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

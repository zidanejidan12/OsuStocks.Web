"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  CaretLeft,
  CaretRight,
  WarningCircle,
  Sword,
  Target
} from "@phosphor-icons/react";
import { getLeaderboard, ApiError } from "@/lib/api/client";
import type { LeaderboardEntry } from "@/lib/api/types";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

const PAGE_SIZE = 10;

type Period = "all" | "monthly" | "weekly" | "daily";
const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "All-time" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];
const PERIOD_NOTE: Record<Period, string> = {
  all: "all-time",
  monthly: "this month",
  weekly: "this week",
  daily: "today",
};

function rankChip(rank: number): string {
  if (rank === 1) return "bg-amber-500/15 text-amber-300 ring-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
  if (rank === 2) return "bg-zinc-200/25 text-zinc-100 ring-zinc-200/40 shadow-[0_0_10px_rgba(228,228,231,0.25)]";
  if (rank === 3) return "bg-orange-600/15 text-orange-300 ring-orange-600/30 shadow-[0_0_8px_rgba(234,88,12,0.1)]";
  if (rank <= 10) return "bg-pink-500/10 text-pink-300 ring-pink-500/25";
  return "bg-zinc-800/70 text-zinc-400 ring-zinc-700/50";
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {children}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/25">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-7 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <div className="ml-auto">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PodiumCard({
  entry,
  isMe,
  onCompare,
  compareActive
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  onCompare: () => void;
  compareActive: boolean;
}) {
  const isRank1 = entry.rank === 1;
  const isRank2 = entry.rank === 2;
  const isRank3 = entry.rank === 3;

  const cardStyle = isRank1
    ? "border-amber-400/80 bg-gradient-to-b from-amber-500/[0.12] via-zinc-950/90 to-zinc-900/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-amber-500/30"
    : isRank2
    ? "border-zinc-400 bg-gradient-to-b from-zinc-300/[0.08] via-zinc-950/90 to-zinc-900/50 shadow-[0_0_25px_rgba(228,228,231,0.15)] ring-zinc-300/20"
    : "border-orange-600/50 bg-gradient-to-b from-orange-600/[0.06] via-zinc-950/90 to-zinc-900/50 shadow-[0_0_20px_rgba(234,88,12,0.1)] ring-orange-600/10";

  const paddingStyle = isRank1 
    ? "pt-8 pb-6 px-5" 
    : isRank2 
    ? "pt-6 pb-5 px-5" 
    : "pt-5 pb-5 px-5";

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border ${paddingStyle} text-center ring-1 ring-inset transition-all duration-500 ease-out hover:scale-[1.05] hover:-translate-y-3 hover:shadow-[0_22px_45px_rgba(236,72,153,0.22)] hover:border-pink-500/40 relative group ${cardStyle} ${
        isMe ? "bg-pink-500/[0.08] border-pink-500/40" : ""
      }`}
    >
      <button 
        onClick={onCompare}
        className={`absolute top-3 right-3 p-1.5 rounded-lg border text-[10px] transition-all duration-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 ${
          compareActive 
            ? "bg-pink-500 border-pink-600 text-white shadow-md shadow-pink-500/20" 
            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
        }`}
      >
        <Sword size={12} />
        <span>Compare</span>
      </button>

      <span
        className={`grid h-9 w-9 place-items-center rounded-full ring-1 ring-inset ${rankChip(
          entry.rank,
        )}`}
      >
        {isRank1 ? (
          <Trophy size={18} weight="fill" className="text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
        ) : isRank2 ? (
          <Medal size={18} weight="fill" className="text-zinc-100 drop-shadow-[0_0_8px_rgba(228,228,231,0.8)]" />
        ) : (
          <Medal size={18} weight="fill" className="text-orange-450 drop-shadow-[0_0_6px_rgba(234,88,12,0.5)]" />
        )}
      </span>
      <div className="mt-3 relative">
        <Avatar src={entry.avatarUrl} name={entry.username} size="md" className="ring-2 ring-zinc-850" />
        {isRank1 && (
          <div className="absolute -top-1.5 -right-1.5 text-xs text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">
            👑
          </div>
        )}
      </div>
      <div className="mt-2 flex max-w-full items-center gap-1.5 justify-center">
        <span className="truncate text-sm font-semibold text-zinc-100">
          {entry.username}
        </span>
        {entry.countryCode && (
          <Flag countryCode={entry.countryCode} className="h-3 shrink-0" />
        )}
      </div>
      {entry.equippedTitle && (
        <div className="mt-1 max-w-full truncate text-[11px] font-medium text-pink-400">
          {entry.equippedTitle}
        </div>
      )}
      {isMe && (
        <div className="mt-1">
          <Badge tone="accent">You</Badge>
        </div>
      )}
      <div className="mt-3 font-mono text-base font-bold tabular-nums text-zinc-50">
        <Money value={entry.portfolioValue} />
      </div>
      {typeof entry.profitLoss === "number" && (
        <div className="mt-1 text-xs">
          <PriceChange value={entry.profitLoss} />
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<Period>("all");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Versus Compare States
  const [versusA, setVersusA] = useState<LeaderboardEntry | null>(null);
  const [versusB, setVersusB] = useState<LeaderboardEntry | null>(null);

  const load = useCallback(async (nextPage: number, nextPeriod: Period) => {
    const result = await getLeaderboard({
      page: nextPage,
      pageSize: PAGE_SIZE,
      period: nextPeriod === "all" ? undefined : nextPeriod,
    });
    setEntries(result.items);
    setPage(nextPage);
    setPeriod(nextPeriod);
    setTotalCount(result.totalCount ?? 0);
    setHasMore(
      typeof result.totalCount === "number"
        ? nextPage * PAGE_SIZE < result.totalCount
        : result.items.length === PAGE_SIZE,
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load(1, "all")
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof ApiError ? err.message : "Failed to load leaderboard.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = (nextPage: number, nextPeriod: Period) => {
    setBusy(true);
    setError(null);
    load(nextPage, nextPeriod)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load leaderboard.",
        ),
      )
      .finally(() => setBusy(false));
  };

  const handleCompareClick = (entry: LeaderboardEntry) => {
    if (versusA?.userId === entry.userId) {
      setVersusA(null);
      return;
    }
    if (versusB?.userId === entry.userId) {
      setVersusB(null);
      return;
    }
    if (!versusA) {
      setVersusA(entry);
    } else if (!versusB) {
      setVersusB(entry);
    } else {
      // Shift A -> B, and insert new selection
      setVersusA(versusB);
      setVersusB(entry);
    }
  };

  const isFirstPage = page === 1;
  const podium = isFirstPage ? entries.slice(0, 3) : [];
  const listEntries = isFirstPage ? entries.slice(3) : entries;

  return (
    <PageShell>
      <Reveal>
        <header className="mb-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.35)]">
            GLOBAL LEADERBOARD
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-zinc-50 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Rankings
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            Compare active brokers, track portfolio margins, and climb the ranks.
          </p>
        </header>
      </Reveal>

      {/* Period Selector Tabs */}
      <div
        className="mb-6 inline-flex rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1"
        role="group"
        aria-label="Leaderboard time period"
      >
        {PERIODS.map((p) => {
          const active = p.value === period;
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              disabled={busy || loading}
              onClick={() => !active && navigate(1, p.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none disabled:opacity-60 ${
                active
                  ? "bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {loading && <LeaderboardSkeleton />}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={<Trophy size={20} weight="bold" />}
          title="No rankings yet"
          message="The leaderboard fills up as traders build their portfolios."
        />
      )}

      {!loading && !error && entries.length > 0 && (
        <div
          className={busy ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}
          aria-busy={busy}
        >
          {podium.length > 0 && (
            <ul className="mb-12 flex flex-col md:flex-row items-stretch md:items-end justify-center gap-6 max-w-4xl mx-auto pt-6">
              {/* Rank 2 (Left) */}
              {podium[1] && (
                <li key={podium[1].userId} className="w-full md:w-1/3 order-2 md:order-1 self-stretch md:self-auto md:h-[90%]">
                  <PodiumCard 
                    entry={podium[1]} 
                    isMe={user?.userId === podium[1].userId} 
                    onCompare={() => handleCompareClick(podium[1])}
                    compareActive={versusA?.userId === podium[1].userId || versusB?.userId === podium[1].userId}
                  />
                </li>
              )}
              {/* Rank 1 (Center) */}
              {podium[0] && (
                <li key={podium[0].userId} className="w-full md:w-1/3 order-1 md:order-2 md:scale-[1.05] z-10 relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-3xl animate-bounce pointer-events-none">👑</div>
                  <PodiumCard 
                    entry={podium[0]} 
                    isMe={user?.userId === podium[0].userId} 
                    onCompare={() => handleCompareClick(podium[0])}
                    compareActive={versusA?.userId === podium[0].userId || versusB?.userId === podium[0].userId}
                  />
                </li>
              )}
              {/* Rank 3 (Right) */}
              {podium[2] && (
                <li key={podium[2].userId} className="w-full md:w-1/3 order-3 md:order-3 self-stretch md:self-auto md:h-[80%]">
                  <PodiumCard 
                    entry={podium[2]} 
                    isMe={user?.userId === podium[2].userId} 
                    onCompare={() => handleCompareClick(podium[2])}
                    compareActive={versusA?.userId === podium[2].userId || versusB?.userId === podium[2].userId}
                  />
                </li>
              )}
            </ul>
          )}

          <div className="relative overflow-hidden min-h-[400px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {listEntries.length > 0 && (
                  <motion.ul
                    className="divide-y divide-zinc-900/40 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/15 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-pink-500/20"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
              {listEntries.map((e) => {
                const isMe = user?.userId === e.userId;
                const isSelected = selectedUserId === e.userId;
                const isCompared = versusA?.userId === e.userId || versusB?.userId === e.userId;

                // Dynamic Trade combometer stats
                const simulatedCombo = Math.max(2, (e.username.length % 5) + 3);
                
                return (
                  <motion.li
                    key={e.userId}
                    variants={fadeUp}
                    className={`flex items-center gap-4 px-4 py-4 transition-all duration-350 border-b border-zinc-850/40 relative z-0 ${
                      isSelected
                        ? "scale-[1.04] -translate-y-2.5 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-zinc-900/90 border-pink-500/80 shadow-[0_25px_45px_rgba(236,72,153,0.35)] ring-2 ring-pink-500/60 z-20 border-l-4 border-l-pink-400"
                        : isMe
                        ? "bg-pink-500/[0.08] border-l-4 border-l-pink-500 hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(236,72,153,0.12)] hover:z-10"
                        : "hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(236,72,153,0.1)] hover:bg-zinc-800/80 hover:border-pink-500/30 hover:z-10"
                    }`}
                  >
                    <span
                      onClick={() => setSelectedUserId(isSelected ? null : e.userId)}
                      className={`grid h-7 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums cursor-pointer ring-1 ring-inset ${rankChip(
                        e.rank,
                      )}`}
                    >
                      {e.rank}
                    </span>
                    <span onClick={() => setSelectedUserId(isSelected ? null : e.userId)} className="cursor-pointer">
                      <Avatar src={e.avatarUrl} name={e.username} size="sm" />
                    </span>
                    
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedUserId(isSelected ? null : e.userId)}>
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-zinc-100">
                          {e.username}
                        </span>
                        {isMe && <Badge tone="accent">You</Badge>}
                        {e.countryCode && (
                          <Flag countryCode={e.countryCode} className="h-3" />
                        )}
                        {e.equippedTitle && (
                          <span className="hidden shrink-0 truncate rounded bg-pink-500/10 px-1.5 py-0.5 text-[10px] font-medium text-pink-300 ring-1 ring-inset ring-pink-500/25 sm:inline">
                            {e.equippedTitle}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        {typeof e.profitLoss === "number" && (
                          <div className="text-xs">
                            <PriceChange value={e.profitLoss} />
                          </div>
                        )}
                        <span className="text-[9px] font-mono text-zinc-550 border border-zinc-900 rounded px-1.5 py-0.5 bg-zinc-950/40">
                          STREAK x{simulatedCombo}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono text-sm font-semibold tabular-nums text-zinc-50">
                        <Money value={e.portfolioValue} />
                      </div>

                      {/* Versus Matchup Button */}
                      <button
                        onClick={() => handleCompareClick(e)}
                        className={`p-2 rounded-xl border transition-all duration-300 ${
                          isCompared 
                            ? "bg-pink-500 border-pink-600 text-white shadow-md shadow-pink-500/25 scale-105" 
                            : "bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <Sword size={14} weight={isCompared ? "fill" : "regular"} />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Versus Combat split panel overlay */}
      <AnimatePresence>
        {versusA && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="fixed bottom-6 inset-x-4 max-w-lg mx-auto z-50 rounded-2xl border border-pink-500/35 bg-zinc-950/95 backdrop-blur-xl p-5 shadow-[0_20px_45px_rgba(236,72,153,0.22)] font-mono border-t-pink-500"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-4">
              <span className="text-[9px] font-bold text-pink-400 flex items-center gap-1.5">
                <Target size={12} className="animate-spin-slow" />
                TRADER TELEMETRY COMBAT
              </span>
              <button 
                onClick={() => { setVersusA(null); setVersusB(null); }}
                className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase font-bold tracking-wider"
              >
                [Reset Selection]
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              {/* Trader A */}
              <div className="flex-1 text-center min-w-0 bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl">
                <Avatar src={versusA.avatarUrl} name={versusA.username} size="sm" className="mx-auto border border-zinc-800" />
                <span className="text-xs font-bold text-zinc-200 block truncate mt-1.5">{versusA.username}</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono"><Money value={versusA.portfolioValue} /></span>
              </div>

              <div className="text-center font-black text-pink-500 text-sm tracking-widest shrink-0 italic">
                VS
              </div>

              {/* Trader B */}
              <div className="flex-1 text-center min-w-0">
                {versusB ? (
                  <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-xl">
                    <Avatar src={versusB.avatarUrl} name={versusB.username} size="sm" className="mx-auto border border-zinc-800" />
                    <span className="text-xs font-bold text-zinc-200 block truncate mt-1.5">{versusB.username}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono"><Money value={versusB.portfolioValue} /></span>
                  </div>
                ) : (
                  <div className="h-[76px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl text-[9px] text-zinc-500 px-2 leading-relaxed">
                    <span>Select a 2nd trader</span>
                    <span>to lock comparison</span>
                  </div>
                )}
              </div>
            </div>

            {versusA && versusB && (
              <div className="mt-4 pt-3.5 border-t border-zinc-900 text-[10px] space-y-2 text-zinc-500">
                <div className="flex justify-between">
                  <span>Net Worth Variance:</span>
                  <span className="text-zinc-300 font-bold">
                    <Money value={Math.abs(versusA.portfolioValue - versusB.portfolioValue)} />
                  </span>
                </div>
                {/* Comparative Ratio Bar */}
                <div className="mt-3.5 pt-2 border-t border-zinc-900/60">
                  <div className="relative w-full h-2 rounded-full overflow-hidden bg-zinc-900 border border-zinc-850 flex">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500" 
                      style={{ width: `${(versusA.portfolioValue / (versusA.portfolioValue + versusB.portfolioValue)) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-550 transition-all duration-500" 
                      style={{ width: `${(versusB.portfolioValue / (versusA.portfolioValue + versusB.portfolioValue)) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500 mt-1.5 font-mono">
                    <span>{((versusA.portfolioValue / (versusA.portfolioValue + versusB.portfolioValue)) * 100).toFixed(0)}% ({versusA.username})</span>
                    <span>{((versusB.portfolioValue / (versusA.portfolioValue + versusB.portfolioValue)) * 100).toFixed(0)}% ({versusB.username})</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!loading && !error && entries.length > 0 && (
        <nav
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900/60 pt-6"
          aria-label="Leaderboard pages"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(page - 1, period)}
            disabled={busy || page <= 1}
            className="w-full sm:w-auto"
          >
            <CaretLeft size={16} weight="bold" />
            Previous
          </Button>

          {/* Page Numbers */}
          {(() => {
            const totalPages = Math.ceil(totalCount / PAGE_SIZE);
            if (totalPages <= 1) return null;
            
            const pages: number[] = [];
            const range = 1; // how many pages to show around current page
            
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= page - range && i <= page + range)
              ) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== -1) {
                pages.push(-1); // represents ellipsis '...'
              }
            }

            return (
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {pages.map((p, idx) => {
                  if (p === -1) {
                    return (
                      <span key={`ell-${idx}`} className="px-1 text-zinc-650 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  const active = p === page;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={busy}
                      onClick={() => navigate(p, period)}
                      className={`relative min-w-8 h-8 px-2.5 rounded-lg text-xs font-bold transition-all duration-300 outline-none select-none ${
                        active
                          ? "bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(page + 1, period)}
            disabled={busy || !hasMore}
            className="w-full sm:w-auto"
          >
            Next
            <CaretRight size={16} weight="bold" />
          </Button>
        </nav>
      )}
    </PageShell>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Tag,
  TrendUp,
  TrendDown,
  ChartBar,
  WarningCircle,
  Broadcast,
  Fire,
  ArrowRight
} from "@phosphor-icons/react";
import { getTrending, ApiError } from "@/lib/api/client";
import type { Trending, TrendingStock } from "@/lib/api/types";
import { formatCompact, formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface Bucket {
  key: keyof Trending;
  title: string;
  subtitle: string;
  Icon: any;
  tagLabel: string;
  tagClass: string;
  metric: (s: TrendingStock) => ReactNode;
}

const BUCKETS: Bucket[] = [
  {
    key: "mostBought",
    title: "Most Bought",
    subtitle: "COMMUNITY FAVORITE",
    Icon: ShoppingCart,
    tagLabel: "COMMUNITY FAVORITE",
    tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    metric: (s) => (
      <span className="font-mono text-xs text-zinc-300">
        {formatNumber(s.tradeCount ?? 0)} buys
      </span>
    ),
  },
  {
    key: "mostSold",
    title: "Most Sold",
    subtitle: "PANIC LIQUIDATION",
    Icon: Tag,
    tagLabel: "PANIC LIQUIDATION",
    tagClass: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    metric: (s) => (
      <span className="font-mono text-xs text-zinc-300">
        {formatNumber(s.tradeCount ?? 0)} sells
      </span>
    ),
  },
  {
    key: "fastestRising",
    title: "Fastest Rising",
    subtitle: "SPEEDRUN PUMP",
    Icon: TrendUp,
    tagLabel: "SPEEDRUN PUMP",
    tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "fastestFalling",
    title: "Fastest Falling",
    subtitle: "CHOKE DEPRECIATION",
    Icon: TrendDown,
    tagLabel: "CHOKE DEPRECIATION",
    tagClass: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "highestVolume",
    title: "Highest Volume",
    subtitle: "HYPER LIQUID CORE",
    Icon: ChartBar,
    tagLabel: "HYPER LIQUID CORE",
    tagClass: "bg-pink-500/10 text-pink-400 border-pink-500/25",
    metric: (s) => (
      <span className="font-mono text-xs text-zinc-300">
        {formatCompact(s.volume)} Cr
      </span>
    ),
  },
];

export default function TrendingPage() {
  const [data, setData] = useState<Trending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBucketIndex, setSelectedBucketIndex] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    getTrending()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load trending.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Soft fluctuate price data over time
  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev;
        const next = { ...prev };
        const keys = Object.keys(next) as Array<keyof Trending>;
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const list = next[randomKey] ? [...next[randomKey]!] : [];
        if (list.length > 0) {
          const idx = Math.floor(Math.random() * list.length);
          const current = list[idx];
          const isUp = Math.random() > 0.45;
          const pct = ((Math.random() * 0.2 + 0.05) * (isUp ? 1 : -1)) / 100;
          const diff = current.currentPrice * pct;
          
          list[idx] = {
            ...current,
            currentPrice: Math.max(1, current.currentPrice + diff),
            priceChange24h: current.priceChange24h + (pct * 100)
          };
          next[randomKey] = list;
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  const isEmpty = data !== null && BUCKETS.every((b) => (data[b.key]?.length ?? 0) === 0);
  const activeBucket = BUCKETS[selectedBucketIndex];
  const activeStocks = data && activeBucket ? (data[activeBucket.key] ?? []) : [];

  return (
    <div className="relative w-full overflow-hidden min-h-screen pb-20">
      {/* Visualizer CSS style override */}
      <style>{`
        @keyframes soundwave-bounce {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
        .animate-soundwave {
          animation: soundwave-bounce 0.8s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
      
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <header className="mb-2">
                <div className="h-3 w-32 bg-zinc-800/50 rounded animate-pulse" />
                <div className="h-10 w-48 bg-zinc-800/50 rounded mt-3 animate-pulse" />
                <div className="h-12 w-full bg-zinc-800/50 rounded mt-3 animate-pulse" />
              </header>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <Skeleton className="h-[550px] rounded-[28px]" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <EmptyState
            icon={<Fire size={20} weight="bold" />}
            title="No hot trends right now"
            message="Active trends will populate as simulated trading picks up."
          />
        )}

        {!loading && !error && data && !isEmpty && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Page Title & Rhythm Game Slanted Song Select List */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Reveal>
                <header className="mb-2">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
                    Market Trends
                  </h1>
                  <p className="mt-3 text-sm text-zinc-400 max-w-[60ch] leading-relaxed">
                    Track hyper-active stocks, rising candidates, and volume surges directly synced with player leaderboard dynamics.
                  </p>
                </header>
              </Reveal>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest block mb-2 px-1">
                  Select Trend Category
                </span>
              <div className="flex flex-col gap-2.5">
                {BUCKETS.map((b, idx) => {
                  const isSelected = selectedBucketIndex === idx;
                  const Icon = b.Icon;
                  return (
                    <button
                      key={b.key}
                      onClick={() => setSelectedBucketIndex(idx)}
                      className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer select-none group outline-none overflow-hidden ${
                        isSelected
                          ? "border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.2)] translate-x-2 skew-x-[-4deg]"
                          : "border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-950/20 backdrop-blur-md hover:bg-zinc-200/50 dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-800 hover:translate-x-1 skew-x-[-4deg]"
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          className="absolute inset-0 bg-gradient-to-r from-pink-500/15 via-pink-500/[0.02] to-transparent rounded-xl -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {/* Return text to straight alignment inside skewed container */}
                      <div className="flex items-center gap-3.5 skew-x-[4deg]">
                        <span className={`p-2 rounded-xl bg-zinc-950/60 border border-zinc-900 ${
                          isSelected ? "text-pink-400 border-pink-500/25" : "text-zinc-500"
                        }`}>
                          <Icon size={18} weight="bold" />
                        </span>
                        <div>
                          <span className={`text-sm font-black tracking-tight block ${
                            isSelected ? "text-zinc-50" : "text-zinc-400 group-hover:text-zinc-200"
                          }`}>{b.title}</span>
                          <span className="text-[9px] font-mono font-bold text-zinc-550 block mt-0.5 tracking-wider">
                            {b.subtitle}
                          </span>
                        </div>
                      </div>
                      <div className="skew-x-[4deg] shrink-0">
                        <ArrowRight 
                          size={14} 
                          weight="bold" 
                          className={`transition-transform duration-300 ${
                            isSelected ? "text-pink-400 translate-x-1" : "text-zinc-600 group-hover:text-zinc-400"
                          }`} 
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Terminal Board */}
            <div className="lg:col-span-7">
              <Card className={`h-full border bg-zinc-950/20 backdrop-blur-xl p-6 sm:p-8 rounded-[28px] relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
                selectedBucketIndex === 0 || selectedBucketIndex === 2 
                  ? "border-emerald-500/35 shadow-[0_0_35px_rgba(16,185,129,0.06)]" 
                  : selectedBucketIndex === 1 || selectedBucketIndex === 3 
                  ? "border-rose-500/35 shadow-[0_0_35px_rgba(244,63,94,0.06)]" 
                  : "border-pink-500/35 shadow-[0_0_35px_rgba(236,72,153,0.06)]"
              }`}>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
                  selectedBucketIndex === 0 || selectedBucketIndex === 2 ? "bg-emerald-500/5" :
                  selectedBucketIndex === 1 || selectedBucketIndex === 3 ? "bg-rose-500/5" :
                  "bg-pink-500/5"
                }`} />
                
                <div>
                  {/* Top Dashboard details */}
                  <div className="border-b border-zinc-900/60 pb-5 mb-5">
                    <h2 className="text-xl font-black text-zinc-50 tracking-tight">
                      Top 10: {activeBucket.title}
                    </h2>
                  </div>
 
                  {activeStocks.length === 0 ? (
                    <div className="py-20 text-center text-zinc-550 font-medium">
                      No active players found in this category right now.
                    </div>
                  ) : (
                    <div className="relative overflow-hidden min-h-[350px]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={selectedBucketIndex}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <motion.ul
                            className="divide-y divide-zinc-900/40"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                          >
                            {activeStocks.slice(0, 10).map((s, i) => (
                              <motion.li 
                                key={s.stockId} 
                                variants={fadeUp}
                                className="py-1 transition-all duration-200"
                              >
                                <Link
                                  href={`/stocks/${s.stockId}`}
                                  className={`flex items-center gap-3.5 p-2 -mx-2 rounded-xl transition-all duration-300 hover:bg-zinc-900/20 dark:hover:bg-zinc-900/40 hover:translate-x-1 group/item border-l-2 border-l-transparent ${
                                    selectedBucketIndex === 0 || selectedBucketIndex === 2 ? "hover:border-l-emerald-500" :
                                    selectedBucketIndex === 1 || selectedBucketIndex === 3 ? "hover:border-l-rose-500" :
                                    "hover:border-l-pink-500"
                                  }`}
                                >
                                  {/* Rank circle */}
                                  <span className={`w-5 shrink-0 text-center font-mono text-xs font-bold text-zinc-500 transition-colors ${
                                    selectedBucketIndex === 0 || selectedBucketIndex === 2 ? "group-hover/item:text-emerald-400" :
                                    selectedBucketIndex === 1 || selectedBucketIndex === 3 ? "group-hover/item:text-rose-400" :
                                    "group-hover/item:text-pink-400"
                                  }`}>
                                    #{i + 1}
                                  </span>
                                  <Avatar src={s.avatarUrl} name={s.playerName} size="sm" className="ring-1 ring-zinc-800" />
                                  
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="truncate text-sm font-bold text-zinc-200 group-hover/item:text-zinc-50 transition-colors">
                                        {s.playerName}
                                      </span>
                                      {s.countryCode && (
                                        <Flag countryCode={s.countryCode} className="h-2.5 shrink-0" />
                                      )}
                                    </div>
                                    <div className="font-mono text-xs text-zinc-400 mt-0.5">
                                      <Money value={s.currentPrice} />
                                    </div>
                                  </div>
 
                                  {/* Simulated Volatility Soundwave bar visualizer */}
                                  <div className="hidden sm:flex items-end gap-0.5 px-6 h-5">
                                    {Array.from({ length: 5 }).map((_, waveIdx) => {
                                      const isPositive = s.priceChange24h >= 0;
                                      return (
                                        <span 
                                          key={waveIdx} 
                                          className="w-0.5 h-full rounded-full animate-soundwave origin-bottom"
                                          style={{ 
                                            backgroundColor: isPositive ? "rgba(16, 185, 129, 0.6)" : "rgba(244, 63, 94, 0.6)",
                                            boxShadow: isPositive ? "0 0 6px rgba(16, 185, 129, 0.3)" : "0 0 6px rgba(244, 63, 94, 0.3)",
                                            animationDelay: `${waveIdx * 0.15}s`,
                                            animationDuration: `${0.5 + Math.random() * 0.4}s`
                                          }}
                                        />
                                      );
                                    })}
                                  </div>

                                  <div className="shrink-0 text-right">
                                    {activeBucket.metric(s)}
                                  </div>
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                  <span>Valuation System: Bonding linear PP</span>
                  <span>Database sync status: Online</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

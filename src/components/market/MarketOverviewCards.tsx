"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendUp, TrendDown, Coins, Trophy, CaretRight, ArrowsDownUp } from "@phosphor-icons/react";
import type { MarketOverview, StockSort } from "@/lib/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { PriceChange } from "@/components/ui/PriceChange";
import { Money } from "@/components/ui/Money";
import { Coin } from "@/components/ui/Coin";
import { formatNumber, formatCompact } from "@/lib/format";
import { spring } from "@/lib/motion";

export function MarketOverviewCards({
  overview,
  onSortChange,
}: {
  overview: MarketOverview;
  onSortChange?: (val: StockSort) => void;
}) {
  const sortByVolume = () => {
    onSortChange?.("volume_desc");
    document.getElementById("stock-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* 1. Total Stocks */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={spring}
        className="glass relative overflow-hidden rounded-2xl p-5 border border-zinc-800/80 hover:border-pink-500/30 hover:shadow-[0_0_25px_rgba(236,72,153,0.06)] group"
      >
        <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-pink-500/30 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-pink-500/30 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/3 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/5 transition-all duration-500" />
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:border-pink-500/30 transition-all duration-300">
            <Trophy size={20} weight="bold" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Stocks</span>
            <span className="text-2xl font-mono font-black text-zinc-100 mt-0.5 block">
              {formatNumber(overview.totalStocks)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Total Volume — click/Enter to sort the market by volume */}
      <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        role="button"
        tabIndex={0}
        aria-label="Sort the market by total volume"
        onClick={sortByVolume}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sortByVolume();
          }
        }}
        transition={spring}
        className="glass relative overflow-hidden rounded-2xl p-5 border border-zinc-800/80 hover:border-cyan-500/35 hover:shadow-[0_0_25px_rgba(6,182,212,0.08)] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
      >
        <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-cyan-500/30 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-cyan-500/30 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/3 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/5 transition-all duration-500" />
        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[8px] font-bold text-cyan-400 uppercase tracking-wider opacity-80 transition-opacity group-hover:opacity-100">
          <ArrowsDownUp size={9} weight="bold" />
          Sort
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300">
            <Coins size={20} weight="bold" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Volume</span>
            <span className="text-2xl font-mono font-black text-zinc-100 mt-0.5 flex items-center gap-1.5">
              <Coin />
              {formatCompact(overview.totalVolume)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 3. Top Gainer */}
      {overview.topGainer ? (
        <Link href={`/stocks/${overview.topGainer.stockId}`} className="block">
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="glass relative overflow-hidden rounded-2xl p-5 border border-zinc-800/80 hover:border-pink-500/35 hover:shadow-[0_0_25px_rgba(236,72,153,0.07)] group h-full flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-pink-500/30 to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-pink-500/30 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/4 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-500/6 transition-all duration-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <TrendUp size={14} weight="bold" className="text-pink-500" />
                <span>Top Gainer</span>
              </div>
              <CaretRight
                size={14}
                weight="bold"
                className="text-pink-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={overview.topGainer.avatarUrl} name={overview.topGainer.playerName} size="sm" className="border border-pink-500/20 group-hover:scale-105 transition-transform" />
              <span className="truncate text-base font-bold text-zinc-100 transition-colors group-hover:text-pink-400">
                {overview.topGainer.playerName}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-3">
              <span className="font-mono text-xl font-bold tabular-nums text-zinc-50">
                <Money value={overview.topGainer.currentPrice} />
              </span>
              <PriceChange value={overview.topGainer.priceChange24h} className="text-xs" />
            </div>
          </motion.div>
        </Link>
      ) : (
        <div className="glass rounded-2xl p-5 border border-zinc-800/80 flex flex-col justify-between h-full text-zinc-500 text-sm">
          No top gainer yet
        </div>
      )}

      {/* 4. Top Loser */}
      {overview.topLoser ? (
        <Link href={`/stocks/${overview.topLoser.stockId}`} className="block">
          <motion.div
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="glass relative overflow-hidden rounded-2xl p-5 border border-zinc-800/80 hover:border-cyan-500/35 hover:shadow-[0_0_25px_rgba(6,182,212,0.07)] group h-full flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-8 h-[1px] bg-gradient-to-r from-cyan-500/30 to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-8 bg-gradient-to-b from-cyan-500/30 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/4 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/6 transition-all duration-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <TrendDown size={14} weight="bold" className="text-cyan-400" />
                <span>Top Loser</span>
              </div>
              <CaretRight
                size={14}
                weight="bold"
                className="text-cyan-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar src={overview.topLoser.avatarUrl} name={overview.topLoser.playerName} size="sm" className="border border-cyan-500/20 group-hover:scale-105 transition-transform" />
              <span className="truncate text-base font-bold text-zinc-100 transition-colors group-hover:text-cyan-400">
                {overview.topLoser.playerName}
              </span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-3">
              <span className="font-mono text-xl font-bold tabular-nums text-zinc-50">
                <Money value={overview.topLoser.currentPrice} />
              </span>
              <PriceChange value={overview.topLoser.priceChange24h} className="text-xs" />
            </div>
          </motion.div>
        </Link>
      ) : (
        <div className="glass rounded-2xl p-5 border border-zinc-800/80 flex flex-col justify-between h-full text-zinc-500 text-sm">
          No top loser yet
        </div>
      )}
    </div>
  );
}

"use client";

// A richer "top mover" card for the market overview bento. Client component so it
// can carry a motion hover lift. Handles a null mover with a muted placeholder.
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendUp, TrendDown, CaretRight } from "@phosphor-icons/react";
import type { TopMover } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { PriceChange } from "@/components/ui/PriceChange";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { spring } from "@/lib/motion";

export function MoverCard({
  label,
  mover,
  tone,
}: {
  label: string;
  mover: TopMover | null;
  tone: "success" | "danger";
}) {
  const accent = tone === "success" ? "text-emerald-400" : "text-rose-400";
  const Icon = tone === "success" ? TrendUp : TrendDown;

  if (!mover || !mover.stockId) {
    return (
      <Card className="h-full">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
          <Icon size={14} weight="bold" className={accent} />
          {label}
        </div>
        <div className="mt-6 text-sm text-zinc-500">No movers yet</div>
      </Card>
    );
  }

  return (
    <Link href={`/stocks/${mover.stockId}`} className="block h-full">
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        className="group h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.8)] transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
            <Icon size={14} weight="bold" className={accent} />
            {label}
          </div>
          <CaretRight
            size={16}
            weight="bold"
            className="text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <Avatar src={mover.avatarUrl} name={mover.playerName} size="sm" />
          <span className="truncate text-lg font-medium text-zinc-100">
            {mover.playerName}
          </span>
        </div>

        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="font-mono text-2xl font-semibold tabular-nums text-zinc-50">
            <Money value={mover.currentPrice} />
          </span>
          <PriceChange value={mover.priceChange24h} className="text-sm" />
        </div>
      </motion.div>
    </Link>
  );
}

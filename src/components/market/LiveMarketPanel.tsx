"use client";

// Decorative "live market" panel for the logged-out hero. Self-contained and
// isolated: the perpetual marquee + float loops live here so they never re-render
// the page. Uses real osu names with organic numbers — purely presentational.
import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { PriceChange } from "@/components/ui/PriceChange";
import { StatusDot } from "@/components/ui/StatusDot";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";

type Row = {
  name: string;
  price: number;
  change: number;
};

// Real osu names, organic numbers — decorative only.
const ROWS: Row[] = [
  { name: "mrekk", price: 175.25, change: 4.12 },
  { name: "Cookiezi", price: 142.8, change: -2.37 },
  { name: "Aricin", price: 98.64, change: 7.91 },
  { name: "mrekk", price: 173.05, change: -1.18 },
  { name: "Cookiezi", price: 146.42, change: 3.06 },
  { name: "Aricin", price: 95.71, change: -5.44 },
];

function TickerRow({ row }: { row: Row }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <span className="flex items-center gap-2.5 text-sm font-medium text-zinc-200">
        <Avatar name={row.name} size="sm" />
        <span className="truncate">{row.name}</span>
      </span>
      <div className="flex items-center gap-5">
        <span className="font-mono text-sm tabular-nums text-zinc-400">
          <Money value={row.price} />
        </span>
        <PriceChange value={row.change} className="text-sm" />
      </div>
    </div>
  );
}

function LiveMarketPanelBase() {
  return (
    <motion.div
      // Gentle perpetual float — isolated to this subtree.
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <StatusDot tone="pink" />
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              Live Movers
            </span>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-zinc-600">
            24h
          </span>
        </div>

        {/* Seamless vertical marquee: two identical stacks scrolled by -50%. */}
        <div className="relative h-[280px] overflow-hidden">
          <motion.div
            animate={{ y: ["0%", "-50%"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            <div className="divide-y divide-zinc-800/60">
              {ROWS.map((row, i) => (
                <TickerRow key={`a-${i}`} row={row} />
              ))}
            </div>
            <div className="divide-y divide-zinc-800/60" aria-hidden="true">
              {ROWS.map((row, i) => (
                <TickerRow key={`b-${i}`} row={row} />
              ))}
            </div>
          </motion.div>

          {/* Soft top/bottom fade so rows dissolve at the edges. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-900/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>
      </Card>
    </motion.div>
  );
}

export const LiveMarketPanel = memo(LiveMarketPanelBase);

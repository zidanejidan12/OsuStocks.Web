"use client";

// "Live movers" panel for the logged-out hero. Pulls real top movers from the
// public /market/movers endpoint and scrolls them in a seamless marquee. The
// perpetual float/marquee loops are isolated here so they never re-render the page.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLiveMovers } from "@/lib/api/client";
import type { LiveMover } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { PriceChange } from "@/components/ui/PriceChange";
import { StatusDot } from "@/components/ui/StatusDot";
import { Skeleton } from "@/components/ui/Skeleton";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";

function TickerRow({ row }: { row: LiveMover }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-zinc-200">
        <Avatar src={row.avatarUrl} name={row.playerName} size="sm" />
        <span className="truncate">{row.playerName}</span>
      </span>
      <div className="flex items-center gap-5">
        <span className="font-mono text-sm tabular-nums text-zinc-400">
          <Money value={row.currentPrice} />
        </span>
        <PriceChange value={row.priceChange24h} className="text-sm" />
      </div>
    </div>
  );
}

function LiveMarketPanelBase() {
  const [rows, setRows] = useState<LiveMover[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLiveMovers(8)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Duplicate the row set so the -50% marquee loops seamlessly.
  const loop = rows ? [...rows, ...rows] : [];

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

        <div className="relative h-[280px] overflow-hidden">
          {rows === null ? (
            <div className="divide-y divide-zinc-800/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-6 px-5 py-3.5"
                >
                  <span className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </span>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="grid h-full place-items-center px-6 text-center text-sm text-zinc-500">
              Markets are warming up — check back soon.
            </div>
          ) : (
            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <div className="divide-y divide-zinc-800/60">
                {loop.slice(0, rows.length).map((row, i) => (
                  <TickerRow key={`a-${i}`} row={row} />
                ))}
              </div>
              <div className="divide-y divide-zinc-800/60" aria-hidden="true">
                {loop.slice(rows.length).map((row, i) => (
                  <TickerRow key={`b-${i}`} row={row} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Soft top/bottom fade so rows dissolve at the edges. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-900/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>
      </Card>
    </motion.div>
  );
}

export const LiveMarketPanel = LiveMarketPanelBase;

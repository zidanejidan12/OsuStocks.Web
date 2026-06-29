"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { getLiveMovers } from "@/lib/api/client";
import type { LiveMover } from "@/lib/api/types";
import { Avatar } from "@/components/ui/Avatar";
import { Money } from "@/components/ui/Money";
import { PriceChange } from "@/components/ui/PriceChange";
import { StatusDot } from "@/components/ui/StatusDot";
import { SponsorCredit } from "@/components/SponsorCredit";
import { useAuth } from "@/lib/auth/auth-context";

const STORAGE_KEY = "osustocks.ticker.hidden";
const POLL_MS = 45_000; // prices update on the sync cron; this is "live-ish" enough
const LIMIT = 18;
const ITEM_WRAP = "inline-flex items-center gap-2 rounded";

function ItemBody({ m }: { m: LiveMover }) {
  return (
    <>
      {/* Decorative: the player name below already names the stock for screen readers. */}
      <span aria-hidden="true">
        <Avatar src={m.avatarUrl} name={m.playerName} size="xs" />
      </span>
      <span className="font-medium text-zinc-300">{m.playerName}</span>
      <span className="font-mono tabular-nums text-zinc-400">
        <Money value={m.currentPrice} />
      </span>
      <PriceChange value={m.priceChange24h} className="text-xs" />
    </>
  );
}

// One ticker entry. `linked` makes it a real stock link (logged-in only); the
// loop-duplicate and the guest view pass linked=false (plain, non-interactive).
function Item({ m, linked }: { m: LiveMover; linked: boolean }) {
  return (
    <span className="mx-5 inline-flex items-center gap-2 whitespace-nowrap text-sm">
      {linked ? (
        <Link
          href={`/stocks/${m.stockId}`}
          className={`${ITEM_WRAP} transition-colors hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50`}
        >
          <ItemBody m={m} />
        </Link>
      ) : (
        <span className={ITEM_WRAP}>
          <ItemBody m={m} />
        </span>
      )}
      <span aria-hidden="true" className="ml-3 text-zinc-700">
        &bull;
      </span>
    </span>
  );
}

/**
 * Global "news-TV"-style live market ticker fixed to the bottom of every page.
 *
 * Accessibility (audit-aligned):
 * - For guests it is fully decorative (aria-hidden, non-interactive) — the same
 *   data lives on /market & /trending.
 * - For signed-in users the visible copy holds REAL, focusable stock links and the
 *   region is labelled; the loop-duplicate copy is aria-hidden + non-interactive, so
 *   screen readers hear each stock once and there is no interactive content inside a
 *   hidden subtree.
 * - Respects prefers-reduced-motion (static, scrollable strip), pauses on hover AND
 *   keyboard focus (so a focused link doesn't scroll away) and via an explicit
 *   button, and is dismissible (remembered in localStorage). Polls the public
 *   /movers endpoint, so it works for guests too.
 */
export function MarketTicker() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const reduce = useReducedMotion();
  const { user } = useAuth();
  const clickable = !!user;

  const [movers, setMovers] = useState<LiveMover[] | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMovers = () =>
      getLiveMovers(LIMIT)
        .then((d) => {
          if (!cancelled) setMovers(d);
        })
        .catch(() => {});
    fetchMovers();
    const id = setInterval(fetchMovers, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!movers || movers.length === 0) return null;

  const paused = hovered || focused || userPaused;
  const durationSec = Math.max(10, movers.length * 1.5);

  return (
    <>
      {/* Spacer keeps the fixed bar from covering the document end (footer). */}
      <div aria-hidden="true" className="h-9" />
      <aside
        aria-label="Live market movers"
        className="fixed bottom-0 z-40 flex h-9 items-center border-t border-zinc-900/50 bg-zinc-950/50 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out"
        style={{
          width: "100%",
          left: 0,
          transform: collapsed ? "translateX(calc(-100% + 64px))" : "translateX(0)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {/* Ticker Content wrapper - fades out when collapsed */}
        <div className={`flex flex-1 items-center min-w-0 transition-all duration-500 h-full ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <div className="flex h-full shrink-0 items-center gap-1.5 border-r border-zinc-800/40 px-3">
            <StatusDot tone="pink" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Live
            </span>
          </div>

          {/* Pinned sponsor slug — doesn't scroll with the marquee; hidden on the
              narrowest screens so the moving strip keeps room. */}
          <div className="hidden h-full shrink-0 items-center border-r border-zinc-800/40 px-3 sm:flex">
            <SponsorCredit className="text-[11px] text-zinc-500" />
          </div>

          <div className="relative flex-1 overflow-hidden">
            {reduce ? (
              // Reduced motion: static, manually-scrollable strip (no animation).
              <div
                className="flex items-center overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-hidden={clickable ? undefined : true}
              >
                {movers.map((m, i) => (
                  <Item key={i} m={m} linked={clickable} />
                ))}
              </div>
            ) : (
              <div
                className="flex w-max items-center will-change-transform"
                aria-hidden={clickable ? undefined : true}
                style={{
                  animation: `ticker-marquee ${durationSec}s linear infinite`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              >
                {/* Accessible copy (real links when signed in). */}
                {movers.map((m, i) => (
                  <Item key={`a${i}`} m={m} linked={clickable} />
                ))}
                {/* Loop duplicate — always hidden + non-interactive. */}
                <span aria-hidden="true" className="inline-flex items-center">
                  {movers.map((m, i) => (
                    <Item key={`b${i}`} m={m} linked={false} />
                  ))}
                </span>
              </div>
            )}
          </div>

          {!reduce && (
            <div className="flex h-full shrink-0 items-center border-l border-zinc-800/40 px-2">
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Resume ticker" : "Pause ticker"}
                className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
              >
                {userPaused ? (
                  <Play size={14} weight="bold" />
                ) : (
                  <Pause size={14} weight="bold" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Slide Toggle Switch Area */}
        <div className="flex h-full w-[64px] shrink-0 items-center justify-center border-l border-zinc-800/40 bg-zinc-950/80 backdrop-blur-md z-50">
          <div 
            onClick={() => setCollapsed(!collapsed)}
            className={`w-11 h-6 rounded-full border transition-colors duration-300 flex items-center p-0.5 cursor-pointer relative ${
              collapsed 
                ? "bg-zinc-900 border-zinc-800 justify-start" 
                : "bg-pink-500/20 border-pink-500/30 justify-end"
            }`}
            title={collapsed ? "Slide right to expand" : "Slide left to collapse"}
          >
            {/* Draggable/Animated Thumb */}
            <motion.div
              layout
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(event, info) => {
                if (info.offset.x < -10 && !collapsed) {
                  setCollapsed(true);
                }
                if (info.offset.x > 10 && collapsed) {
                  setCollapsed(false);
                }
              }}
              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md transition-colors duration-300 ${
                collapsed 
                  ? "bg-zinc-500" 
                  : "bg-pink-500"
              }`}
            >
              {collapsed ? (
                <CaretRight size={10} weight="bold" className="text-zinc-950" />
              ) : (
                <CaretLeft size={10} weight="bold" className="text-white" />
              )}
            </motion.div>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { Pause, Play, X } from "@phosphor-icons/react";
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
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const clickable = !!user;

  const [movers, setMovers] = useState<LiveMover[] | null>(null);
  const [hidden, setHidden] = useState(true); // hidden until we read the pref (no flash)
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    setHidden(
      typeof window !== "undefined" &&
        window.localStorage.getItem(STORAGE_KEY) === "1",
    );
  }, []);

  useEffect(() => {
    if (hidden) return;
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
  }, [hidden]);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => {
          setHidden(false);
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {}
        }}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-950/90 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-pink-500/40 hover:bg-zinc-900/30 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 group-hover:text-zinc-200">
          Show Ticker
        </span>
      </button>
    );
  }

  if (!movers || movers.length === 0) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const paused = hovered || focused || userPaused;
  const durationSec = Math.max(24, movers.length * 4);

  return (
    <>
      {/* Spacer keeps the fixed bar from covering the document end (footer). */}
      <div aria-hidden="true" className="h-9" />
      <aside
        aria-label="Live market movers"
        className="fixed inset-x-0 bottom-0 z-40 flex h-9 items-center border-t border-zinc-900/50 bg-zinc-950/50 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
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

        <div className="flex h-full shrink-0 items-center gap-1 border-l border-zinc-800/40 px-2">
          {!reduce && (
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
          )}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hide live ticker"
            className="grid h-7 w-7 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      </aside>
    </>
  );
}

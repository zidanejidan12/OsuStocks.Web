"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play, X } from "@phosphor-icons/react";
import { getLiveMovers } from "@/lib/api/client";
import type { LiveMover } from "@/lib/api/types";
import { Money } from "@/components/ui/Money";
import { PriceChange } from "@/components/ui/PriceChange";
import { StatusDot } from "@/components/ui/StatusDot";

const STORAGE_KEY = "osustocks.ticker.hidden";
const POLL_MS = 45_000; // prices update on the sync cron; this is "live-ish" enough
const LIMIT = 18;

function TickerItem({ m }: { m: LiveMover }) {
  return (
    <span className="mx-5 inline-flex items-center gap-2 whitespace-nowrap text-sm">
      <span className="font-medium text-zinc-300">{m.playerName}</span>
      <span className="font-mono tabular-nums text-zinc-400">
        <Money value={m.currentPrice} />
      </span>
      <PriceChange value={m.priceChange24h} className="text-xs" />
      <span aria-hidden="true" className="ml-3 text-zinc-700">
        &bull;
      </span>
    </span>
  );
}

/**
 * Global "news-TV"-style live market ticker fixed to the bottom of every page.
 * Decorative (aria-hidden marquee — the same data lives on /market and /trending),
 * reduced-motion-safe (static, scrollable strip when reduced), pausable (hover +
 * button), and dismissible (remembered in localStorage). Polls the public /movers
 * endpoint, so it works for guests too.
 */
export function MarketTicker() {
  const reduce = useReducedMotion();
  const [movers, setMovers] = useState<LiveMover[] | null>(null);
  const [hidden, setHidden] = useState(true); // hidden until we read the pref (no flash)
  const [hovered, setHovered] = useState(false);
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

  if (hidden || !movers || movers.length === 0) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const paused = hovered || userPaused;
  const track = [...movers, ...movers]; // two copies → seamless -50% loop
  const durationSec = Math.max(24, movers.length * 4);

  return (
    <>
      {/* Spacer keeps the fixed bar from covering the document end (footer). */}
      <div aria-hidden="true" className="h-9" />
      <aside
        aria-label="Live market ticker"
        className="fixed inset-x-0 bottom-0 z-40 flex h-9 items-center border-t border-white/10 bg-zinc-950/85 backdrop-blur-xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex h-full shrink-0 items-center gap-1.5 border-r border-white/10 px-3">
          <StatusDot tone="pink" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Live
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          {reduce ? (
            // Reduced motion: a static, manually-scrollable strip (no animation).
            <div
              aria-hidden="true"
              className="flex items-center overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {movers.map((m, i) => (
                <TickerItem key={i} m={m} />
              ))}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="flex w-max items-center will-change-transform"
              style={{
                animation: `ticker-marquee ${durationSec}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              {track.map((m, i) => (
                <TickerItem key={i} m={m} />
              ))}
            </div>
          )}
        </div>

        <div className="flex h-full shrink-0 items-center gap-1 border-l border-white/10 px-2">
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

"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pulse,
  TrendUp,
  TrendDown,
  ArrowsLeftRight,
  Sparkle,
  Pause,
  Play,
  WarningCircle,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { getMarketEvents, ApiError } from "@/lib/api/client";
import type { MarketEvent } from "@/lib/api/types";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

const PAGE_SIZE = 30;
const POLL_MS = 30_000;

function eventIcon(e: MarketEvent): { Icon: PhosphorIcon; tone: string } {
  switch (e.type) {
    case "PriceChange":
      return (e.priceChange ?? 0) >= 0
        ? { Icon: TrendUp, tone: "text-emerald-400" }
        : { Icon: TrendDown, tone: "text-rose-400" };
    case "Trade":
      return { Icon: ArrowsLeftRight, tone: "text-sky-400" };
    case "NewStock":
      return { Icon: Sparkle, tone: "text-pink-400" };
    case "Halted":
      return { Icon: Pause, tone: "text-rose-400" };
    case "Resumed":
      return { Icon: Play, tone: "text-emerald-400" };
    default:
      return { Icon: Pulse, tone: "text-zinc-400" };
  }
}

function eventDetail(e: MarketEvent): ReactNode {
  switch (e.type) {
    case "PriceChange":
      return typeof e.priceChange === "number" ? (
        <PriceChange value={e.priceChange} />
      ) : null;
    case "Trade":
      return typeof e.quantity === "number" ? (
        <span className="font-mono text-sm tabular-nums text-zinc-300">
          {formatNumber(e.quantity)} sh
        </span>
      ) : null;
    default:
      return typeof e.price === "number" ? (
        <span className="font-mono text-sm tabular-nums text-zinc-400">
          <Money value={e.price} />
        </span>
      ) : null;
  }
}

function eventLabel(e: MarketEvent): string {
  switch (e.type) {
    case "PriceChange":
      return "Price moved";
    case "Trade":
      return "Shares traded";
    case "NewStock":
      return "New stock listed";
    case "Halted":
      return "Trading halted";
    case "Resumed":
      return "Trading resumed";
    default:
      return "Market event";
  }
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</div>;
}

function ActivitySkeleton() {
  return (
    <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monotonic request id: if a newer loadPage starts before an older one's
  // response lands (e.g. the 30s poll racing a "Load more"), the stale response
  // is dropped instead of clobbering the freshly-appended rows.
  const seqRef = useRef(0);
  const loadPage = useCallback(async (nextPage: number) => {
    const seq = ++seqRef.current;
    const result = await getMarketEvents({ page: nextPage, pageSize: PAGE_SIZE });
    if (seq !== seqRef.current) return;
    setEvents((prev) =>
      nextPage === 1 ? result.items : [...prev, ...result.items],
    );
    setPage(nextPage);
    if (typeof result.totalCount === "number") {
      setHasMore(nextPage * PAGE_SIZE < result.totalCount);
    } else {
      setHasMore(result.items.length === PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    loadPage(1)
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load activity.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  // Quietly refresh the top of the feed while the user is on page 1.
  useEffect(() => {
    if (page !== 1) return;
    const interval = setInterval(() => {
      loadPage(1).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [page, loadPage]);

  const onLoadMore = () => {
    setLoadingMore(true);
    loadPage(page + 1)
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
              Market Activity
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              A live stream of price moves and trades across the market.
            </p>
          </div>
        </header>
      </Reveal>

      {loading && <ActivitySkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && events.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Pulse size={20} weight="bold" />}
            title="No activity yet"
            message="Price changes and trades will stream in here as they happen."
          />
        </Reveal>
      )}

      {!loading && !error && events.length > 0 && (
        <Reveal>
          <motion.div
            className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {events.map((e) => {
              const { Icon, tone } = eventIcon(e);
              return (
                <motion.div key={e.eventId} variants={fadeUp}>
                  <Link
                    href={`/stocks/${e.stockId}`}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-800/40"
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-800/70 ${tone}`}>
                      <Icon size={16} weight="bold" />
                    </span>
                    <Avatar src={e.avatarUrl} name={e.playerName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-100">
                        {e.playerName}
                      </div>
                      <div className="text-xs text-zinc-500">{eventLabel(e)}</div>
                    </div>
                    <div className="shrink-0 text-right">{eventDetail(e)}</div>
                    <span className="w-12 shrink-0 text-right text-[11px] text-zinc-600 sm:w-16 sm:text-xs">
                      {formatRelativeTime(e.occurredAt)}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </Reveal>
      )}

      {!loading && !error && hasMore && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </PageShell>
  );
}

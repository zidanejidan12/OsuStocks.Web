"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, WarningCircle } from "@phosphor-icons/react";
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
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

const PAGE_SIZE = 25;

// Gold / silver / bronze chips for the podium; plain otherwise.
function rankChip(rank: number): string {
  if (rank === 1) return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  if (rank === 2) return "bg-zinc-400/15 text-zinc-200 ring-zinc-400/30";
  if (rank === 3) return "bg-orange-600/15 text-orange-300 ring-orange-600/30";
  return "bg-zinc-800/70 text-zinc-400 ring-zinc-700/50";
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</div>;
}

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-7 w-7 rounded-lg" />
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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (nextPage: number) => {
    const result = await getLeaderboard({ page: nextPage, pageSize: PAGE_SIZE });
    setEntries((prev) =>
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
          err instanceof ApiError ? err.message : "Failed to load leaderboard.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const onLoadMore = () => {
    setLoadingMore(true);
    loadPage(page + 1)
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Traders ranked by portfolio value.
          </p>
        </header>
      </Reveal>

      {loading && <LeaderboardSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && entries.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Trophy size={20} weight="bold" />}
            title="No rankings yet"
            message="The leaderboard fills up as traders build their portfolios."
          />
        </Reveal>
      )}

      {!loading && !error && entries.length > 0 && (
        <Reveal>
          <motion.ul
            className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {entries.map((e) => {
              const isMe = user?.userId === e.userId;
              return (
                <motion.li
                  key={e.userId}
                  variants={fadeUp}
                  whileHover={{ backgroundColor: "rgba(24,24,27,0.5)" }}
                  transition={spring}
                  className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${
                    isMe ? "bg-pink-500/[0.06]" : ""
                  }`}
                >
                  <span
                    className={`grid h-7 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums ring-1 ring-inset ${rankChip(
                      e.rank,
                    )}`}
                  >
                    {e.rank}
                  </span>
                  <Avatar src={e.avatarUrl} name={e.username} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-zinc-100">
                        {e.username}
                      </span>
                      {isMe && <Badge tone="accent">You</Badge>}
                      {e.countryCode && (
                        <Flag countryCode={e.countryCode} className="h-3" />
                      )}
                    </div>
                    {typeof e.profitLoss === "number" && (
                      <div className="mt-0.5 text-xs">
                        <PriceChange value={e.profitLoss} />
                      </div>
                    )}
                  </div>
                  <div className="ml-auto text-right font-mono text-sm font-semibold tabular-nums text-zinc-50">
                    <Money value={e.portfolioValue} />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
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

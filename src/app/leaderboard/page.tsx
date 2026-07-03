"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  CaretLeft,
  CaretRight,
  WarningCircle,
} from "@phosphor-icons/react";
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
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

const PAGE_SIZE = 25;

type Period = "all" | "monthly" | "weekly" | "daily";
const PERIODS: { value: Period; label: string }[] = [
  { value: "all", label: "All-time" },
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];
const PERIOD_NOTE: Record<Period, string> = {
  all: "all-time",
  monthly: "this month",
  weekly: "this week",
  daily: "today",
};

// Gold / silver / bronze accents for the podium; plain otherwise.
function rankChip(rank: number): string {
  if (rank === 1) return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  if (rank === 2) return "bg-zinc-400/15 text-zinc-200 ring-zinc-400/30";
  if (rank === 3) return "bg-orange-600/15 text-orange-300 ring-orange-600/30";
  return "bg-zinc-800/70 text-zinc-400 ring-zinc-700/50";
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="h-7 w-9 rounded-lg" />
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

// Top-3 highlight shown on page 1.
function PodiumCard({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const top = entry.rank === 1;
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border bg-zinc-900/40 p-4 text-center ring-1 ring-inset ${
        top
          ? "border-amber-500/30 ring-amber-500/20 sm:-translate-y-2"
          : "border-zinc-800/80 ring-transparent"
      } ${isMe ? "bg-pink-500/[0.06]" : ""}`}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-full ring-1 ring-inset ${rankChip(
          entry.rank,
        )}`}
      >
        {top ? (
          <Trophy size={18} weight="fill" />
        ) : (
          <Medal size={18} weight="fill" />
        )}
      </span>
      <div className="mt-3">
        <Avatar src={entry.avatarUrl} name={entry.username} size="md" />
      </div>
      <div className="mt-2 flex max-w-full items-center gap-1.5">
        <span className="truncate text-sm font-medium text-zinc-100">
          {entry.username}
        </span>
        {entry.countryCode && (
          <Flag countryCode={entry.countryCode} className="h-3 shrink-0" />
        )}
      </div>
      {entry.equippedTitle && (
        <div className="mt-1 max-w-full truncate text-[11px] font-medium text-pink-300">
          {entry.equippedTitle}
        </div>
      )}
      {isMe && (
        <div className="mt-1">
          <Badge tone="accent">You</Badge>
        </div>
      )}
      <div className="mt-2 font-mono text-base font-semibold tabular-nums text-zinc-50">
        <Money value={entry.portfolioValue} />
      </div>
      {typeof entry.profitLoss === "number" && (
        <div className="mt-0.5 text-xs">
          <PriceChange value={entry.profitLoss} />
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<Period>("all");
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true); // initial load -> skeleton
  const [busy, setBusy] = useState(false); // page/period transition -> dim
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage: number, nextPeriod: Period) => {
    const result = await getLeaderboard({
      page: nextPage,
      pageSize: PAGE_SIZE,
      period: nextPeriod === "all" ? undefined : nextPeriod,
    });
    setEntries(result.items);
    setPage(nextPage);
    setPeriod(nextPeriod);
    setHasMore(
      typeof result.totalCount === "number"
        ? nextPage * PAGE_SIZE < result.totalCount
        : result.items.length === PAGE_SIZE,
    );
  }, []);

  // Initial load: page 1, all-time.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load(1, "all")
      .catch((err) => {
        if (!cancelled)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = (nextPage: number, nextPeriod: Period) => {
    setBusy(true);
    setError(null);
    load(nextPage, nextPeriod)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Failed to load leaderboard.",
        ),
      )
      .finally(() => setBusy(false));
  };

  const isFirstPage = page === 1;
  const podium = isFirstPage ? entries.slice(0, 3) : [];
  const listEntries = isFirstPage ? entries.slice(3) : entries;

  return (
    <PageShell>
      <Reveal>
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Traders ranked by portfolio value &mdash; {PERIOD_NOTE[period]}.
          </p>
        </header>
      </Reveal>

      {/* Period filter */}
      <div
        className="mb-6 inline-flex rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-1"
        role="group"
        aria-label="Leaderboard time period"
      >
        {PERIODS.map((p) => {
          const active = p.value === period;
          return (
            <button
              key={p.value}
              type="button"
              aria-pressed={active}
              disabled={busy || loading}
              onClick={() => !active && navigate(1, p.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 disabled:opacity-60 ${
                active
                  ? "bg-zinc-800 text-zinc-100 ring-1 ring-inset ring-white/5"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {loading && <LeaderboardSkeleton />}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={<Trophy size={20} weight="bold" />}
          title="No rankings yet"
          message="The leaderboard fills up as traders build their portfolios."
        />
      )}

      {!loading && !error && entries.length > 0 && (
        <div
          className={busy ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}
          aria-busy={busy}
        >
          {podium.length > 0 && (
            <ul className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {podium.map((e) => (
                <li key={e.userId}>
                  <PodiumCard entry={e} isMe={user?.userId === e.userId} />
                </li>
              ))}
            </ul>
          )}

          {listEntries.length > 0 && (
            <motion.ul
              className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {listEntries.map((e) => {
                const isMe = user?.userId === e.userId;
                return (
                  <motion.li
                    key={e.userId}
                    variants={fadeUp}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-colors motion-safe:hover:bg-zinc-800/50 ${
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
                        {e.equippedTitle && (
                          <span className="hidden shrink-0 truncate rounded bg-pink-500/10 px-1.5 py-0.5 text-[10px] font-medium text-pink-300 ring-1 ring-inset ring-pink-500/25 sm:inline">
                            {e.equippedTitle}
                          </span>
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
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && entries.length > 0 && (page > 1 || hasMore) && (
        <nav
          className="mt-6 flex items-center justify-between gap-3"
          aria-label="Leaderboard pages"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(page - 1, period)}
            disabled={busy || page <= 1}
          >
            <CaretLeft size={16} weight="bold" />
            Previous
          </Button>
          <span className="text-sm tabular-nums text-zinc-400" aria-live="polite">
            Page {page}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(page + 1, period)}
            disabled={busy || !hasMore}
          >
            Next
            <CaretRight size={16} weight="bold" />
          </Button>
        </nav>
      )}
    </PageShell>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  WarningCircle,
} from "@phosphor-icons/react";
import { getTradeHistory, ApiError } from "@/lib/api/client";
import type { Trade } from "@/lib/api/types";
import { formatCurrency, formatDateTime, formatShares } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Coin } from "@/components/ui/Coin";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/components/ui/Toast";
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

const PAGE_SIZE = 25;

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        icon={<Lock size={20} weight="bold" />}
        title="Please log in"
        message="You need to be signed in to view your trade history."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">{children}</div>;
}

function TradesSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80">
      <div className="border-b border-zinc-800 px-4 py-3">
        <Skeleton className="h-3 w-full max-w-md" />
      </div>
      <div className="divide-y divide-zinc-800/60">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TradesPage() {
  const { user, loading: authLoading } = useAuth();
  const { notify } = useToast();
  const reduceMotion = useReducedMotion();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const loadPage = useCallback(async (nextPage: number) => {
    const result = await getTradeHistory({ page: nextPage, pageSize: PAGE_SIZE });
    setTrades((prev) =>
      nextPage === 1 ? result.items : [...prev, ...result.items],
    );
    setPage(nextPage);
    // Prefer totalCount when present; otherwise infer from a full page.
    if (typeof result.totalCount === "number") {
      setHasMore(nextPage * PAGE_SIZE < result.totalCount);
    } else {
      setHasMore(result.items.length === PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    loadPage(1)
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load trade history.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, loadPage]);

  const onLoadMore = () => {
    setLoadingMore(true);
    loadPage(page + 1)
      .catch((err) => {
        // Keep what we have, since a transient failure shouldn't wipe the list,
        // but surface it so the user knows the action didn't take.
        notify({
          tone: "danger",
          title: "Couldn't load more trades",
          message:
            err instanceof ApiError ? err.message : "Please try again.",
        });
      })
      .finally(() => setLoadingMore(false));
  };

  if (authLoading) {
    return (
      <PageShell>
        <TradesSkeleton />
      </PageShell>
    );
  }

  if (!user || unauthorized) {
    return (
      <PageShell>
        <Reveal>
          <PleaseLogIn />
        </Reveal>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
            Trade History
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Every buy and sell you&apos;ve executed, newest first.
          </p>
        </header>
      </Reveal>

      {loading && <TradesSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && trades.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Receipt size={20} weight="bold" />}
            title="No trades yet"
            message="Once you buy or sell a stock, it'll show up here."
            action={
              <Link href="/" className={buttonClasses({ size: "sm" })}>
                Browse the market
              </Link>
            }
          />
        </Reveal>
      )}

      {!loading && !error && trades.length > 0 && (
        <Reveal>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800/80">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Your trade history: player, trade type, quantity, unit price,
                total, and date.
              </caption>
              <thead>
                <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-zinc-800/60"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
              >
                {trades.map((t) => {
                  const isBuy = t.tradeType === "Buy";
                  return (
                    <motion.tr
                      key={t.tradeId}
                      variants={fadeUp}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : { backgroundColor: "rgba(24,24,27,0.5)" }
                      }
                      transition={spring}
                      className="transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/stocks/${t.stockId}`}
                          className="flex items-center gap-3 text-zinc-100 transition-colors hover:text-pink-400"
                        >
                          <Avatar src={t.avatarUrl} name={t.playerName} size="sm" />
                          <span className="font-medium">{t.playerName}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={isBuy ? "success" : "danger"}>
                          {isBuy ? (
                            <ArrowDownLeft size={14} weight="bold" />
                          ) : (
                            <ArrowUpRight size={14} weight="bold" />
                          )}
                          {t.tradeType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-300">
                        {formatShares(t.quantity)}
                      </td>
                      <td className="hidden px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400 sm:table-cell">
                        <Coin />
                        {formatCurrency(t.unitPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-100">
                        <Money value={t.totalAmount} />
                      </td>
                      <td className="hidden px-4 py-3.5 text-right font-mono tabular-nums text-zinc-500 sm:table-cell">
                        {formatDateTime(t.executedAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Wallet as WalletIcon,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  WarningCircle,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import {
  getWallet,
  getWalletTransactions,
  ApiError,
} from "@/lib/api/client";
import type { Wallet, WalletTransaction, WalletTransactionType } from "@/lib/api/types";
import { formatChange, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Coin } from "@/components/ui/Coin";
import { Money } from "@/components/ui/Money";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { spring, scaleIn, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import * as analytics from "@/lib/analytics";

// Credits flow money in; debits flow money out. Used for the Type column's
// icon + tone. (The Amount column is colored strictly by sign — see below.)
const CREDIT_TYPES: ReadonlySet<WalletTransactionType> = new Set([
  "InitialGrant",
  "SellStock",
  "DailyReward",
  "AdminGrant",
  "MissionReward",
  "AchievementReward",
]);

const TYPE_LABELS: Record<WalletTransactionType, string> = {
  InitialGrant: "Initial Grant",
  BuyStock: "Buy Stock",
  SellStock: "Sell Stock",
  DailyReward: "Daily Reward",
  AdminGrant: "Admin Grant",
  AdminDeduction: "Admin Deduction",
  MissionReward: "Mission Reward",
  AchievementReward: "Achievement Reward",
  TradeFee: "Trade Fee",
};

function humanizeType(type: WalletTransactionType): string {
  return TYPE_LABELS[type] ?? type;
}

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        icon={<Lock size={20} weight="bold" />}
        title="Please log in"
        message="You need to be signed in to view your wallet."
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
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-10">
      {/* Balance hero placeholder */}
      <Card className="p-7">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-56" />
          </div>
        </div>
      </Card>

      {/* Table placeholder */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="overflow-hidden rounded-2xl border border-zinc-800/80">
          <div className="border-b border-zinc-800 px-4 py-3">
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
          <div className="divide-y divide-zinc-800/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    // Resetting fetch state synchronously is intentional: it shows the loading
    // skeleton while we (re)fetch — the documented exception to
    // react-hooks/set-state-in-effect (this is not the derive-state anti-pattern).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    Promise.all([getWallet(), getWalletTransactions()])
      .then(([walletData, txData]) => {
        if (cancelled) return;
        setWallet(walletData);
        setTransactions(txData.items);
        analytics.track("wallet_viewed", { balance: walletData.balance });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load wallet."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <PageShell>
        <WalletSkeleton />
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
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
            Wallet
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your available balance and account activity.
          </p>
        </header>
      </Reveal>

      {loading && <WalletSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle
              size={18}
              weight="bold"
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && wallet && (
        <div className="space-y-10">
          {/* Balance hero */}
          <Reveal>
            <motion.div variants={scaleIn} initial="hidden" animate="show">
              <Card className="overflow-hidden p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-pink-500/30 bg-pink-500/15 text-pink-300">
                      <Coins size={28} weight="bold" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                        Balance
                      </div>
                      <div className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-5xl">
                        <Money value={wallet.balance} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400 sm:flex-col sm:items-end sm:text-right">
                    <WalletIcon size={16} weight="bold" className="text-zinc-400" />
                    <span>Available to trade</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Reveal>

          {/* Transactions */}
          <div>
            <Reveal>
              <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Transactions
              </h2>
            </Reveal>

            {transactions.length === 0 ? (
              <Reveal>
                <EmptyState
                  icon={<WalletIcon size={20} weight="bold" />}
                  title="No transactions yet"
                  message="Your wallet activity will appear here."
                />
              </Reveal>
            ) : (
              <Reveal>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/80">
                  <table className="w-full min-w-[32rem] text-sm">
                    <caption className="sr-only">
                      Wallet transactions: type, amount, and date.
                    </caption>
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
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
                      {transactions.map((tx) => {
                        const isCredit = CREDIT_TYPES.has(tx.transactionType);
                        const TypeIcon: PhosphorIcon = isCredit
                          ? ArrowDownLeft
                          : ArrowUpRight;
                        // Amounts are stored as positive magnitudes; the sign is
                        // relative to the wallet — debits (Buy, Fee, Deduction)
                        // are money out, so render them negative + red.
                        const signedAmount =
                          (isCredit ? 1 : -1) * Math.abs(tx.amount);

                        return (
                          <motion.tr
                            key={tx.transactionId}
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
                              <Badge tone={isCredit ? "success" : "danger"}>
                                <TypeIcon size={14} weight="bold" />
                                {humanizeType(tx.transactionType)}
                              </Badge>
                            </td>
                            <td
                              className={`px-4 py-3.5 text-right font-mono tabular-nums ${
                                isCredit ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {<><Coin />{formatChange(signedAmount)}</>}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-500">
                              {formatDateTime(tx.createdAt)}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </motion.tbody>
                  </table>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

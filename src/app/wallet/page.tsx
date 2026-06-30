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
  Cpu,
  Sparkle,
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

function VirtualCreditCard({ balance, username }: { balance: number; username: string }) {
  return (
    <Card className="relative overflow-hidden aspect-[1.586/1] w-full max-w-md p-6 flex flex-col justify-between border-0 bg-gradient-to-br from-pink-600 via-purple-650 to-indigo-700 shadow-[0_12px_40px_rgba(219,39,119,0.25)] text-white">
      {/* Decorative background grid and circles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-pink-200">OsuStocks Terminal</span>
          <div className="text-[8px] font-bold text-zinc-300/80 mt-0.5">PLATINUM INVESTOR CARD</div>
        </div>
        <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-lg border border-white/20 backdrop-blur-sm">
          <Sparkle size={10} weight="fill" className="text-amber-300 animate-pulse" />
          <span className="text-[8px] font-black tracking-widest text-zinc-200">NFC PAY</span>
        </div>
      </div>

      {/* Chip Icon & Card Logo */}
      <div className="flex justify-between items-end my-4 z-10">
        {/* Chip visual representation */}
        <div className="w-10 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 border border-amber-300 shadow-inner flex flex-col justify-between p-1.5">
          <div className="flex justify-between"><div className="w-2 h-0.5 bg-amber-900/40"></div><div className="w-2 h-0.5 bg-amber-900/40"></div></div>
          <div className="w-full h-[1px] bg-amber-900/30 my-0.5"></div>
          <div className="flex justify-between"><div className="w-2 h-0.5 bg-amber-900/40"></div><div className="w-2 h-0.5 bg-amber-900/40"></div></div>
        </div>
        <Coins size={28} weight="fill" className="text-pink-200/80" />
      </div>

      {/* Card Balance */}
      <div className="z-10">
        <span className="text-[9px] font-black uppercase tracking-widest text-pink-200 block mb-1">Available Funds</span>
        <div className="font-mono text-3xl font-black tabular-nums tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <Money value={balance} />
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex justify-between items-end z-10 pt-2 border-t border-white/10 text-[9px] text-zinc-200/80">
        <div className="font-bold tracking-wide uppercase">{username}</div>
        <div className="font-mono tracking-widest text-[8px] font-bold">SECURE NODE</div>
      </div>
    </Card>
  );
}

function WalletAnalytics({ transactions, balance }: { transactions: WalletTransaction[]; balance: number }) {
  const feeTransactions = transactions.filter(t => t.transactionType === "TradeFee");
  const totalFees = feeTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const inflowTransactions = transactions.filter(t => CREDIT_TYPES.has(t.transactionType));
  const totalInflow = inflowTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const outflowTransactions = transactions.filter(t => !CREDIT_TYPES.has(t.transactionType));
  const totalOutflow = outflowTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const tradeCount = transactions.filter(t => t.transactionType === "BuyStock" || t.transactionType === "SellStock").length;

  const standing = balance >= 10000 
    ? { title: "Platinum Class", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_12px_rgba(6,182,212,0.15)]" }
    : balance >= 5000
    ? { title: "Gold Class", color: "text-amber-400 border-amber-500/30 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.15)]" }
    : balance >= 1000
    ? { title: "Silver Class", color: "text-zinc-300 border-zinc-500/30 bg-zinc-500/5 shadow-[0_0_12px_rgba(212,212,216,0.1)]" }
    : { title: "Bronze Class", color: "text-orange-400 border-orange-500/30 bg-orange-500/5 shadow-[0_0_12px_rgba(249,115,22,0.1)]" };

  return (
    <Card className="relative overflow-hidden border border-zinc-855 bg-zinc-900/10">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-4 flex items-center gap-2">
        <Cpu size={18} className="text-pink-400" />
        <h2 className="text-sm font-bold text-zinc-100">Account Standing</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between rounded-xl border p-3.5 ${standing.color}`}>
          <span className="text-[10px] font-black uppercase tracking-wider">Standing Level</span>
          <span className="text-xs font-black uppercase tracking-widest">{standing.title}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-850/60 bg-zinc-950/40 p-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">Total Inflow</span>
            <span className="font-mono text-sm font-bold text-emerald-400 mt-1 block">+{totalInflow.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-850/60 bg-zinc-950/40 p-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">Total Outflow</span>
            <span className="font-mono text-sm font-bold text-rose-400 mt-1 block">-{totalOutflow.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-850/60 bg-zinc-950/40 p-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">Fees Paid</span>
            <span className="font-mono text-sm font-bold text-zinc-300 mt-1 block">{totalFees.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-850/60 bg-zinc-950/40 p-3">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">Market Trades</span>
            <span className="font-mono text-sm font-bold text-indigo-400 mt-1 block">{tradeCount} ops</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-10">
      <Card className="p-7">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-56" />
          </div>
        </div>
      </Card>
      <div className="h-48 rounded-2xl border border-zinc-800 skeleton" />
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
        <div className="space-y-8">
          {/* Main split grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left Balance card */}
            <div className="md:col-span-2">
              <Reveal>
                <motion.div variants={scaleIn} initial="hidden" animate="show">
                  <VirtualCreditCard balance={wallet.balance} username={user.username} />
                </motion.div>
              </Reveal>
            </div>

            {/* Right Account Standing card */}
            <div className="md:col-span-1">
              <Reveal delay={0.05}>
                <WalletAnalytics transactions={transactions} balance={wallet.balance} />
              </Reveal>
            </div>
          </div>

          {/* Transactions section */}
          <div className="pt-4">
            <Reveal delay={0.1}>
              <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.15)]">
                Transaction Register
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
              <Reveal delay={0.15}>
                <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <table className="w-full min-w-[32rem] text-sm">
                    <caption className="sr-only">
                      Wallet transactions: type, amount, and date.
                    </caption>
                    <thead>
                      <tr className="border-b border-zinc-800/80 text-left text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40">
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <motion.tbody
                      className="divide-y divide-zinc-850/60"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                    >
                      {transactions.map((tx) => {
                        const isCredit = CREDIT_TYPES.has(tx.transactionType);
                        const TypeIcon: PhosphorIcon = isCredit
                          ? ArrowDownLeft
                          : ArrowUpRight;
                        const signedAmount =
                          (isCredit ? 1 : -1) * Math.abs(tx.amount);

                        return (
                          <motion.tr
                            key={tx.transactionId}
                            variants={fadeUp}
                            whileHover={
                              reduceMotion
                                ? undefined
                                : { backgroundColor: "rgba(24,24,27,0.4)" }
                            }
                            transition={spring}
                            className="transition-colors border-l-2 border-l-transparent hover:border-l-pink-500"
                          >
                            <td className="px-4 py-3.5">
                              <Badge tone={isCredit ? "success" : "danger"} className="font-bold text-[10px] uppercase tracking-wider py-1 px-2.5">
                                <TypeIcon size={12} weight="bold" className="mr-1" />
                                {humanizeType(tx.transactionType)}
                              </Badge>
                            </td>
                            <td
                              className={`px-4 py-3.5 text-right font-mono text-xs font-black tabular-nums ${
                                isCredit ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              <span className="inline-flex items-center gap-1">
                                <Coin size="h-3 w-3" className={isCredit ? "text-emerald-400" : "text-rose-450"} />
                                {formatChange(signedAmount)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-zinc-500">
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

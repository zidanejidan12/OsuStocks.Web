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
  ShieldCheck,
  ChartBar,
  Eye,
  EyeSlash,
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
    <Card className="border border-zinc-805 bg-zinc-955/20 p-6">
      <EmptyState
        icon={<Lock size={20} weight="bold" className="text-pink-400" />}
        title="Access Restricted"
        message="You need to be signed in to view your capital wallet."
        action={
          <Link href="/login" className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm">
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

function generateCardNumber(userId: string | number, osuUserId: number, showFull: boolean): string {
  const osuIdStr = String(osuUserId).padStart(8, "0");
  
  const idStr = String(userId);
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);
  const suffix = String(positiveHash).slice(-4).padStart(4, "8");
  
  const bin = "5412";
  
  if (showFull) {
    const p1 = bin;
    const p2 = osuIdStr.slice(0, 4);
    const p3 = osuIdStr.slice(4, 8);
    const p4 = suffix;
    return `${p1} ${p2} ${p3} ${p4}`;
  } else {
    const lastFour = suffix;
    return `${bin} •••• •••• ${lastFour}`;
  }
}

function VirtualCreditCard({ balance, username, userId, osuUserId }: { balance: number; username: string; userId: string | number; osuUserId: number }) {
  const [showFull, setShowFull] = useState(false);
  const cardNumber = generateCardNumber(userId, osuUserId, showFull);
  
  return (
    <div className="relative group rounded-2xl bg-gradient-to-br from-zinc-800/80 via-zinc-700/30 to-zinc-900 p-[1.5px] hover:from-pink-500/40 hover:via-purple-500/20 hover:to-indigo-500/30 transition-all duration-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] max-w-md overflow-hidden">
      {/* Light sheen swipe effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out" />

      <div className="relative overflow-hidden aspect-[1.586/1] w-full rounded-[15px] p-6 flex flex-col justify-between bg-gradient-to-br from-zinc-950 via-zinc-900/95 to-zinc-955 text-white transition-all duration-300">
        {/* Metallic stripe and gloss grid reflection */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent" />

        {/* Card Header */}
        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100 font-sans">
              <span className="text-pink-500 font-bold">Osu</span>Stocks
            </span>
            <div className="text-[7px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5 font-mono">Capital Holdings Card</div>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 backdrop-blur-md shadow-inner">
            <ShieldCheck size={11} weight="bold" className="text-emerald-400" />
            <span className="text-[8px] font-bold tracking-wider text-zinc-350 font-mono">SECURE</span>
          </div>
        </div>

        {/* Chip & Contactless wave & logo */}
        <div className="flex justify-between items-center my-1 z-10">
          {/* Realistic golden electronic microchip */}
          <div className="relative w-11 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_1.5px_3px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] opacity-65">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-amber-955/20" />
              ))}
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-950/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-amber-950/30" />
            <div className="absolute inset-2 border border-amber-950/20 rounded-sm pointer-events-none" />
          </div>

          {/* Contactless waves & Platform branding */}
          <div className="flex items-center gap-3">
            <div className="flex gap-[2px] items-end opacity-40">
              <span className="w-[1.5px] h-2 bg-white rounded-full"></span>
              <span className="w-[1.5px] h-3 bg-white rounded-full"></span>
              <span className="w-[1.5px] h-4 bg-white rounded-full"></span>
              <span className="w-[1.5px] h-5 bg-white rounded-full"></span>
            </div>
            <Coins size={26} weight="bold" className="text-zinc-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
        </div>

        {/* Card Number & Balance */}
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-mono text-zinc-200 text-sm tracking-[0.16em] font-medium min-w-[13.5rem] select-none">
              {cardNumber}
            </div>
            <button
              type="button"
              onClick={() => setShowFull(!showFull)}
              className="text-zinc-500 hover:text-zinc-350 cursor-pointer p-1 rounded-md bg-zinc-900/40 border border-zinc-805/85 transition-colors"
              title={showFull ? "Hide card number" : "Show card number"}
            >
              {showFull ? <EyeSlash size={12} weight="bold" /> : <Eye size={12} weight="bold" />}
            </button>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-550 block mb-0.5 font-mono">Available Funds</span>
          <div className="font-mono text-3xl font-black tabular-nums tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <Money value={balance} />
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end z-10 pt-2 border-t border-zinc-850/60 text-[9px] text-zinc-400 font-mono">
          <div>
            <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-550 mb-0.5">Cardholder</div>
            <div className="font-bold tracking-wide uppercase text-zinc-200">{username}</div>
          </div>
          <div className="text-right">
            <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-550 mb-0.5">Valid Thru</div>
            <div className="tracking-widest text-zinc-300 font-bold">12/29</div>
          </div>
        </div>
      </div>
    </div>
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
    ? { title: "Platinum Class", color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]" }
    : balance >= 5000
    ? { title: "Gold Class", color: "text-amber-400 border-amber-500/20 bg-amber-955/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]" }
    : balance >= 1000
    ? { title: "Silver Class", color: "text-zinc-300 border-zinc-550/25 bg-zinc-950/20 shadow-[0_0_12px_rgba(212,212,216,0.1)]" }
    : { title: "Bronze Class", color: "text-orange-405 border-orange-500/20 bg-orange-955/20 shadow-[0_0_12px_rgba(249,115,22,0.1)]" };

  return (
    <Card className="relative overflow-hidden border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/10 p-5 transition-all duration-300 shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-4 flex items-center gap-2">
        <ChartBar size={16} className="text-pink-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account Standing</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between rounded-xl border p-3 font-semibold ${standing.color}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider">Standing Level</span>
          <span className="text-xs font-black uppercase tracking-widest font-mono">{standing.title}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Total Inflow</span>
            <span className="font-mono text-xs font-bold text-emerald-400 mt-1 block">+{totalInflow.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-955/40 p-3">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Total Outflow</span>
            <span className="font-mono text-xs font-bold text-rose-455 mt-1 block">-{totalOutflow.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Fees Paid</span>
            <span className="font-mono text-xs font-bold text-zinc-350 mt-1 block">{totalFees.toLocaleString()} Cr</span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-955/40 p-3">
            <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Market Trades</span>
            <span className="font-mono text-xs font-bold text-indigo-400 mt-1 block">{tradeCount} ops</span>
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
  const [filterType, setFilterType] = useState<"all" | "trades" | "rewards" | "fees">("all");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUnauthorized(false);

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

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "all") return true;
    if (filterType === "trades") {
      return tx.transactionType === "BuyStock" || tx.transactionType === "SellStock";
    }
    if (filterType === "rewards") {
      return (
        tx.transactionType === "DailyReward" ||
        tx.transactionType === "MissionReward" ||
        tx.transactionType === "AchievementReward" ||
        tx.transactionType === "AdminGrant" ||
        tx.transactionType === "InitialGrant"
      );
    }
    if (filterType === "fees") {
      return tx.transactionType === "TradeFee" || tx.transactionType === "AdminDeduction";
    }
    return true;
  });

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8 border-b border-zinc-800/80 pb-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
            Capital Wallet
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-mono">
            Platform accounts ledger, holdings standing, and trade settlement indexes.
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
                  <VirtualCreditCard balance={wallet.balance} username={user.username} userId={user.userId} osuUserId={user.osuUserId} />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <Reveal delay={0.1}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.15)]">
                  Transaction Ledger
                </h2>
              </Reveal>

              {/* Transaction Filters */}
              <Reveal delay={0.12}>
                <div className="flex flex-wrap gap-1.5">
                  {(["all", "trades", "rewards", "fees"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        filterType === type
                          ? "bg-pink-500/10 text-pink-400 border-pink-500/35 shadow-[0_0_12px_rgba(236,72,153,0.1)]"
                          : "bg-zinc-950/20 text-zinc-500 border-zinc-800/80 hover:text-zinc-350 hover:border-zinc-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </Reveal>
            </div>

            {filteredTransactions.length === 0 ? (
              <Reveal>
                <EmptyState
                  icon={<WalletIcon size={20} weight="bold" className="text-zinc-650" />}
                  title="No matched transactions"
                  message="No records found in this category."
                />
              </Reveal>
            ) : (
              <Reveal delay={0.15}>
                <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-955/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  {/* Mobile Swipe Cue */}
                  <div className="block sm:hidden text-center py-2 bg-pink-500/5 border-b border-zinc-850/50 text-[10px] font-black uppercase tracking-widest text-pink-400/80 animate-pulse">
                    ← Swipe sideways to view ledger details →
                  </div>

                  <div className="overflow-x-auto w-full">
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
                        {filteredTransactions.map((tx) => {
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
                                  : { backgroundColor: "rgba(24,24,27,0.3)" }
                              }
                              transition={spring}
                              className="transition-colors border-l-2 border-l-transparent hover:border-l-pink-500"
                            >
                              <td className="px-4 py-3.5">
                                <Badge tone={isCredit ? "success" : "danger"} className="font-bold text-[9px] uppercase tracking-wider py-0.5 px-2">
                                  <TypeIcon size={12} weight="bold" className="mr-1" />
                                  {humanizeType(tx.transactionType)}
                                </Badge>
                              </td>
                              <td
                                className={`px-4 py-3.5 text-right font-mono text-xs font-black tabular-nums ${
                                  isCredit ? "text-emerald-400" : "text-rose-455"
                                }`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Coin size="h-3 w-3" className={isCredit ? "text-emerald-400" : "text-rose-455"} />
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
                </div>
              </Reveal>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}

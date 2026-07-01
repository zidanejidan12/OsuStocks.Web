"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
import { getWalletStanding, WALLET_TIERS } from "@/lib/wallet-tiers";

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
    <div className="relative w-full overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 -z-10 h-[350px] w-[350px] rounded-full bg-indigo-500/12 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-purple-500/12 dark:bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {children}
      </div>
    </div>
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
  const { currentTier } = getWalletStanding(balance);
  
  const isGoldTone = currentTier.name.includes("Gold") || currentTier.name.includes("Bronze");
  const chipGradient = isGoldTone
    ? "from-amber-300 via-yellow-400 to-amber-600"
    : "from-zinc-100 via-zinc-300 to-zinc-500";

  // Embossed text style for realistic credit card physical indent feel
  const embossedStyle = {
    textShadow: "1px 1px 1px rgba(0,0,0,0.95), -0.5px -0.5px 0.5px rgba(255,255,255,0.25)"
  };

  // Interactive 3D tilt & cursor-following spotlight reflection
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setSpotlightPos({ x: pctX, y: pctY });

    const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 6;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: isHovered ? "none" : "all 0.5s ease-out",
      }}
      className={`relative group rounded-2xl bg-gradient-to-br ${currentTier.cardStyle} p-[1.5px] transition-all duration-500 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] max-w-lg overflow-hidden select-none cursor-pointer`}
    >
      {/* Dynamic Cursor Spotlight Reflection */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay z-20"
        style={{
          background: `radial-gradient(circle 140px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(255,255,255,0.35), transparent)`,
        }}
      />

      {/* Light sheen swipe effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out" />

      <div className={`relative overflow-hidden aspect-[1.586/1] w-full rounded-[15px] p-6 flex flex-col justify-between bg-gradient-to-br ${currentTier.bgStyle} text-white transition-all duration-300`}>
        {/* Brushed metal fine grain overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_2px)] pointer-events-none opacity-80" />
        
        {/* Gloss grid reflection */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.12] pointer-events-none" />
        
        <div className={`absolute -right-20 -top-20 w-64 h-64 bg-current opacity-[0.06] rounded-full blur-3xl pointer-events-none ${currentTier.textStyle}`} />
        <div className={`absolute -left-20 -bottom-20 w-64 h-64 bg-current opacity-[0.04] rounded-full blur-3xl pointer-events-none ${currentTier.textStyle}`} />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/10 via-transparent to-transparent" />

        {/* Card Header */}
        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-sm font-black tracking-tight text-zinc-950 dark:text-zinc-100 font-display">
              <span className="text-pink-500 font-black">Osu</span>Stocks
            </span>
            <div className={`text-[7px] font-bold uppercase tracking-widest mt-0.5 font-mono ${currentTier.textStyle}`}>{currentTier.name}</div>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 backdrop-blur-md shadow-inner">
            <ShieldCheck size={11} weight="bold" className="text-emerald-400" />
            <span className="text-[8px] font-bold tracking-wider text-zinc-350 font-mono">SECURE</span>
          </div>
        </div>

        {/* Chip & Brand Logo */}
        <div className="flex justify-between items-center my-1 z-10">
          {/* Realistic dynamic electronic microchip */}
          <div className={`relative w-10 h-7 rounded-[6px] bg-gradient-to-br ${chipGradient} p-[1px] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.5),0_1.5px_3px_rgba(0,0,0,0.3)] overflow-hidden shrink-0`}>
            {/* Chip pattern lines */}
            <svg className="absolute inset-0 w-full h-full text-zinc-950/20 stroke-current" viewBox="0 0 40 28" fill="none" strokeWidth="0.8">
              <rect x="2" y="2" width="36" height="24" rx="3" strokeWidth="0.5" />
              <path d="M12 2v24M28 2v24M2 14h36M12 8h16M12 20h16" />
              <circle cx="20" cy="14" r="3" fill="currentColor" className="opacity-10" />
            </svg>
          </div>

          {/* Contactless waves & Holographic Brand Logo */}
          <div className="flex items-center gap-4">
            {/* Contactless waves */}
            <svg className="w-4 h-4 opacity-40 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 8.5c.8-1 2.2-1.5 3.5-1.5s2.7.5 3.5 1.5M3 6c1.5-1.8 3.8-2.5 6-2.5s4.5.7 6 2.5M7 11c.4-.5 1.1-.8 1.8-.8s1.4.3 1.8.8" />
            </svg>
            
            {/* Card Brand Emblem (Mastercard-style but OsuStocks themed) */}
            <div className="relative w-10 h-6 flex items-center justify-center shrink-0">
              <div className="absolute left-0 w-5 h-5 rounded-full bg-pink-500/70 mix-blend-screen backdrop-blur-[1px] border border-pink-400/20" />
              <div className="absolute right-0 w-5 h-5 rounded-full bg-cyan-500/70 mix-blend-screen backdrop-blur-[1px] border border-cyan-400/20" />
              <div className="absolute w-1.5 h-3 bg-purple-500/50 mix-blend-multiply rounded-full" />
            </div>
          </div>
        </div>

        {/* Card Number & Balance */}
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="font-mono text-zinc-105 text-sm tracking-[0.22em] font-bold min-w-[13.5rem] select-none"
              style={embossedStyle}
            >
              {cardNumber}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFull(!showFull);
              }}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer p-1 rounded-md bg-zinc-900/40 border border-zinc-800 transition-colors z-25 relative"
              title={showFull ? "Hide card number" : "Show card number"}
            >
              {showFull ? <EyeSlash size={12} weight="bold" /> : <Eye size={12} weight="bold" />}
            </button>
          </div>
          <span className="text-[7px] font-bold uppercase tracking-widest text-zinc-500 block mb-0.5 font-mono">Available Funds</span>
          <div className="font-display text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] flex items-center gap-1.5">
            <Coin />
            <span>{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex justify-between items-end z-10 pt-2 border-t border-zinc-850/60 text-[9px] text-zinc-400 font-mono">
          <div>
            <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Cardholder</div>
            <div
              className="font-bold tracking-widest uppercase text-zinc-200"
              style={embossedStyle}
            >
              {username}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[6px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Valid Thru</div>
            <div
              className="tracking-widest text-zinc-300 font-bold"
              style={embossedStyle}
            >
              12/29
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletAnalytics({ transactions, balance }: { transactions: WalletTransaction[]; balance: number }) {
  const [showTiers, setShowTiers] = useState(false);
  const feeTransactions = transactions.filter(t => t.transactionType === "TradeFee");
  const totalFees = feeTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const inflowTransactions = transactions.filter(t => CREDIT_TYPES.has(t.transactionType));
  const totalInflow = inflowTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const outflowTransactions = transactions.filter(t => !CREDIT_TYPES.has(t.transactionType));
  const totalOutflow = outflowTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const tradeCount = transactions.filter(t => t.transactionType === "BuyStock" || t.transactionType === "SellStock").length;

  const { currentTier, nextTier, neededForNext, progressToNext, formattedFee } = getWalletStanding(balance);

  return (
    <Card className="relative overflow-hidden border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/10 p-5 transition-all duration-300 shadow-md">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />

      {/* Tiers Guide Overlay */}
      <AnimatePresence>
        {showTiers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col justify-between bg-zinc-950/98 backdrop-blur-md p-5 border border-zinc-800 rounded-2xl overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between border-b border-zinc-850 pb-3 mb-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-pink-400 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 font-display">Tiers & Fee Structure</h3>
                  </div>
                  <p className="text-[8px] text-zinc-500 font-mono tracking-normal leading-tight">
                    Holdings-based trading fee discounts. Higher tiers unlock exponential commission savings.
                  </p>
                </div>
                <button
                  onClick={() => setShowTiers(false)}
                  className="rounded-lg px-2.5 py-1 text-[9px] font-bold font-mono uppercase bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2 pr-0.5 custom-scrollbar">
                {WALLET_TIERS.map((tier) => {
                  const feePercent = `${(tier.feeRate * 100).toFixed(tier.feeRate < 0.001 ? 4 : tier.feeRate < 0.01 ? 3 : 1)}%`;
                  const isActive = currentTier.name === tier.name;
                  const discountPercent = ((0.02 - tier.feeRate) / 0.02) * 100;
                  return (
                    <div
                      key={tier.name}
                      className={`flex flex-col justify-between rounded-xl border p-3 transition-all duration-300 ${
                        isActive
                          ? `${tier.color} border-current/30 shadow-[0_0_15px_rgba(236,72,153,0.12)]`
                          : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-750"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-white" : tier.color.split(' ')[0]}`}>
                            {tier.name}
                          </span>
                          {isActive ? (
                            <span className="flex items-center gap-1 text-[7px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            discountPercent > 0 && (
                              <span className="text-[7.5px] font-bold bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800 font-mono">
                                Save {discountPercent.toFixed(discountPercent % 1 === 0 ? 0 : 1)}%
                              </span>
                            )
                          )}
                        </div>
                        <span className="font-mono text-[9px] text-zinc-450">
                          {tier.threshold === 0 ? "Any Balance" : `≥ ${tier.threshold.toLocaleString()} Cr`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-zinc-900/60 pt-2 text-[9.5px] font-mono text-zinc-450">
                        <span>Trade Fee Rate</span>
                        <div className="flex items-center gap-1.5">
                          {discountPercent > 0 && (
                            <span className="text-[9px] text-zinc-550 line-through">2.000%</span>
                          )}
                          <span className={`font-bold ${isActive ? "text-white" : "text-zinc-250"}`}>
                            {feePercent}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[8px] text-zinc-550 font-mono mt-3 leading-normal border-t border-zinc-900/80 pt-2">
              * Tiers update automatically based on your wallet balance. Fees are calculated dynamically at order quote time.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartBar size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Account Standing</h2>
        </div>
        <button
          onClick={() => setShowTiers(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black tracking-wider uppercase text-pink-400 bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/15 hover:border-pink-500/30 transition-all duration-200 focus:outline-none cursor-pointer"
          title="View Card Tiers & Fees Guide"
        >
          <span>Tiers Info</span>
          <WarningCircle size={10} weight="bold" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className={`flex flex-col gap-1.5 rounded-xl border p-3 font-semibold ${currentTier.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 font-mono">Standing Level</span>
            <span className={`font-display text-[11px] font-black uppercase tracking-widest ${currentTier.textStyle}`}>
              {currentTier.name}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-current/10 pt-1.5 text-[9px] font-medium opacity-80">
            <span>Trading Fee Rate</span>
            <span className="font-mono font-bold">{formattedFee}</span>
          </div>
        </div>

        {nextTier && (
          <div className="rounded-xl border border-zinc-800/85 bg-zinc-950/40 p-3 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Next: {nextTier.name}</span>
              <span className="font-mono text-pink-400 font-bold">
                +{neededForNext.toLocaleString()} Cr
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-950 border border-zinc-850/50 overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-500 relative"
                style={{ width: `${progressToNext * 100}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-80 blur-[1px]" />
              </div>
            </div>
            <div className="text-[8px] text-zinc-500 font-mono text-center">
              Fee decreases from {formattedFee} to {`${(nextTier.feeRate * 100).toFixed(nextTier.feeRate < 0.001 ? 4 : nextTier.feeRate < 0.01 ? 3 : 1)}%`}
            </div>
          </div>
        )}
        {!nextTier && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 text-center animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              ★ MAX STANDING REACHED ★
            </span>
            <div className="text-[8px] text-zinc-400 font-mono mt-0.5">
              Enjoying the lowest fee rate of {formattedFee}
            </div>
          </div>
        )}

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
            <span className="font-mono text-xs font-bold text-indigo-400 mt-1 block">{tradeCount} Trades</span>
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

function ScrollParallax({ children, speed = 0.1 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const activeSpeed = isDesktop ? speed : 0;
  const y = useTransform(scrollYProgress, [0, 1], [40 * activeSpeed, -40 * activeSpeed]);

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div ref={ref} style={{ y }} className="will-change-transform">
      {children}
    </motion.div>
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
          <h1 className="pb-2 text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-indigo-600 via-indigo-200 to-purple-700 dark:from-indigo-500 dark:via-zinc-100 dark:to-purple-500 bg-clip-text text-transparent animate-gradient-text">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Balance card */}
            <div className="lg:col-span-1">
              <ScrollParallax speed={-0.3}>
                <Reveal>
                  <motion.div variants={scaleIn} initial="hidden" animate="show">
                    <VirtualCreditCard balance={wallet.balance} username={user.username} userId={user.userId} osuUserId={user.osuUserId} />
                  </motion.div>
                </Reveal>
              </ScrollParallax>
            </div>

            {/* Right Account Standing card */}
            <div className="lg:col-span-1">
              <ScrollParallax speed={0.3}>
                <Reveal delay={0.05}>
                  <WalletAnalytics transactions={transactions} balance={wallet.balance} />
                </Reveal>
              </ScrollParallax>
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

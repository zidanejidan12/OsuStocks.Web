"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CaretRight,
  WarningCircle,
  Lock,
  Coins,
  Medal,
  ArrowSquareOut,
  Trophy,
  Lightning,
  Check,
  PencilSimple,
  X,
  ChartLineUp,
  Briefcase,
} from "@phosphor-icons/react";
import {
  getPortfolio,
  getInvestorLevel,
  getStocks,
  getStock,
  getAchievements,
  getMissions,
  updateProfileShowcase,
  ApiError,
} from "@/lib/api/client";
import type {
  Portfolio,
  InvestorLevel,
  Me,
  StockSummary,
  Achievement,
  Mission,
  Holding,
} from "@/lib/api/types";
import { formatNumber, formatShares } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { PriceChange } from "@/components/ui/PriceChange";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import * as analytics from "@/lib/analytics";

const MAX_SHOWCASE = 3;

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>
  );
}

function PleaseLogIn() {
  return (
    <Card className="border border-zinc-800/80 bg-zinc-950/20">
      <EmptyState
        icon={<Lock size={20} weight="bold" className="text-zinc-550" />}
        title="Authentication Required"
        message="You need to sign in to access your portfolio and asset ledger."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm", className: "bg-pink-600 hover:bg-pink-500 text-white font-bold" })}>
            Sign In to Account
          </Link>
        }
      />
    </Card>
  );
}

function ProfileBanner({
  coverUrl,
  children,
}: {
  coverUrl?: string | null;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(coverUrl) && !failed;
  return (
    <div className="relative h-28 sm:h-36 w-full">
      {show ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl as string}
            alt=""
            aria-hidden="true"
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-955 via-zinc-950/40 to-zinc-950/10" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/25 via-pink-500/5 to-zinc-955" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_150%_at_12%_-30%,rgba(236,72,153,0.2),transparent_55%)]" />
        </>
      )}
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.06]" />
      {children}
    </div>
  );
}

function ProfileHeaderCard({
  user,
  portfolio,
}: {
  user: Me;
  portfolio: Portfolio | null;
}) {
  return (
    <Reveal>
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] mb-8">
        {/* Cover Banner at the top */}
        <ProfileBanner coverUrl={user.coverUrl}>
          <span className="absolute left-4 top-4 rounded-md bg-zinc-955/60 border border-zinc-800/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-pink-400 backdrop-blur">
            Active Investor
          </span>
        </ProfileBanner>

        <div className="px-5 py-6 sm:px-7">
          {/* Avatar and user details row - Clean separation, no negative margins */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="rounded-full ring-2 ring-pink-500/25 overflow-hidden shrink-0 bg-zinc-950 shadow-md">
                <Avatar src={user.avatarUrl} name={user.username} size="xl" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-100">{user.username}</h2>
                  {user.countryCode && (
                    <span className="inline-block bg-zinc-955 border border-zinc-800 rounded px-1.5 py-0.5">
                      <Flag countryCode={user.countryCode} className="h-3" />
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {user.equippedTitle && (
                    <span className="text-xs font-semibold text-pink-400 bg-pink-500/5 border border-pink-500/10 px-2.5 py-0.5 rounded">
                      {user.equippedTitle}
                    </span>
                  )}
                  {user.role === "Admin" && (
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <a
                href={`https://osu.ppy.sh/users/${user.osuUserId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({
                  variant: "secondary",
                  size: "sm",
                  className: "gap-1.5 text-xs font-semibold text-zinc-355 border border-zinc-800/80 bg-zinc-955/30 hover:bg-zinc-900/60",
                })}
              >
                Verify osu! Profile
                <ArrowSquareOut size={13} weight="bold" />
              </a>
            </div>
          </div>

          {/* 4 Symmetrical stats cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Current Value */}
            <div className="p-4 rounded-xl border border-zinc-850/60 bg-zinc-955/20 hover:border-pink-500/20 transition-all duration-355">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 block">Current Value</span>
              <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold tabular-nums text-zinc-100 flex items-center gap-1.5">
                <Coins size={14} className="text-pink-400" />
                {portfolio ? <Money value={portfolio.currentValue} /> : "—"}
              </div>
            </div>

            {/* Cost Basis */}
            <div className="p-4 rounded-xl border border-zinc-850/60 bg-zinc-955/20 hover:border-pink-500/20 transition-all duration-355">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 block">Cost Basis</span>
              <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold tabular-nums text-zinc-150 flex items-center gap-1.5">
                <Coins size={14} className="text-zinc-500" />
                {portfolio ? <Money value={portfolio.costBasis} /> : "—"}
              </div>
            </div>

            {/* Profit / Loss */}
            <div className="p-4 rounded-xl border border-zinc-850/60 bg-zinc-955/20 hover:border-pink-500/20 transition-all duration-355">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 block">Profit / Loss</span>
              <div className="mt-1.5">
                {portfolio ? (
                  <PriceChange value={portfolio.profitLoss} className="text-sm sm:text-base font-bold" />
                ) : (
                  <span className="font-mono text-lg sm:text-xl font-bold text-zinc-300">—</span>
                )}
              </div>
            </div>

            {/* Holdings count */}
            <div className="p-4 rounded-xl border border-zinc-850/60 bg-zinc-955/20 hover:border-pink-500/20 transition-all duration-355">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500 block">Holdings</span>
              <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold tabular-nums text-zinc-300">
                {portfolio ? formatNumber(portfolio.holdings.length) : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function HoldingsTable({ holdings, totalValuation }: { holdings: Holding[]; totalValuation: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 border-t-pink-500/10 bg-zinc-955/10 shadow-lg backdrop-blur-md">
      {/* Mobile Swipe Cue */}
      <div className="block sm:hidden text-center py-2.5 bg-pink-500/5 border-b border-zinc-850/50 text-[10px] font-black uppercase tracking-widest text-pink-400/80 animate-pulse">
        ← Swipe sideways to view full ledger →
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Investment holdings ledger: player, positions, average cost, current price, net value, and returns.
          </caption>
          <thead>
            <tr className="border-b border-zinc-800/80 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500 bg-zinc-955/40">
              <th className="px-5 py-4 text-left font-bold">Asset</th>
              <th className="px-5 py-4 text-right font-bold">Holdings Size</th>
              <th className="hidden px-5 py-4 text-right sm:table-cell font-bold">Avg Cost</th>
              <th className="hidden px-5 py-4 text-right sm:table-cell font-bold">Market Price</th>
              <th className="px-5 py-4 text-right font-bold">Current Value</th>
              <th className="hidden px-5 py-4 text-right md:table-cell font-bold">Allocation</th>
              <th className="px-5 py-4 text-right font-bold">Yield Return</th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-zinc-850/50"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {holdings.map((h) => {
              const allocation = totalValuation > 0 ? (h.currentValue / totalValuation) * 100 : 0;
              const pctChange = h.averagePrice > 0 ? (h.profitLoss / (h.averagePrice * h.quantity)) * 100 : 0;
              const isPositive = h.profitLoss > 0;
              const isNegative = h.profitLoss < 0;

              return (
                <motion.tr
                  key={h.holdingId}
                  variants={fadeUp}
                  whileHover={reduceMotion ? undefined : { backgroundColor: "rgba(236, 72, 153, 0.02)" }}
                  transition={spring}
                  className="group transition-colors duration-300"
                >
                  {/* Asset name, avatar, and ticker ID */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/stocks/${h.stockId}`}
                      className="inline-flex items-center gap-3 font-semibold text-zinc-100 hover:text-pink-400 transition-colors"
                    >
                      <div className="relative rounded-full overflow-hidden ring-2 ring-zinc-800 group-hover:ring-pink-500/40 transition-all duration-300 shadow-md">
                        <Avatar src={h.avatarUrl} name={h.playerName} size="sm" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="inline-flex items-center gap-0.5 text-sm font-semibold tracking-tight text-zinc-150 group-hover:text-pink-400 transition-colors">
                          {h.playerName}
                          <CaretRight
                            size={11}
                            className="text-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                          />
                        </span>
                        <span className="text-[9px] font-mono text-zinc-550 group-hover:text-pink-400/50 transition-colors">
                          ID: {h.stockId.substring(0, 8)}
                        </span>
                      </div>
                    </Link>
                  </td>

                  {/* Holdings size (quantity) */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-semibold tabular-nums text-zinc-200">
                        {formatShares(h.quantity)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-555 font-mono">
                        Units
                      </span>
                    </div>
                  </td>

                  {/* Average Purchase Cost */}
                  <td className="hidden px-5 py-4 text-right sm:table-cell">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-medium tabular-nums text-zinc-400">
                        <Money value={h.averagePrice} />
                      </span>
                      <span className="text-[9px] font-medium text-zinc-650 font-mono">
                        Per Share
                      </span>
                    </div>
                  </td>

                  {/* Market Price */}
                  <td className="hidden px-5 py-4 text-right sm:table-cell">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-semibold tabular-nums text-zinc-305">
                        <Money value={h.currentPrice} />
                      </span>
                      <span className="text-[9px] font-medium text-zinc-550 font-mono">
                        Live Bid
                      </span>
                    </div>
                  </td>

                  {/* Current Net Value */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-col items-end">
                      <span className="font-mono text-xs font-bold tabular-nums text-pink-400">
                        <Money value={h.currentValue} />
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-pink-500/60 font-mono">
                        Total
                      </span>
                    </div>
                  </td>

                  {/* Allocation percentage with visual micro progress bar */}
                  <td className="hidden px-5 py-4 text-right md:table-cell">
                    <div className="inline-flex flex-col items-end gap-1.5">
                      <span className="font-mono text-xs font-bold text-zinc-300">{allocation.toFixed(1)}%</span>
                      <div className="h-1.5 w-14 rounded-full bg-zinc-955 border border-zinc-800/60 overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)] transition-all duration-500 relative"
                          style={{ width: `${allocation}%` }}
                        >
                          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white opacity-80 blur-[0.5px]" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Yield Return (P&L absolute and percentage badge) */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isPositive 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : isNegative 
                            ? "bg-rose-500/10 text-rose-455 border-rose-500/20" 
                            : "bg-zinc-800/40 text-zinc-400 border-zinc-700/30"
                      }`}>
                        {isPositive ? "▲" : isNegative ? "▼" : "•"}{isPositive ? "+" : ""}<Money value={h.profitLoss} />
                      </span>
                      <span className={`text-[10px] font-mono font-semibold ${
                        isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-zinc-555"
                      }`}>
                        {isPositive ? "+" : ""}{pctChange.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

function InvestorLevelCard() {
  const [level, setLevel] = useState<InvestorLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getInvestorLevel()
      .then((data) => {
        if (!cancelled) setLevel(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (loading || !level) {
    return (
      <Card className="border border-zinc-800/80 bg-zinc-955/40">
        <Skeleton className="h-24 w-full rounded-2xl animate-pulse" />
      </Card>
    );
  }

  const atMax = level.xpForNextLevel === 0 || level.level >= 100;
  const pct = atMax ? 100 : Math.min(100, Math.max(0, level.progressToNext * 100));

  return (
    <Card className="border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/25 shadow-md p-5 transition-all duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Investor Standing</h2>
        </div>
        <span className="text-[10px] font-bold text-pink-400 bg-pink-500/5 border border-pink-500/15 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
          Lv. {level.level}
        </span>
      </div>

      <div className="flex items-center gap-3 bg-zinc-950/30 border border-zinc-900/50 p-3 rounded-xl">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/5 text-pink-400 border border-pink-500/20 shadow-inner">
          <Trophy size={18} weight="bold" className="animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display font-black text-sm uppercase tracking-wide text-zinc-100">
            {level.title}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-zinc-500">
            {formatNumber(level.totalXp)} total XP accumulated
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <span>Standing Progress</span>
          {!atMax && (
            <span className="font-mono text-zinc-400">
              {formatNumber(level.xpIntoLevel)} / {formatNumber(level.xpForNextLevel)} XP
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-950 border border-zinc-800/60 overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-500 relative"
            style={{ width: `${pct}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-80 blur-[1px]" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ShowcaseCard({ user }: { user: Me }) {
  const { refresh } = useAuth();
  const [data, setData] = useState<Achievement[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState<string | null>(null);
  const [draftShowcase, setDraftShowcase] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAchievements()
      .then((r) => {
        if (!cancelled) setData(r.items);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (data === null || data.length === 0) return null;

  const byCode = new Map(data.map((a) => [a.code, a]));
  const unlocked = data.filter((a) => a.unlocked);
  const showcased = user.showcasedAchievementCodes
    .map((c) => byCode.get(c))
    .filter((a): a is Achievement => Boolean(a));

  const openEditor = () => {
    setDraftTitle(user.equippedTitleCode ?? null);
    setDraftShowcase([...user.showcasedAchievementCodes]);
    setError(null);
    setEditing(true);
  };

  const toggleShowcase = (code: string) => {
    setDraftShowcase((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : prev.length >= MAX_SHOWCASE
          ? prev
          : [...prev, code],
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfileShowcase({
        equippedTitleCode: draftTitle,
        showcasedAchievementCodes: draftShowcase,
      });
      await refresh();
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your showcase.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/25 p-5 transition-all duration-300 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Profile Showcase</h2>
          <span className="text-[10px] font-bold text-zinc-550 font-mono">
            ({unlocked.length} unlocked)
          </span>
        </div>
        <button
          type="button"
          onClick={() => (editing ? setEditing(false) : openEditor())}
          disabled={unlocked.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-[9px] font-black uppercase tracking-wider text-zinc-300 transition-all cursor-pointer focus:outline-none"
        >
          {editing ? <X size={10} weight="bold" /> : <PencilSimple size={10} weight="bold" />}
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {!editing && (
        <>
          {unlocked.length === 0 ? (
            <p className="text-xs text-zinc-500">No achievements unlocked yet.</p>
          ) : showcased.length === 0 ? (
            <p className="text-xs text-zinc-555 font-medium">No achievements showcased yet. Click Edit to showcase achievements.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {showcased.map((a) => (
                <span
                  key={a.code}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-955/60 hover:border-pink-500/20 px-3 py-2 text-xs font-semibold text-zinc-205 shadow-sm transition-all duration-300"
                  title={a.description}
                >
                  <Trophy size={13} className="text-pink-400/80" />
                  <span className="truncate">{a.name}</span>
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="space-y-3">
          <ul className="divide-y divide-zinc-850/60 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-955/20 max-h-56 overflow-y-auto scrollbar-thin">
            {unlocked.map((a) => {
              const picked = draftShowcase.includes(a.code);
              const isTitle = draftTitle === a.code;
              return (
                <li key={a.code} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-zinc-200">{a.name}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDraftTitle(isTitle ? null : a.code)}
                      className={`rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                        isTitle ? "bg-pink-500/20 text-pink-400 border border-pink-500/35" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      Title
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleShowcase(a.code)}
                      className={`rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                        picked ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/35" : "text-zinc-555 hover:text-zinc-355"
                      }`}
                    >
                      Pin
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {error && (
            <p className="text-xs text-rose-400 font-semibold">{error}</p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full flex justify-center py-2.5 bg-pink-500 hover:bg-pink-400 disabled:bg-zinc-800 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_2px_15px_rgba(236,72,153,0.2)]"
          >
            {saving ? "Saving Changes…" : "Apply Showcase"}
          </button>
        </div>
      )}
    </Card>
  );
}

function MissionsSummary() {
  const [missions, setMissions] = useState<Mission[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMissions()
      .then((m) => {
        if (!cancelled) setMissions(m);
      })
      .catch(() => {
        if (!cancelled) setMissions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!missions || missions.length === 0) return null;

  const daily = missions.filter((m) => m.period === "Daily");
  const done = daily.filter((m) => m.completed).length;

  return (
    <Card className="border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/25 p-5 transition-all duration-300 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightning size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Daily Objectives</h2>
        </div>
        <span className="text-[10px] font-bold font-mono text-zinc-550 bg-zinc-950/50 border border-zinc-900/50 px-2 py-0.5 rounded-full">
          {done}/{daily.length} Done
        </span>
      </div>
      <div className="space-y-4">
        {daily.map((m) => {
          const pct = Math.min(100, Math.max(0, (m.currentValue / m.target) * 100));
          return (
            <div key={m.code} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`text-[11px] font-semibold ${m.completed ? "text-emerald-400 font-bold" : "text-zinc-300"}`}>
                  {m.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatNumber(Math.min(m.currentValue, m.target))}/{formatNumber(m.target)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-950 border border-zinc-850/50 overflow-hidden relative shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <div
                  className={`h-full rounded-full transition-all duration-550 relative ${
                    m.completed
                      ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                      : "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  }`}
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-80 blur-[1px]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function YourStockCard({ user }: { user: Me }) {
  const [stock, setStock] = useState<StockSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStocks({ search: user.username, pageSize: 5 })
      .then(async (page) => {
        const match = page.items.find(
          (s) => s.playerName.toLowerCase() === user.username.toLowerCase(),
        );
        if (!match) {
          if (!cancelled) setStock(null);
          return;
        }
        const detail = await getStock(match.stockId);
        if (!cancelled) setStock(detail);
      })
      .catch(() => {
        if (!cancelled) setStock(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user.username]);

  if (!stock) return null;

  return (
    <Card className="border border-zinc-805 bg-zinc-955/20 hover:border-pink-500/25 p-5 transition-all duration-300 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartLineUp size={16} className="text-pink-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Personal Player Stock</h2>
        </div>
        <span className="text-[10px] font-bold text-pink-400 bg-pink-500/5 border border-pink-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
          Live Index
        </span>
      </div>

      <Link
        href={`/stocks/${stock.stockId}`}
        className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-955/40 p-4 transition-all duration-300 hover:bg-zinc-950/80 hover:border-pink-500/25 sm:flex-row sm:items-center sm:justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full overflow-hidden ring-1 ring-zinc-800 group-hover:ring-pink-500/20 transition-all duration-300 shadow-sm">
            <Avatar src={stock.avatarUrl} name={stock.playerName} size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-105 group-hover:text-pink-400 transition-colors text-sm">
                {stock.playerName}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs">
              {stock.globalRank != null && (
                <span className="text-[10px] font-semibold text-zinc-500 font-mono">
                  Rank #{formatNumber(stock.globalRank)} Global
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-zinc-100">
              <Money value={stock.currentPrice} />
            </div>
            <PriceChange value={stock.priceChange24h} className="justify-end text-[10px] font-semibold mt-0.5" />
          </div>
        </div>
      </Link>
    </Card>
  );
}

function HoldingsEmpty() {
  return (
    <Card className="border border-zinc-800/80 bg-zinc-950/10 p-10 text-center">
      <EmptyState
        icon={<Briefcase size={24} className="text-zinc-555 mx-auto" />}
        title="No Assets Held"
        message="Your portfolio is currently empty. Browse the stock market to initiate player trades."
        action={
          <Link
            href="/"
            className={buttonClasses({ size: "sm", className: "gap-1.5 bg-pink-600 hover:bg-pink-500 font-bold" })}
          >
            <Coins size={16} weight="bold" />
            Explore Live Market
          </Link>
        }
      />
    </Card>
  );
}

export default function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getPortfolio()
      .then((data) => {
        if (cancelled) return;
        setPortfolio(data);
        analytics.track("portfolio_viewed", {
          holdings: data.holdings.length,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load portfolio."
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
        <PortfolioSkeleton />
      </PageShell>
    );
  }

  if (!user || unauthorized) {
    return (
      <PageShell>
        <div className="mt-8">
          <PleaseLogIn />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Symmetrical Unified Profile & Stats Header */}
      <ProfileHeaderCard user={user} portfolio={portfolio} />

      {loading && <PortfolioSkeleton />}

      {!loading && error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-355">
          <WarningCircle size={18} className="mt-0.5 shrink-0 text-rose-455" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && portfolio && (
        <div className="space-y-8">
          {/* Main Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Holdings & Positions Ledger */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                  Asset Ledger Positions ({portfolio.holdings.length})
                </h3>
              </div>
              {portfolio.holdings.length === 0 ? (
                <HoldingsEmpty />
              ) : (
                <HoldingsTable holdings={portfolio.holdings} totalValuation={portfolio.currentValue} />
              )}
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-1 space-y-6">
              <YourStockCard user={user} />
              <InvestorLevelCard />
              <ShowcaseCard user={user} />
              <MissionsSummary />
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

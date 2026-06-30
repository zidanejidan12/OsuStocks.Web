"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  ChartPieSlice,
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
  TrendUp,
  User,
  Terminal,
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
type TabId = "overview" | "assets" | "credentials";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">{children}</div>
  );
}

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        icon={<Lock size={20} weight="bold" />}
        title="Please log in"
        message="You need to be signed in to view your portfolio."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

function PageHeader() {
  return (
    <Reveal>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-pink-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-pink-400">
              Terminal: portfolio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-zinc-100 mt-1">
            Investor Control Deck
          </h1>
        </div>
      </header>
    </Reveal>
  );
}

function CompactProfileBar({ user }: { user: Me }) {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 md:p-6 mb-6 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        {/* Glow behind avatar */}
        <div className="absolute -left-6 -top-6 -z-10 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="rounded-full ring-2 ring-pink-500/30 overflow-hidden shrink-0 shadow-lg shadow-pink-500/5">
              <Avatar src={user.avatarUrl} name={user.username} size="lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-zinc-100 truncate">{user.username}</h2>
                {user.countryCode && (
                  <Flag countryCode={user.countryCode} className="h-3" />
                )}
              </div>
              {user.equippedTitle ? (
                <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                  <Trophy size={10} weight="fill" className="text-pink-400" />
                  {user.equippedTitle}
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">Active Trader</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:self-center">
            {user.role === "Admin" && (
              <span className="rounded-md bg-pink-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-400 ring-1 ring-inset ring-pink-500/25">
                Admin
              </span>
            )}
            <a
              href={`https://osu.ppy.sh/users/${user.osuUserId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className: "gap-1.5 font-bold text-[10px] uppercase tracking-wider",
              })}
            >
              View on osu!
              <ArrowSquareOut size={12} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function PortfolioCockpit({ portfolio }: { portfolio: Portfolio | null }) {
  if (!portfolio) return null;

  const profitPct = portfolio.costBasis > 0 ? (portfolio.profitLoss / portfolio.costBasis) * 100 : 0;
  const isProfit = portfolio.profitLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Capital Valuation - Pink theme */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-pink-500/20 bg-zinc-950/40 shadow-[0_0_20px_rgba(236,72,153,0.05)] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/[0.04] rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-400">Total Net Valuation</span>
          <div className="mt-3 font-mono text-3xl font-black tabular-nums tracking-wide text-zinc-50 drop-shadow-[0_0_12px_rgba(236,72,153,0.2)]">
            <Money value={portfolio.currentValue} />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Active Holdings</span>
          <span className="font-mono font-bold text-zinc-300">{portfolio.holdings.length} Positions</span>
        </div>
      </div>

      {/* Performance Cost Basis - Purple theme */}
      <div className="relative overflow-hidden p-6 rounded-2xl border border-purple-500/20 bg-zinc-950/40 shadow-[0_0_20px_rgba(168,85,247,0.05)] flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.04] rounded-full blur-2xl pointer-events-none" />
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">Total Invested Capital</span>
          <div className="mt-3 font-mono text-3xl font-black tabular-nums tracking-wide text-zinc-100">
            <Money value={portfolio.costBasis} />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Average Cost</span>
          <span className="font-mono font-bold text-zinc-300">Base weight</span>
        </div>
      </div>

      {/* Unrealized return - Emerald or Rose theme */}
      <div className={`relative overflow-hidden p-6 rounded-2xl border bg-zinc-950/40 flex flex-col justify-between ${
        isProfit 
          ? "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
          : "border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]"
      }`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
          isProfit ? "bg-emerald-500/[0.04]" : "bg-rose-500/[0.04]"
        }`} />
        <div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
            isProfit ? "text-emerald-400" : "text-rose-400"
          }`}>Unrealized Return</span>
          <div className="mt-3">
            <PriceChange value={portfolio.profitLoss} className="text-3xl font-black" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <span>Return Rate</span>
          <span className={`font-mono font-black ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
            {isProfit ? "+" : ""}{profitPct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AssetGameCard({ holding }: { holding: Holding }) {
  const isProfit = holding.profitLoss >= 0;
  const growthPct = holding.averagePrice > 0 ? (holding.profitLoss / (holding.averagePrice * holding.quantity)) * 100 : 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-350 hover:-translate-y-2 border flex flex-col justify-between h-56 p-5 ${
        isProfit
          ? "border-emerald-500/25 hover:border-emerald-500/50 bg-gradient-to-br from-emerald-950/5 via-zinc-950/40 to-zinc-950/60 shadow-[0_4px_20px_rgba(16,185,129,0.02)] hover:shadow-[0_12px_30px_rgba(16,185,129,0.08)]"
          : "border-pink-500/20 hover:border-pink-500/45 bg-gradient-to-br from-pink-950/5 via-zinc-950/40 to-zinc-950/60 shadow-[0_4px_20px_rgba(236,72,153,0.02)] hover:shadow-[0_12px_30px_rgba(236,72,153,0.08)]"
      }`}
    >
      <div className={`absolute top-0 right-0 w-16 h-16 pointer-events-none transition-opacity duration-300 opacity-20 group-hover:opacity-40 bg-gradient-to-bl ${
        isProfit ? "from-emerald-500 to-transparent" : "from-pink-500 to-transparent"
      }`} />

      <div className="flex items-center gap-3.5">
        <div className={`rounded-full overflow-hidden ring-2 transition-all duration-300 ${
          isProfit 
            ? "ring-emerald-500/20 group-hover:ring-emerald-400/50" 
            : "ring-pink-500/20 group-hover:ring-pink-400/50"
        }`}>
          <Avatar src={holding.avatarUrl} name={holding.playerName} size="md" />
        </div>
        <div className="min-w-0">
          <Link
            href={`/stocks/${holding.stockId}`}
            className="flex items-center gap-1 font-black text-zinc-100 group-hover:text-pink-300 transition-colors"
          >
            <span className="truncate text-sm sm:text-base leading-none">{holding.playerName}</span>
            <CaretRight size={13} className="text-zinc-655 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
          </Link>
          <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">Asset Code: {holding.stockId.substring(0, 8)}</div>
        </div>
      </div>

      <div className="my-3 grid grid-cols-2 gap-2 border-t border-b border-zinc-800/40 py-2.5 font-mono">
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Holdings Size</span>
          <span className="text-xs font-black text-zinc-200 mt-0.5 block">{formatShares(holding.quantity)} units</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Avg cost basis</span>
          <span className="text-xs font-bold text-zinc-400 mt-0.5 block">
            <Money value={holding.averagePrice} />
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Current Worth</span>
          <span className="font-mono text-sm font-black text-zinc-100 mt-0.5 block">
            <Money value={holding.currentValue} />
          </span>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 block">Asset Growth</span>
          <span className={`font-mono text-xs font-black mt-0.5 inline-flex items-center gap-0.5 px-2 py-0.5 rounded ${
            isProfit 
              ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" 
              : "text-pink-400 bg-pink-500/5 border border-pink-500/10"
          }`}>
            {isProfit ? "+" : ""}{growthPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
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
      <Card>
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  const atMax = level.xpForNextLevel === 0 || level.level >= 100;
  const pct = atMax ? 100 : Math.min(100, Math.max(0, level.progressToNext * 105));

  return (
    <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-950/30">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-transparent" />
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
          <Medal size={20} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-zinc-100">
              Level {formatNumber(level.level)}
            </span>
            <span className="truncate text-[9px] font-black uppercase tracking-wider text-cyan-400">
              {level.title}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-500 font-semibold">
            {formatNumber(level.totalXp)} total XP
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
          <span>XP gauge</span>
          {!atMax && (
            <span className="font-mono text-zinc-400">
              {formatNumber(level.xpIntoLevel)} / {formatNumber(level.xpForNextLevel)} XP
            </span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-850/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
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
    <Card className="relative overflow-hidden border border-zinc-855 bg-zinc-950/30">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={18} weight="fill" className="text-pink-400" />
          <h2 className="text-sm font-bold text-zinc-100">Pinned Badges</h2>
          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-900/60 text-zinc-400">
            {unlocked.length}/{data.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => (editing ? setEditing(false) : openEditor())}
          disabled={unlocked.length === 0}
          className={buttonClasses({ variant: "secondary", size: "sm", className: "gap-1.5 font-bold uppercase tracking-wider text-[9px]" })}
        >
          {editing ? <X size={12} weight="bold" /> : <PencilSimple size={12} weight="bold" />}
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {!editing && (
        <>
          {unlocked.length === 0 ? (
            <p className="text-xs text-zinc-500">No achievements unlocked yet.</p>
          ) : showcased.length === 0 ? (
            <p className="text-xs text-zinc-550">No showcase selected. Click Edit to feature badges.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {showcased.map((a) => (
                <span
                  key={a.code}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[11px] font-bold text-pink-200"
                  title={a.description}
                >
                  <Trophy size={12} weight="fill" className="text-pink-400" />
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="space-y-3">
          <ul className="divide-y divide-zinc-850/60 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/20 max-h-56 overflow-y-auto">
            {unlocked.map((a) => {
              const picked = draftShowcase.includes(a.code);
              const isTitle = draftTitle === a.code;
              return (
                <li key={a.code} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-zinc-100">{a.name}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDraftTitle(isTitle ? null : a.code)}
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isTitle ? "bg-pink-500/20 text-pink-200" : "text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      Title
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleShowcase(a.code)}
                      className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        picked ? "bg-emerald-500/20 text-emerald-200" : "text-zinc-550 hover:text-zinc-300"
                      }`}
                    >
                      Pin
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className={buttonClasses({ size: "sm", className: "w-full font-bold uppercase tracking-wider text-[10px]" })}
          >
            {saving ? "Saving…" : "Save changes"}
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
    <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-955/30">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightning size={16} weight="fill" className="text-pink-400 animate-pulse" />
          <h2 className="text-sm font-bold text-zinc-100">Daily Objectives</h2>
        </div>
        <span className="text-[10px] font-bold font-mono text-zinc-400">
          {done}/{daily.length} Done
        </span>
      </div>
      <div className="space-y-3">
        {daily.map((m) => {
          const pct = Math.min(100, Math.max(0, (m.currentValue / m.target) * 100));
          return (
            <div key={m.code} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`text-[11px] font-semibold ${m.completed ? "text-emerald-400" : "text-zinc-300"}`}>{m.name}</span>
                <span className="text-[10px] text-zinc-550 font-mono">{formatNumber(Math.min(m.currentValue, m.target))}/{formatNumber(m.target)}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-900">
                <div
                  className={`h-full rounded-full ${m.completed ? "bg-emerald-400" : "bg-pink-500"}`}
                  style={{ width: `${pct}%` }}
                />
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
    <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-950/30">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-transparent" />
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Personal Market Stock</span>
      </div>

      <Link
        href={`/stocks/${stock.stockId}`}
        className="group flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 transition-all duration-300 hover:border-pink-500/30 hover:shadow-[0_4px_20px_rgba(236,72,153,0.05)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <Avatar src={stock.avatarUrl} name={stock.playerName} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-zinc-100 group-hover:text-pink-300 transition-colors text-sm">
                {stock.playerName}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              {stock.globalRank != null && (
                <span className="text-[9px] font-bold font-mono text-zinc-500">
                  #{formatNumber(stock.globalRank)} GLOBAL
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <div className="text-right">
            <div className="font-mono text-base font-black tabular-nums text-zinc-100">
              <Money value={stock.currentPrice} />
            </div>
            <PriceChange value={stock.priceChange24h} className="justify-end text-[10px] font-bold mt-0.5" />
          </div>
        </div>
      </Link>
    </Card>
  );
}

function HoldingsEmpty() {
  return (
    <Card className="border border-zinc-850 bg-zinc-950/20 p-8 text-center">
      <EmptyState
        icon={<ChartPieSlice size={24} className="text-zinc-600 mx-auto" />}
        title="No holdings yet"
        message="You don't own any players yet. Browse the market to make your first trade."
        action={
          <Link
            href="/"
            className={buttonClasses({ size: "sm", className: "gap-1.5" })}
          >
            <Coins size={16} weight="bold" />
            Browse the market
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
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
        <PageHeader />
        <PortfolioSkeleton />
      </PageShell>
    );
  }

  if (!user || unauthorized) {
    return (
      <PageShell>
        <PageHeader />
        <div className="mt-8">
          <PleaseLogIn />
        </div>
      </PageShell>
    );
  }

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Analytics Overview", icon: Terminal },
    { id: "assets", label: "Holdings Registry", icon: ChartPieSlice },
    { id: "credentials", label: "Credentials & Missions", icon: Medal },
  ];

  return (
    <PageShell>
      <PageHeader />
      <CompactProfileBar user={user} />

      {loading && <PortfolioSkeleton />}

      {!loading && error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <WarningCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && portfolio && (
        <div className="space-y-6">
          {/* Main Cockpit Display */}
          <PortfolioCockpit portfolio={portfolio} />

          {/* Interactive HUD Tab Navigation */}
          <div className="border-b border-zinc-800/80 pt-2 flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-300 ${
                    active
                      ? "border-pink-500 text-pink-400 bg-pink-500/[0.02]"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                  }`}
                >
                  <Icon size={14} className={active ? "text-pink-400 animate-pulse" : "text-zinc-500"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <YourStockCard user={user} />
                  
                  {/* Visual Performance Gauge Banner */}
                  <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-6 backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400 mb-4">Capital Allocation Performance</h3>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                        This deck monitors your capital leverage across all active stock listings. Unrealized yields fluctuate based on the live player rankings on osu! leaderboards.
                      </p>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1 rounded bg-zinc-950/60 border border-zinc-850 px-2 py-1 text-[10px] font-bold text-zinc-400 font-mono">
                          STATUS: INTEGRATED
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "assets" && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.15)]">
                      Holdings Registry ({portfolio.holdings.length} Assets)
                    </h3>
                  </div>

                  {portfolio.holdings.length === 0 ? (
                    <HoldingsEmpty />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {portfolio.holdings.map((holding) => (
                        <AssetGameCard key={holding.holdingId} holding={holding} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-6">
                    <InvestorLevelCard />
                    <ShowcaseCard user={user} />
                  </div>
                  <div>
                    <MissionsSummary />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mt-6 space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

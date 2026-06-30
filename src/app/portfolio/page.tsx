"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>
  );
}

function PageHeader() {
  return (
    <Reveal>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
            Portfolio
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your holdings, cost basis, and unrealized performance at a glance.
          </p>
        </div>
      </header>
    </Reveal>
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
    <div className="relative h-28 sm:h-36">
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
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/45 via-pink-500/10 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_150%_at_12%_-30%,rgba(236,72,153,0.40),transparent_55%)]" />
        </>
      )}
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.12]" />
      {children}
    </div>
  );
}

function ProfileHeader({
  user,
  portfolio,
}: {
  user: Me;
  portfolio: Portfolio | null;
}) {
  return (
    <Reveal>
      <h1 className="sr-only">Portfolio</h1>
      <header className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <ProfileBanner coverUrl={user.coverUrl}>
          <span className="absolute left-5 top-4 rounded-md bg-zinc-950/50 border border-zinc-800/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-pink-400 backdrop-blur">
            Active Investor
          </span>
        </ProfileBanner>

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 sm:-mt-14 flex items-end justify-between">
            <div className="inline-block rounded-full ring-4 ring-zinc-950 shadow-xl shadow-black/50 overflow-hidden">
              <Avatar src={user.avatarUrl} name={user.username} size="xl" />
            </div>
            
            <a
              href={`https://osu.ppy.sh/users/${user.osuUserId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({
                variant: "secondary",
                size: "sm",
                className: "gap-1.5 font-bold text-xs uppercase tracking-wider mb-2",
              })}
            >
              View on osu!
              <ArrowSquareOut size={13} weight="bold" />
            </a>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-50 leading-none">
                {user.username}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
                {user.equippedTitle && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-300 ring-1 ring-inset ring-pink-500/25 shadow-[0_0_8px_rgba(236,72,153,0.1)] animate-pulse">
                    <Trophy size={12} weight="fill" />
                    {user.equippedTitle}
                  </span>
                )}
                {user.countryCode && (
                  <span className="inline-flex items-center rounded-md bg-zinc-800/70 px-2 py-1 ring-1 ring-inset ring-zinc-700/50">
                    <Flag countryCode={user.countryCode} className="h-3.5" />
                  </span>
                )}
                {user.role === "Admin" && (
                  <span className="rounded-md bg-pink-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-pink-400 ring-1 ring-inset ring-pink-500/35 shadow-[0_0_8px_rgba(236,72,153,0.15)]">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Portfolio Indicators */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-850/60 border-t-2 border-t-pink-500 bg-zinc-950/40 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-pink-500/25 transition-all duration-300">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.1)]">
                Current Value
              </div>
              <div className="mt-2 font-mono text-xl sm:text-2xl font-black tabular-nums text-zinc-50 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {portfolio ? <Money value={portfolio.currentValue} /> : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-850/60 border-t-2 border-t-purple-500 bg-zinc-950/40 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-purple-500/25 transition-all duration-300">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.1)]">
                Cost Basis
              </div>
              <div className="mt-2 font-mono text-xl sm:text-2xl font-black tabular-nums text-zinc-100">
                {portfolio ? <Money value={portfolio.costBasis} /> : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-850/60 border-t-2 border-t-emerald-500 bg-zinc-950/40 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-emerald-500/25 transition-all duration-300">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                Profit / Loss
              </div>
              <div className="mt-2.5">
                {portfolio ? (
                  <PriceChange
                    value={portfolio.profitLoss}
                    className="text-base sm:text-lg font-black"
                  />
                ) : (
                  <span className="font-mono text-xl sm:text-2xl font-black text-zinc-50">—</span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-850/60 border-t-2 border-t-indigo-500 bg-zinc-950/40 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-indigo-500/25 transition-all duration-300">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.1)]">
                Holdings
              </div>
              <div className="mt-2 font-mono text-xl sm:text-2xl font-black tabular-nums text-zinc-550">
                {portfolio ? formatNumber(portfolio.holdings.length) : "—"}
              </div>
            </div>
          </div>
        </div>
      </header>
    </Reveal>
  );
}

const MAX_SHOWCASE = 3;

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
    <Reveal>
      <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-900/10">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-transparent" />
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} weight="fill" className="text-pink-400" />
            <h2 className="text-sm font-bold text-zinc-100">Showcase</h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-950/60 text-zinc-400 border border-zinc-800/40">
              {unlocked.length}/{data.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => (editing ? setEditing(false) : openEditor())}
            disabled={unlocked.length === 0}
            className={buttonClasses({ variant: "secondary", size: "sm", className: "gap-1.5 font-bold uppercase tracking-wider text-[10px]" })}
          >
            {editing ? <X size={12} weight="bold" /> : <PencilSimple size={12} weight="bold" />}
            {editing ? "Close" : "Edit"}
          </button>
        </div>

        {!editing && (
          <>
            {unlocked.length === 0 ? (
              <p className="text-xs text-zinc-400">
                Unlock achievements by trading — then pin your favourites here.{" "}
                <Link href="/achievements" className="text-pink-400 hover:underline">
                  Browse achievements
                </Link>
              </p>
            ) : showcased.length === 0 ? (
              <p className="text-xs text-zinc-400 leading-relaxed">
                No achievements showcased yet. Hit <span className="text-zinc-200 font-bold">Edit</span> to pin up to {MAX_SHOWCASE}.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {showcased.map((a) => (
                  <span
                    key={a.code}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-bold text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.05)] hover:border-pink-500/45 transition-colors cursor-help"
                    title={a.description}
                  >
                    <Trophy size={13} weight="fill" className="text-pink-400" />
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {editing && (
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Pick a title and up to {MAX_SHOWCASE} achievements to feature ({draftShowcase.length}/{MAX_SHOWCASE} selected).
            </p>
            <ul className="divide-y divide-zinc-850/60 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/30">
              {unlocked.map((a) => {
                const picked = draftShowcase.includes(a.code);
                const isTitle = draftTitle === a.code;
                return (
                  <li key={a.code} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-zinc-100">{a.name}</div>
                      <div className="truncate text-[10px] text-zinc-500 mt-0.5">{a.description}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDraftTitle(isTitle ? null : a.code)}
                        aria-pressed={isTitle}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset transition-colors ${
                          isTitle
                            ? "bg-pink-500/20 text-pink-200 ring-pink-500/40"
                            : "text-zinc-400 ring-zinc-800/60 hover:text-zinc-200"
                        }`}
                      >
                        Title
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleShowcase(a.code)}
                        aria-pressed={picked}
                        disabled={!picked && draftShowcase.length >= MAX_SHOWCASE}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset transition-colors disabled:opacity-40 ${
                          picked
                            ? "bg-emerald-500/20 text-emerald-200 ring-emerald-500/40"
                            : "text-zinc-400 ring-zinc-800/60 hover:text-zinc-200"
                        }`}
                      >
                        {picked && <Check size={11} weight="bold" />}
                        {picked ? "Pinned" : "Pin"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {error && (
              <p role="alert" className="text-xs text-rose-300">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className={buttonClasses({ size: "sm", className: "gap-1.5 font-bold uppercase tracking-wider text-[10px]" })}
              >
                {saving ? "Saving…" : "Save showcase"}
              </button>
              <button
                type="button"
                onClick={() => setDraftTitle(null)}
                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
              >
                Clear title
              </button>
            </div>
          </div>
        )}
      </Card>
    </Reveal>
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
    <Reveal>
      <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-900/10">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent" />
        <div className="mb-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightning size={18} weight="fill" className="text-pink-400 animate-pulse" />
            <h2 className="text-sm font-bold text-zinc-100">Daily Missions</h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-950/60 text-zinc-400 border border-zinc-800/40">
              {done}/{daily.length}
            </span>
          </div>
          <Link href="/missions" className="text-[10px] font-bold uppercase tracking-wider text-pink-400 hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-3.5">
          {daily.map((m) => {
            const pct = Math.min(100, Math.max(0, (m.currentValue / m.target) * 100));
            return (
              <div key={m.code} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={`font-semibold ${m.completed ? "text-emerald-400" : "text-zinc-300"}`}>{m.name}</span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {formatNumber(Math.min(m.currentValue, m.target))}/{formatNumber(m.target)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-900">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      m.completed 
                        ? "from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" 
                        : "from-pink-500 to-purple-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Reveal>
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
    <Reveal>
      <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-900/10">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-transparent" />
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartPieSlice size={18} weight="bold" className="text-pink-400" />
            <h2 className="text-sm font-bold text-zinc-100">Your Stock</h2>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 ring-1 ring-inset ring-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded-full">
            Tracked
          </span>
        </div>

        <Link
          href={`/stocks/${stock.stockId}`}
          className="group flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 transition-all duration-300 hover:border-pink-500/30 hover:shadow-[0_4px_25px_rgba(236,72,153,0.06)] sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full ring-2 ring-zinc-800 overflow-hidden shrink-0 group-hover:ring-pink-500/40 transition-colors">
              <Avatar src={stock.avatarUrl} name={stock.playerName} size="lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-zinc-100 group-hover:text-pink-300 transition-colors">
                  {stock.playerName}
                </span>
                {stock.countryCode && (
                  <Flag countryCode={stock.countryCode} className="h-3" />
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                {stock.globalRank != null && (
                  <span className="inline-flex items-center gap-1 rounded bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    <span className="text-zinc-600">#</span>
                    {formatNumber(stock.globalRank)}
                  </span>
                )}
                {stock.currentPp != null && (
                  <span className="inline-flex items-center gap-1 rounded bg-pink-500/10 px-1.5 py-0.5 font-mono text-[10px] text-pink-300 border border-pink-500/20">
                    {formatNumber(Math.round(stock.currentPp))}
                    <span className="text-pink-400/70">pp</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 justify-between sm:justify-end">
            <div className="text-right">
              <div className="font-mono text-xl font-black tabular-nums text-zinc-50">
                <Money value={stock.currentPrice} />
              </div>
              <PriceChange value={stock.priceChange24h} className="justify-end text-xs font-bold mt-0.5" />
            </div>
            <CaretRight
              size={16}
              weight="bold"
              className="text-zinc-650 transition-all duration-300 group-hover:text-pink-400 group-hover:translate-x-0.5"
            />
          </div>
        </Link>
      </Card>
    </Reveal>
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
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        </div>
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
      </Card>
    );
  }

  const atMax = level.xpForNextLevel === 0 || level.level >= 100;
  const pct = atMax ? 100 : Math.min(100, Math.max(0, level.progressToNext * 100));

  return (
    <Card className="relative overflow-hidden border border-zinc-850 bg-zinc-900/10">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-pink-500/20 via-indigo-500/20 to-transparent" />
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.1)]">
          <Medal size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-zinc-100">
              Level {formatNumber(level.level)}
            </span>
            <span className="truncate text-[10px] font-black uppercase tracking-wider text-pink-400">
              {level.title}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 font-semibold">
            {formatNumber(level.totalXp)} total XP
          </div>
        </div>
        {atMax && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300 ring-1 ring-inset ring-amber-500/30">
            MAX
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          <span>{atMax ? "Max level reached" : "Next Level Progression"}</span>
          {!atMax && (
            <span className="font-mono text-zinc-400">
              {formatNumber(level.xpIntoLevel)} / {formatNumber(level.xpForNextLevel)} XP
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label={`Investor level ${level.level} progress`}
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-900"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 shadow-[0_0_10px_rgba(236,72,153,0.4)] transition-all duration-500 bg-[length:200%_auto] animate-[gradient-text-move_3s_linear_infinite]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function HoldingsEmpty() {
  return (
    <Card>
      <EmptyState
        icon={<ChartPieSlice size={20} weight="bold" />}
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

function HoldingsTable({ portfolio }: { portfolio: Portfolio }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Your holdings: player, quantity, average price, current price, value,
          and profit or loss.
        </caption>
        <thead>
          <tr className="border-b border-zinc-800/80 text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-900/40">
            <th className="px-4 py-3 text-left font-semibold">Player</th>
            <th className="px-4 py-3 text-right font-semibold">Quantity</th>
            <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
              Avg Price
            </th>
            <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
              Current Price
            </th>
            <th className="px-4 py-3 text-right font-semibold">Value</th>
            <th className="px-4 py-3 text-right font-semibold">P&amp;L</th>
          </tr>
        </thead>
        <motion.tbody
          className="divide-y divide-zinc-850/60"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {portfolio.holdings.map((h) => (
            <motion.tr
              key={h.holdingId}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              transition={spring}
              className="group transition-all hover:bg-zinc-900/40 border-l-2 border-l-transparent hover:border-l-pink-500"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/stocks/${h.stockId}`}
                  className="inline-flex items-center gap-2.5 font-bold text-zinc-100 transition-colors hover:text-pink-400"
                >
                  <div className="rounded-full overflow-hidden ring-1 ring-zinc-800 group-hover:ring-pink-500/30 transition-colors">
                    <Avatar src={h.avatarUrl} name={h.playerName} size="sm" />
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    {h.playerName}
                    <CaretRight
                      size={14}
                      weight="bold"
                      className="text-zinc-650 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-pink-400 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs font-semibold tabular-nums text-zinc-350">
                {formatShares(h.quantity)}
              </td>
              <td className="hidden px-4 py-3 text-right font-mono text-xs tabular-nums text-zinc-400 sm:table-cell">
                <Money value={h.averagePrice} />
              </td>
              <td className="hidden px-4 py-3 text-right font-mono text-xs tabular-nums text-zinc-300 sm:table-cell">
                <Money value={h.currentPrice} />
              </td>
              <td className="px-4 py-3 text-right font-mono text-xs font-black tabular-nums text-zinc-100">
                <Money value={h.currentValue} />
              </td>
              <td className="px-4 py-3 text-right">
                <PriceChange value={h.profitLoss} className="justify-end text-xs font-extrabold" />
              </td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <Card className="p-0">
        <div className="grid grid-cols-1 divide-y divide-zinc-800 md:grid-cols-3 md:divide-x md:divide-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 sm:p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
            </div>
          ))}
        </div>
      </Card>
      <div className="h-60 rounded-2xl border border-zinc-800 skeleton" />
    </div>
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

  return (
    <PageShell>
      <ProfileHeader user={user} portfolio={portfolio} />

      {loading && <PortfolioSkeleton />}

      {!loading && error && (
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 animate-fade-in">
          <WarningCircle
            size={18}
            weight="bold"
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && portfolio && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Left / Main Dashboard Column */}
          <div className="md:col-span-2 space-y-8">
            <Reveal delay={0.05}>
              <h2 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.15)]">
                Holdings Register
              </h2>
              {portfolio.holdings.length === 0 ? (
                <HoldingsEmpty />
              ) : (
                <HoldingsTable portfolio={portfolio} />
              )}
            </Reveal>
          </div>

          {/* Right / Sidebar Gamified Stats Column */}
          <div className="md:col-span-1 space-y-6">
            <YourStockCard user={user} />
            <InvestorLevelCard />
            <ShowcaseCard user={user} />
            <MissionsSummary />
          </div>
        </div>
      )}
    </PageShell>
  );
}

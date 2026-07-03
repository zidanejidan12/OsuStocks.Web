"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Target,
  CheckCircle,
  Lightning,
  CalendarCheck,
  Lock,
  WarningCircle,
  ChartLineUp,
  Flame,
  TrendUp,
  Coins,
  Clock,
  Sparkle,
} from "@phosphor-icons/react";
import { getMissions, ApiError } from "@/lib/api/client";
import type { Mission } from "@/lib/api/types";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Coin } from "@/components/ui/Coin";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 -z-10 h-[350px] w-[350px] rounded-full bg-cyan-500/12 dark:bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-emerald-500/12 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {children}
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <Reveal>
      <header className="mb-6">
        <h1 className="pb-2 text-4xl sm:text-5xl font-black tracking-tight font-display bg-gradient-to-r from-cyan-600 via-cyan-200 to-emerald-600 dark:from-cyan-500 dark:via-zinc-100 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-text">
          Missions
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Complete daily goals, claim bounties, and climb the platform ranks.
        </p>
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
        message="You need to be signed in to view your missions."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

/** Coarse "in X" label for a future timestamp. Falls back to "soon"/"resetting" near zero. */
function formatResetsIn(iso: string): string {
  if (!iso) return iso;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return iso;
  const seconds = Math.round((target - Date.now()) / 1000);
  if (seconds <= 0) return "resetting…";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${Math.max(1, minutes)}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function getMissionIcon(metric: string) {
  switch (metric) {
    case "trades":
      return <Lightning className="text-pink-400 shrink-0" size={20} weight="duotone" />;
    case "volume":
    case "volume_credits":
      return <ChartLineUp className="text-indigo-400 shrink-0" size={20} weight="duotone" />;
    case "unique_stocks":
      return <Flame className="text-amber-400 shrink-0" size={20} weight="duotone" />;
    case "profit":
      return <TrendUp className="text-emerald-400 shrink-0" size={20} weight="duotone" />;
    default:
      return <Target className="text-pink-400 shrink-0" size={20} weight="duotone" />;
  }
}

function MissionsSummary({ missions }: { missions: Mission[] }) {
  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const totalRewards = missions.reduce((acc, m) => acc + m.rewardCredits, 0);
  const claimedRewards = missions.reduce((acc, m) => acc + (m.completed ? m.rewardCredits : 0), 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Find next reset time (minimum resetsAt from incomplete missions)
  const incompleteMissions = missions.filter((m) => !m.completed);
  const nextResetIso = incompleteMissions.length > 0 
    ? incompleteMissions.sort((a, b) => new Date(a.resetsAt).getTime() - new Date(b.resetsAt).getTime())[0].resetsAt 
    : missions[0]?.resetsAt;

  const [resetLabel, setResetLabel] = useState(() => formatResetsIn(nextResetIso));
  useEffect(() => {
    if (!nextResetIso) return;
    setResetLabel(formatResetsIn(nextResetIso));
    const interval = setInterval(() => {
      setResetLabel(formatResetsIn(nextResetIso));
    }, 30000);
    return () => clearInterval(interval);
  }, [nextResetIso]);  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-805 bg-zinc-150/40 dark:bg-zinc-950/20 p-6 md:p-8 mb-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:14px_24px] opacity-35 pointer-events-none" />
        <div className="absolute -left-12 -top-12 -z-10 h-48 w-48 rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 -z-10 h-48 w-48 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:divide-x md:divide-zinc-250 dark:md:divide-zinc-800/40">
          <div className="flex flex-col justify-between pr-0 md:pr-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">Operation Progress</span>
              </div>
              <h2 className="text-3xl font-black font-display text-zinc-800 dark:text-zinc-105 mt-2 flex items-baseline gap-2">
                <span className="bg-gradient-to-r from-zinc-800 via-pink-600 to-pink-700 dark:from-zinc-100 dark:via-pink-200 dark:to-pink-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">{completionRate}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Completed</span>
              </h2>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300/40 dark:border-zinc-800/40">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]" 
                  style={{ width: `${completionRate}%` }} 
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-3 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 shrink-0" />
                  {completed}/{total} Missions Clear
                </span>
                <span className="text-zinc-700 dark:text-zinc-455 font-semibold">+{claimedRewards} / {totalRewards} Credits</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between px-0 md:px-6 pt-6 md:pt-0 border-t md:border-t-0 border-zinc-200/50 dark:border-zinc-900/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-650 dark:text-pink-400">Total Available Bounty</span>
              </div>
              <div className="flex items-center gap-3.5 mt-3.5">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]">
                  <Coins size={22} weight="fill" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-zinc-800 dark:text-zinc-100 leading-none tracking-tight">{formatNumber(totalRewards)}</div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 font-semibold">Credits up for grabs</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <span className="font-semibold uppercase tracking-wider">Earned Today:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.08)]">+{formatNumber(claimedRewards)} Cr</span>
            </div>
          </div>

          <div className="flex flex-col justify-between pl-0 md:pl-6 pt-6 md:pt-0 border-t md:border-t-0 border-zinc-200/50 dark:border-zinc-900/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-650 dark:text-indigo-400">System Refresh Clock</span>
              </div>
              <div className="flex items-center gap-3.5 mt-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                  <Clock size={22} weight="fill" />
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-zinc-800 dark:text-zinc-100 leading-none tracking-tight">{resetLabel}</div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 font-semibold">Until objective rotation</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-800/40">
              <span className="font-semibold uppercase tracking-wider">Status:</span>
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-bold">
                <Sparkle size={10} weight="fill" className="animate-pulse" />
                Online & Tracking
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function MissionRow({ mission }: { mission: Mission }) {
  const { name, description, target, currentValue, rewardCredits, completed, completedAt, resetsAt } =
    mission;

  // Tick the "resets in" label live so it counts down without a page refresh.
  // Only runs for incomplete missions (the only ones that show the label).
  const [resetsLabel, setResetsLabel] = useState(() => formatResetsIn(resetsAt));
  useEffect(() => {
    if (completed) return;
    setResetsLabel(formatResetsIn(resetsAt));
    const id = setInterval(() => {
      setResetsLabel(formatResetsIn(resetsAt));
    }, 30000);
    return () => clearInterval(id);
  }, [resetsAt, completed]);

  const progressPct = target > 0 ? Math.min(100, (currentValue / target) * 100) : completed ? 100 : 0;  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 border-2 ${
        completed 
          ? "border-emerald-500/20 border-t-emerald-500/40 bg-gradient-to-r from-emerald-950/10 via-zinc-950/20 to-zinc-950/40 shadow-[0_8px_30px_rgba(16,185,129,0.06)]" 
          : "border-zinc-850/65 " + 
            (mission.period === "Daily" 
              ? "border-t-pink-500/30 hover:border-pink-500/50 " 
              : "border-t-indigo-500/30 hover:border-indigo-500/50 ") +
            "hover:border-zinc-700/80 hover:shadow-[0_12px_40px_rgba(236,72,153,0.15)] bg-gradient-to-br from-zinc-950/80 to-zinc-900/40 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
      }`}
    >
      {/* Decorative vertical color bar on the left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        completed
          ? "bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 shadow-[2px_0_10px_rgba(52,211,153,0.4)]"
          : mission.period === "Daily"
          ? "bg-gradient-to-b from-pink-500 via-purple-500 to-pink-600 shadow-[2px_0_10px_rgba(236,72,153,0.4)]"
          : "bg-gradient-to-b from-indigo-500 via-purple-600 to-cyan-500 shadow-[2px_0_10px_rgba(99,102,241,0.4)]"
      }`} />

      {/* Visual background element for completed state */}
      {completed ? (
        <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl transition-all duration-500 group-hover:scale-110" />
      ) : (
        <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-pink-500/[0.02] blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-pink-500/[0.06]" />
      )}
      
      {/* Subtle sweeping shine animation */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] animate-[shimmer_5s_infinite]" style={{ backgroundSize: '200% 100%' }} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-4 pr-2 pt-4">
        {/* Left column: Icon & Text Info */}
        <div className="flex items-start gap-4 min-w-0">
          <div className={`relative p-3 rounded-2xl border shrink-0 mt-0.5 transition-all duration-300 overflow-hidden ${
            completed 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
              : "bg-zinc-950/90 border-zinc-800/80 text-zinc-400 group-hover:border-pink-500/40 group-hover:text-pink-400 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.15)]"
          }`}>
            <div className={`absolute inset-0 opacity-20 pointer-events-none ${
              completed ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.4),transparent_70%)]" : "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.4),transparent_70%)]"
            }`} />
            <div className="relative z-10">
              {getMissionIcon(mission.metric)}
            </div>
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-extrabold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                {name}
              </h3>
              {mission.period && (
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  mission.period === "Daily"
                    ? "bg-pink-500/15 text-pink-400 border border-pink-500/25 shadow-[0_0_10px_rgba(236,72,153,0.08)]"
                    : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-[0_0_10px_rgba(99,102,241,0.08)]"
                }`}>
                  {mission.period}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Right column: Status badge or reset time */}
        <div className="flex items-center gap-2 shrink-0 md:self-start">
          {completed ? (
            <Badge tone="success" className="animate-fade-in py-1 px-3 font-black uppercase tracking-wider text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.25)] border border-emerald-500/30">
              <CheckCircle size={13} weight="fill" className="mr-1" />
              Completed
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950/80 px-3 py-1.5 text-[10px] font-bold text-zinc-400 ring-1 ring-inset ring-zinc-800/80 font-mono shadow-sm">
              <Clock size={12} className="text-zinc-500" />
              resets in {resetsLabel}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Reward Container */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-5 pt-4 pb-4.5 border-t border-zinc-850/40 pl-4 pr-2">
        {/* Progress Bar with numeric progress */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs tabular-nums text-zinc-500">
            <span className="font-black text-[9px] uppercase tracking-widest text-zinc-500">Mission Progress</span>
            <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border ${
              completed 
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                : "text-zinc-300 bg-zinc-950/60 border-zinc-800/60"
            }`}>
              {formatNumber(Math.min(currentValue, target))} / {formatNumber(target)}
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-900">
            <div
              className={`h-full rounded-full transition-all duration-500 bg-[length:200%_auto] relative ${
                completed 
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-[gradient-text-move_3s_linear_infinite] shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-[gradient-text-move_3s_linear_infinite] shadow-[0_0_12px_rgba(236,72,153,0.5)]"
              }`}
              style={{ width: `${progressPct}%` }}
            >
              {progressPct > 0 && progressPct < 100 && (
                <div className={`absolute right-0 top-0 bottom-0 w-1.5 rounded-full filter blur-[0.5px] ${
                  completed ? "bg-emerald-300" : "bg-pink-350"
                }`} />
              )}
            </div>
          </div>
        </div>

        {/* Reward details */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          {completed && completedAt && (
            <span className="text-[10px] text-zinc-500 font-mono">
              Cleared {formatRelativeTime(completedAt)}
            </span>
          )}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all duration-300 font-display ${
            completed 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-black" 
              : "bg-zinc-955/80 border-zinc-800/80 text-zinc-300 group-hover:border-pink-500/30 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.25)] group-hover:text-pink-300 font-bold"
          }`}>
            <Coin size="h-3.5 w-3.5" className={completed ? "text-emerald-400" : "text-amber-400"} />
            <span className="font-mono text-xs tabular-nums">+{formatNumber(rewardCredits)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MissionsSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s}>
          <Skeleton className="mb-3 h-4 w-24" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
                <Skeleton className="mt-4 h-4 w-16" />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionSection({
  title,
  icon,
  missions,
}: {
  title: string;
  icon: React.ReactNode;
  missions: Mission[];
}) {
  const reduceMotion = useReducedMotion();
  if (missions.length === 0) return null;
  return (
    <Reveal>
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {icon}
          {title}
        </h2>
        <motion.div
          className="space-y-4"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
        >
          {missions.map((m) => (
            <motion.div
              key={m.code}
              variants={reduceMotion ? undefined : fadeUp}
            >
              <MissionRow mission={m} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </Reveal>
  );
}

export default function MissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [missions, setMissions] = useState<Mission[] | null>(null);
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

    getMissions()
      .then((d) => {
        if (!cancelled) setMissions(d);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load missions.",
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
        <MissionsSkeleton />
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

  const daily = (missions ?? []).filter((m) => m.period === "Daily");
  const weekly = (missions ?? []).filter((m) => m.period === "Weekly");

  return (
    <PageShell>
      <PageHeader />

      {loading && <MissionsSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && missions && missions.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Target size={20} weight="bold" />}
            title="No missions right now"
            message="Check back soon — missions refresh on a daily and weekly cycle."
          />
        </Reveal>
      )}

      {!loading &&
        !error &&
        missions &&
        missions.length > 0 &&
        daily.length === 0 &&
        weekly.length === 0 && (
          <Reveal>
            <EmptyState
              icon={<Target size={20} weight="bold" />}
              title="No active missions"
              message="You have no daily or weekly missions right now. Check back soon."
            />
          </Reveal>
        )}

      {!loading &&
        !error &&
        missions &&
        missions.length > 0 &&
        (daily.length > 0 || weekly.length > 0) && (
          <div className="space-y-8">
            <MissionsSummary missions={missions} />

            <div className="space-y-8">
              <MissionSection
                title="Daily Objectives"
                icon={<Lightning size={13} weight="fill" className="text-pink-400 animate-pulse" />}
                missions={daily}
              />
              <MissionSection
                title="Weekly Campaign"
                icon={
                  <CalendarCheck size={13} weight="fill" className="text-indigo-400" />
                }
                missions={weekly}
              />
            </div>
          </div>
        )}
    </PageShell>
  );
}

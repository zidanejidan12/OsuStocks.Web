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
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">{children}</div>;
}

function PageHeader() {
  return (
    <Reveal>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
          Missions
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Recurring objectives that refresh on a schedule. Clear them for credit rewards.
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
  }, [nextResetIso]);

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-6 md:p-8 mb-8 backdrop-blur-md">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        {/* Glowing background blobs */}
        <div className="absolute -left-12 -top-12 -z-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 -z-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Progress Section */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Operation Progress</span>
              <h2 className="text-2xl font-black font-display text-zinc-100 mt-1 flex items-baseline gap-2">
                {completionRate}% <span className="text-xs font-normal text-zinc-400">Completed</span>
              </h2>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-500" 
                  style={{ width: `${completionRate}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                <span>{completed}/{total} Missions Clear</span>
                <span>+{claimedRewards} / {totalRewards} Credits</span>
              </div>
            </div>
          </div>

          {/* Claimed Rewards Card */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Total Available Bounty</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Coins size={20} weight="fill" />
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-zinc-100">{formatNumber(totalRewards)}</div>
                  <div className="text-[10px] text-zinc-400">Credits up for grabs</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-900">
              <span>Earned Today:</span>
              <span className="font-mono text-emerald-400 font-bold">+{formatNumber(claimedRewards)} Cr</span>
            </div>
          </div>

          {/* Reset Countdown Card */}
          <div className="flex flex-col justify-between p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">System Refresh Clock</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Clock size={20} weight="fill" />
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-zinc-100">{resetLabel}</div>
                  <div className="text-[10px] text-zinc-400">Until next objective rotation</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-900">
              <span>Status:</span>
              <span className="text-indigo-400 flex items-center gap-1">
                <Sparkle size={12} weight="fill" className="animate-pulse" />
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

  const progressPct = target > 0 ? Math.min(100, (currentValue / target) * 100) : completed ? 100 : 0;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
        completed 
          ? "border-emerald-500/20 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.03)]" 
          : "border-zinc-800/80 hover:border-zinc-700/80 hover:shadow-[0_4px_25px_rgba(236,72,153,0.06)]"
      }`}
    >
      {/* Visual background elements */}
      {completed && (
        <div className="absolute right-0 top-0 -z-10 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left column: Icon & Text Info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 transition-colors ${
            completed 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-zinc-950/60 border-zinc-800/80 text-zinc-400 group-hover:border-zinc-700"
          }`}>
            {getMissionIcon(mission.metric)}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                {name}
              </h3>
              {mission.period && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  mission.period === "Daily"
                    ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                }`}>
                  {mission.period}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>

        {/* Right column: Status badge or reset time */}
        <div className="flex items-center gap-2 shrink-0 md:self-start">
          {completed ? (
            <Badge tone="success" className="animate-fade-in">
              <CheckCircle size={12} weight="fill" />
              Completed
            </Badge>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900/60 px-2 py-0.5 text-[10px] font-medium text-zinc-500 ring-1 ring-inset ring-zinc-800/60">
              <Clock size={10} />
              resets in {resetsLabel}
            </span>
          )}
        </div>
      </div>

      {/* Progress & Reward Container */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4 pt-4 border-t border-zinc-800/40">
        {/* Progress Bar with numeric progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs tabular-nums text-zinc-500">
            <span className="font-semibold text-[10px] uppercase tracking-wider">Mission Progress</span>
            <span className={`font-mono font-bold ${completed ? "text-emerald-400" : "text-zinc-400"}`}>
              {formatNumber(Math.min(currentValue, target))} / {formatNumber(target)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.3)]"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Reward details */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          {completed && completedAt && (
            <span className="text-[10px] text-zinc-500 font-mono">
              Cleared {formatRelativeTime(completedAt)}
            </span>
          )}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            completed 
              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
              : "bg-zinc-950/60 border-zinc-800/80 text-zinc-300 group-hover:border-zinc-700/80"
          }`}>
            <Coin size="h-3.5 w-3.5" className={completed ? "text-emerald-400" : "text-amber-400"} />
            <span className="font-mono text-xs font-bold tabular-nums">+{formatNumber(rewardCredits)}</span>
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

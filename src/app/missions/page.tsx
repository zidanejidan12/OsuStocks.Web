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
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">{children}</div>;
}

function PageHeader() {
  return (
    <Reveal>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
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

function ProgressBar({
  value,
  total,
  completed,
  label,
}: {
  value: number;
  total: number;
  completed: boolean;
  label: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : completed ? 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={`${label} progress`}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
    >
      <div
        className={`h-full rounded-full ${completed ? "bg-emerald-400" : "bg-pink-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
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
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setResetsLabel(formatResetsIn(resetsAt));
    const id = setInterval(() => {
      setResetsLabel(formatResetsIn(resetsAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [resetsAt, completed]);

  return (
    <Card
      className={`${
        completed ? "ring-1 ring-inset ring-emerald-500/30 bg-emerald-500/[0.04]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100">{name}</h3>
          <p className="mt-0.5 text-sm text-zinc-400">{description}</p>
        </div>
        {completed ? (
          <Badge tone="success">
            <CheckCircle size={12} weight="fill" />
            Completed
          </Badge>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-800/70 px-2.5 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-700/50">
            resets in {resetsLabel}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs tabular-nums text-zinc-500">
          <span>Progress</span>
          <span className="font-mono text-zinc-400">
            {formatNumber(Math.min(currentValue, target))} / {formatNumber(target)}
          </span>
        </div>
        <ProgressBar
          value={currentValue}
          total={target}
          completed={completed}
          label={name}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
          <Coin />
          <span className="font-mono tabular-nums">{formatNumber(rewardCredits)}</span>
        </span>
        {completed && completedAt && (
          <span className="text-[11px] text-zinc-500">
            {formatRelativeTime(completedAt)}
          </span>
        )}
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
            <MissionSection
              title="Daily"
              icon={<Lightning size={13} weight="fill" className="text-pink-400" />}
              missions={daily}
            />
            <MissionSection
              title="Weekly"
              icon={
                <CalendarCheck size={13} weight="fill" className="text-pink-400" />
              }
              missions={weekly}
            />
          </div>
        )}
    </PageShell>
  );
}

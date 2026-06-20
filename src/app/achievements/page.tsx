"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Medal,
  SealCheck,
  Lock,
  WarningCircle,
} from "@phosphor-icons/react";
import { getAchievements, ApiError } from "@/lib/api/client";
import type { Achievement, AchievementsResponse } from "@/lib/api/types";
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
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>;
}

function PageHeader({ summary }: { summary?: AchievementsResponse | null }) {
  return (
    <Reveal>
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
            Achievements
          </h1>
          {summary && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {formatNumber(summary.unlockedCount)} / {formatNumber(summary.totalCount)} unlocked
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Milestones you earn as you trade. Each one pays out a credit reward.
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
        message="You need to be signed in to view your achievements."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

function ProgressBar({
  value,
  total,
  unlocked,
  label,
}: {
  value: number;
  total: number;
  unlocked: boolean;
  label: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : unlocked ? 100 : 0;
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
        className={`h-full rounded-full ${unlocked ? "bg-emerald-400" : "bg-pink-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { name, description, category, threshold, currentValue, rewardCredits, unlocked, unlockedAt } =
    achievement;
  return (
    <Card
      className={`flex h-full flex-col ${
        unlocked ? "ring-1 ring-inset ring-emerald-500/30 bg-emerald-500/[0.04]" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
              unlocked
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-zinc-800/70 text-zinc-500"
            }`}
          >
            {unlocked ? (
              <SealCheck size={17} weight="fill" />
            ) : (
              <Medal size={17} weight="bold" />
            )}
          </span>
          <h2 className="text-sm font-semibold text-zinc-100">{name}</h2>
        </div>
        <Badge>{category}</Badge>
      </div>

      <p className="text-sm text-zinc-400">{description}</p>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs tabular-nums text-zinc-500">
          <span>Progress</span>
          <span className="font-mono text-zinc-400">
            {formatNumber(Math.min(currentValue, threshold))} / {formatNumber(threshold)}
          </span>
        </div>
        <ProgressBar
          value={currentValue}
          total={threshold}
          unlocked={unlocked}
          label={name}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-zinc-300">
          <Coin />
          <span className="font-mono tabular-nums">{formatNumber(rewardCredits)}</span>
        </span>
        {unlocked ? (
          <span className="inline-flex flex-col items-end gap-0.5">
            <Badge tone="success">
              <SealCheck size={12} weight="fill" />
              Unlocked
            </Badge>
            {unlockedAt && (
              <span className="text-[11px] text-zinc-500">
                {formatRelativeTime(unlockedAt)}
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Lock size={12} weight="bold" />
            Locked
          </span>
        )}
      </div>
    </Card>
  );
}

function AchievementsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className="mb-3 flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-5 h-1.5 w-full rounded-full" />
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const { user, loading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<AchievementsResponse | null>(null);
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

    getAchievements()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load achievements.",
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
        <AchievementsSkeleton />
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
      <PageHeader summary={data} />

      {loading && <AchievementsSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && data && data.items.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Medal size={20} weight="bold" />}
            title="No achievements yet"
            message="Achievements show up here as the catalog grows."
          />
        </Reveal>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
        >
          {data.items.map((a) => (
            <motion.div
              key={a.code}
              variants={reduceMotion ? undefined : fadeUp}
            >
              <AchievementCard achievement={a} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageShell>
  );
}

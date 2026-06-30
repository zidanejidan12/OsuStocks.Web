"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Medal,
  SealCheck,
  Lock,
  WarningCircle,
  CaretLeft,
  CaretRight,
  X,
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
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
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
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-850"
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          unlocked
            ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            : "bg-gradient-to-r from-pink-500 to-purple-500"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const slideVariants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "right" ? 150 : -150,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut" as any
    }
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "right" ? -150 : 150,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "easeOut" as any
    }
  })
};

function getAchievementTier(reward: number) {
  if (reward >= 1000) return { name: "Platinum", color: "text-cyan-400", ring: "ring-cyan-500/40", border: "border-cyan-500/30", bg: "bg-cyan-500/[0.04]", glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]" };
  if (reward >= 500) return { name: "Gold", color: "text-amber-400", ring: "ring-amber-500/45", border: "border-amber-500/30", bg: "bg-amber-500/[0.03]", glow: "shadow-[0_0_25px_rgba(245,158,11,0.12)]" };
  if (reward >= 250) return { name: "Silver", color: "text-zinc-350", ring: "ring-zinc-400/40", border: "border-zinc-450/25", bg: "bg-zinc-400/[0.02]", glow: "" };
  return { name: "Bronze", color: "text-orange-400", ring: "ring-orange-500/30", border: "border-orange-500/20", bg: "bg-orange-500/[0.01]", glow: "" };
}

function getAchievementRarity(reward: number) {
  if (reward >= 1000) return { pct: "2.4%", label: "Ultra Rare", color: "from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30" };
  if (reward >= 500) return { pct: "12.8%", label: "Rare", color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30" };
  if (reward >= 250) return { pct: "34.5%", label: "Uncommon", color: "from-zinc-500/20 to-zinc-400/20 text-zinc-300 border-zinc-500/25" };
  return { pct: "78.2%", label: "Common", color: "from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/20" };
}

function AchievementsSummary({ data }: { data: AchievementsResponse }) {
  const total = data.items.length;
  const unlocked = data.unlockedCount ?? data.items.filter(a => a.unlocked).length;
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
  const earnedCredits = data.items.filter(a => a.unlocked).reduce((acc, a) => acc + a.rewardCredits, 0);
  const potentialCredits = data.items.filter(a => !a.unlocked).reduce((acc, a) => acc + a.rewardCredits, 0);

  return (
    <Card className="relative overflow-hidden mb-8 border-pink-500/20 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950">
      {/* Decorative gradient glowing orb */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid gap-6 md:grid-cols-3 items-center">
        {/* Progress ring / Circular progress visual */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-zinc-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] transition-all duration-1000"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - pct / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-black text-zinc-100">
              {pct}%
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-200">Completion Rate</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Unlock milestones to boost your status.
            </p>
          </div>
        </div>

        {/* Stats 1 */}
        <div className="border-t border-zinc-800/60 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Milestones Unlocked</span>
          <span className="text-2xl font-black font-display text-zinc-100 mt-1">
            {unlocked} <span className="text-zinc-500 text-sm font-medium">/ {total}</span>
          </span>
        </div>

        {/* Stats 2 */}
        <div className="border-t border-zinc-800/60 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 flex flex-col justify-center">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Credits Earned</span>
          <span className="text-2xl font-black font-display text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)] mt-1 flex items-center gap-1.5">
            <Coin />
            {earnedCredits.toLocaleString()}
            {potentialCredits > 0 && (
              <span className="text-[10px] text-zinc-500 font-sans font-medium">
                (+{potentialCredits.toLocaleString()} locked)
              </span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { name, description, category, threshold, currentValue, rewardCredits, unlocked, unlockedAt } =
    achievement;

  const tier = getAchievementTier(rewardCredits);
  const rarity = getAchievementRarity(rewardCredits);

  const cardStyle = unlocked
    ? `${tier.border} ${tier.bg} ${tier.glow} ring-1 ring-inset ${tier.ring} before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr before:from-pink-500/5 before:to-transparent before:pointer-events-none`
    : "border-dashed border-zinc-800/80 bg-zinc-950/40 opacity-70 grayscale-[30%] hover:grayscale-0 hover:opacity-90";

  return (
    <Card className={`relative overflow-hidden flex h-full flex-col transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(236,72,153,0.1)] ${cardStyle}`}>
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none rounded-3xl" />

      {/* Glow Corner Orb */}
      {unlocked && (
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="relative mb-3 flex items-start justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition-all duration-500 ${
              unlocked
                ? `bg-zinc-900 border-2 ${tier.border} ${tier.color} shadow-[0_0_15px_rgba(236,72,153,0.15)] scale-110`
                : "bg-zinc-900/40 border border-zinc-800 text-zinc-650"
            }`}
          >
            {unlocked ? (
              <SealCheck size={20} weight="fill" />
            ) : (
              <Medal size={20} weight="bold" />
            )}
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black font-display tracking-tight text-zinc-100 flex items-center gap-1.5">
              {name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-sans font-black uppercase tracking-wider ${tier.color}`}>
                {tier.name}
              </span>
              <span className="text-zinc-700 text-xs font-light">•</span>
              <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-md border bg-zinc-900/50 border-zinc-800/80 text-zinc-350`}>
                {rarity.pct} of players
              </span>
            </div>
          </div>
        </div>
        <Badge tone={unlocked ? "accent" : "neutral"}>{category}</Badge>
      </div>

      <p className="relative text-xs sm:text-sm text-zinc-400 flex-1 leading-relaxed mt-2 pl-1 z-10">
        {description}
      </p>

      {/* Progress tracker */}
      <div className="relative mt-6 space-y-2 z-10">
        <div className="flex items-center justify-between text-[10px] tabular-nums text-zinc-500 font-mono">
          <span>Goal Progress</span>
          <span className="text-zinc-400 font-bold">
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

      {/* Footer */}
      <div className="relative mt-5 flex items-center justify-between border-t border-zinc-900/80 pt-3.5 text-xs z-10">
        <span className="inline-flex items-center gap-1.5 text-zinc-300">
          <Coin />
          <span className="font-mono font-black text-zinc-100">{formatNumber(rewardCredits)}</span>
        </span>
        {unlocked ? (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
              <SealCheck size={13} weight="fill" /> Claimed
            </span>
            {unlockedAt && (
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                {formatRelativeTime(unlockedAt)}
              </span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 bg-zinc-900/30 px-2.5 py-1 rounded-lg border border-zinc-800/40 uppercase tracking-wider">
            <Lock size={10} weight="bold" /> In Progress
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
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const handleNext = () => {
    if (selectedIdx === null) return;
    setSlideDirection("right");
    setSelectedIdx((prev) => (prev! + 1) % filteredItems.length);
  };

  const handlePrev = () => {
    if (selectedIdx === null) return;
    setSlideDirection("left");
    setSelectedIdx((prev) => (prev! - 1 + filteredItems.length) % filteredItems.length);
  };

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

  const filteredItems = data
    ? data.items.filter((a) => activeCategory === "All" || a.category === activeCategory)
    : [];

  return (
    <PageShell>
      <PageHeader summary={data} />

      {loading && <AchievementsSkeleton />}

      {!loading && !error && data && (
        <Reveal>
          <AchievementsSummary data={data} />
        </Reveal>
      )}

      {/* Category Tabs */}
      {!loading && !error && data && data.items.length > 0 && (
        <Reveal>
          <div className="mb-8 flex flex-wrap gap-2 border-b border-zinc-900 pb-5">
            {["All", ...Array.from(new Set(data.items.map((item) => item.category)))].map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold uppercase tracking-wider font-display transition-all duration-300 border ${
                    active
                      ? "bg-pink-500 text-white border-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.35)]"
                      : "text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:bg-zinc-900/40 hover:border-zinc-800"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Reveal>
      )}

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

      {!loading && !error && data && filteredItems.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Medal size={20} weight="bold" />}
            title="No matches found"
            message={`There are no achievements in the "${activeCategory}" category.`}
          />
        </Reveal>
      )}

      {!loading && !error && data && filteredItems.length > 0 && (
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
        >
          {filteredItems.map((a, index) => (
            <motion.div
              key={a.code}
              variants={reduceMotion ? undefined : fadeUp}
              onClick={() => {
                setSlideDirection("right");
                setSelectedIdx(index);
              }}
              className="cursor-pointer"
            >
              <AchievementCard achievement={a} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Sliding Achievement Inspector Modal */}
      <AnimatePresence>
        {selectedIdx !== null && filteredItems[selectedIdx] && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIdx(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slider Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10"
            >
              {/* Top Banner Accent */}
              <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedIdx(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors z-20"
              >
                <X size={18} weight="bold" />
              </button>

              {/* Slider Motion Card */}
              <div className="p-8">
                <div className="overflow-hidden min-h-[360px] flex flex-col justify-between">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    {(() => {
                      const achievement = filteredItems[selectedIdx];
                      if (!achievement) return null;
                      const tier = getAchievementTier(achievement.rewardCredits);
                      const rarity = getAchievementRarity(achievement.rewardCredits);
                      const unlocked = achievement.unlocked;
                      return (
                        <motion.div
                          key={achievement.code}
                          custom={slideDirection}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="flex flex-col items-center text-center flex-1"
                        >
                          {/* Glow Behind Badge with Rotating Orbits */}
                          <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                            <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${unlocked ? "bg-emerald-500" : "bg-pink-500"}`} />
                            
                            {/* Orbital Ring */}
                            <div className="absolute inset-0 border border-dashed border-zinc-800 rounded-full animate-[spin_30s_linear_infinite]" />
                            <div className="absolute inset-2 border border-zinc-900 rounded-full" />

                            <div
                              className={`w-24 h-24 rounded-3xl border-2 grid place-items-center transition-all duration-300 relative z-10 ${
                                unlocked
                                  ? `bg-zinc-900 ${tier.border} ${tier.color} shadow-[0_0_35px_rgba(236,72,153,0.2)]`
                                  : "bg-zinc-900/50 border-zinc-850 text-zinc-650"
                              }`}
                            >
                              {unlocked ? (
                                <SealCheck size={52} weight="fill" className="animate-pulse" />
                              ) : (
                                <Medal size={52} weight="bold" />
                              )}
                            </div>
                          </div>

                          {/* Category Badge & Rarity Info */}
                          <div className="flex flex-col items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Badge tone={unlocked ? "accent" : "neutral"}>{achievement.category}</Badge>
                              {unlocked && (
                                <span className={`text-[10px] font-sans font-black uppercase tracking-wider ${tier.color}`}>
                                  {tier.name} Edition
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md border bg-zinc-900/50 border-zinc-800/80 text-zinc-350`}>
                              {rarity.label} • {rarity.pct} Unlocked
                            </span>
                          </div>

                          {/* Title */}
                          <h2 className="text-2xl font-black font-display tracking-tight text-zinc-50 leading-tight">
                            {achievement.name}
                          </h2>

                          {/* Description */}
                          <p className="mt-3.5 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs px-2">
                            {achievement.description}
                          </p>

                          {/* Progress Panel */}
                          <div className="w-full mt-6 bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-2xl space-y-2.5 text-left">
                            <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                              <span>Milestone Goal</span>
                              <span className="text-zinc-300 font-bold">
                                {formatNumber(Math.min(achievement.currentValue, achievement.threshold))} / {formatNumber(achievement.threshold)}
                              </span>
                            </div>
                            <ProgressBar
                              value={achievement.currentValue}
                              total={achievement.threshold}
                              unlocked={unlocked}
                              label={achievement.name}
                            />
                            <p className="text-[10px] text-zinc-500 text-center font-medium pt-0.5">
                              {unlocked
                                ? `Completed! Claimed ${achievement.rewardCredits} Credits.`
                                : `${formatNumber(achievement.threshold - achievement.currentValue)} units remaining to unlock.`
                              }
                            </p>
                          </div>

                          {/* Payout Reward */}
                          <div className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl shadow-inner">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">CREDIT BONUS</span>
                            <span className="flex items-center gap-1.5 text-zinc-100 font-mono font-black text-sm">
                              <Coin />
                              {formatNumber(achievement.rewardCredits)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>

                {/* Slider Navigation Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-4">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                  >
                    <CaretLeft size={20} weight="bold" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex items-center gap-1.5">
                    {filteredItems.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSlideDirection(i > selectedIdx! ? "right" : "left");
                          setSelectedIdx(i);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === selectedIdx ? "w-6 bg-pink-500" : "w-1.5 bg-zinc-800 hover:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                  >
                    <CaretRight size={20} weight="bold" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

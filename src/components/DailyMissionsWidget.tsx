"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getMissions, ApiError } from "@/lib/api/client";
import type { Mission } from "@/lib/api/types";
import {
  Target,
  Lightning,
  CheckCircle,
  X,
  Coins,
  CaretRight,
  Circle
} from "@phosphor-icons/react";
import { formatNumber } from "@/lib/format";

export function DailyMissionsWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-close widget when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Fetch missions
  useEffect(() => {
    if (!user || pathname === "/missions") return;

    let cancelled = false;
    setLoading(true);

    getMissions()
      .then((data) => {
        if (!cancelled) {
          setMissions(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load daily missions widget:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  // Hide widget if not logged in or on /missions page
  if (!user || pathname === "/missions") {
    return null;
  }

  const dailyMissions = (missions ?? []).filter((m) => m.period === "Daily");
  const completedDailyCount = dailyMissions.filter((m) => m.completed).length;
  const totalDailyCount = dailyMissions.length;
  const hasIncompleteDaily = dailyMissions.some((m) => !m.completed);

  return (
    <>
      {/* Edge Sticky Tab Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-[35%] z-[40] flex flex-col items-center gap-1.5 rounded-r-xl border border-l-0 border-pink-500/20 bg-zinc-950/80 p-2.5 text-zinc-300 shadow-[4px_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 hover:bg-pink-600 hover:text-white hover:translate-x-0.5 cursor-pointer focus-visible:outline-none select-none group/tab"
        title="View Daily Objectives"
        aria-label="Toggle Daily Objectives Panel"
      >
        <div className="relative">
          <Lightning size={18} weight="fill" className="text-pink-500 group-hover/tab:text-white transition-colors" />
          {hasIncompleteDaily && (
            <span className="absolute -right-1 -top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
            </span>
          )}
        </div>
        <span 
          className="text-[9px] font-black uppercase tracking-[0.2em] font-mono [writing-mode:vertical-lr] scale-95"
        >
          Daily
        </span>
      </button>

      {/* Backdrop Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[49] bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out Sidebar Panel */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-[50] w-80 max-w-[85vw] border-r border-zinc-800 bg-zinc-950/95 p-5 shadow-[25px_0_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-lg transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850/65 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Lightning size={18} weight="fill" className="text-pink-500" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 font-display">
              Daily Objectives
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close panel"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Progress Circle & Text */}
        {totalDailyCount > 0 && (
          <div className="mb-5 rounded-xl border border-zinc-850/60 bg-zinc-900/20 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Today's Progress</span>
              <span className="text-[10px] font-bold font-mono text-pink-400">
                {completedDailyCount}/{totalDailyCount} Completed
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-850/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(completedDailyCount / totalDailyCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[calc(100vh-14rem)] custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              <div className="mb-2 h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent mx-auto" />
              Loading objectives...
            </div>
          ) : dailyMissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              <Target size={24} className="mx-auto mb-2 text-zinc-600" />
              No active daily missions.
            </div>
          ) : (
            dailyMissions.map((m) => {
              const pct = m.target > 0 ? Math.min(100, (m.currentValue / m.target) * 100) : 0;
              return (
                <div
                  key={m.code}
                  className={`rounded-xl border p-3 transition-all ${
                    m.completed
                      ? "border-emerald-500/25 bg-emerald-500/5"
                      : "border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {m.completed ? (
                          <CheckCircle size={14} weight="fill" className="text-emerald-400 shrink-0" />
                        ) : (
                          <Circle size={14} className="text-zinc-650 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-zinc-100 truncate">{m.name}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono text-zinc-300 shrink-0">
                      <Coins size={10} className="text-amber-400" />
                      <span>+{formatNumber(m.rewardCredits)}</span>
                    </div>
                  </div>

                  {/* Tiny progress bar */}
                  {!m.completed && m.target > 1 && (
                    <div className="mt-2.5 space-y-1">
                      <div className="h-1 w-full rounded-full bg-zinc-950 border border-zinc-900 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-pink-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-550">
                        <span>Progress</span>
                        <span>{m.currentValue}/{m.target}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-850/65 bg-zinc-950/98 p-4">
          <Link
            href="/missions"
            className="flex items-center justify-between rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-pink-500 active:scale-98 transition-all shadow-md cursor-pointer select-none"
          >
            <span>View All Objectives</span>
            <CaretRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </>
  );
}

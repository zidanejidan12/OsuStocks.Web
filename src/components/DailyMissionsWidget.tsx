"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { getMissions } from "@/lib/api/client";
import type { Mission } from "@/lib/api/types";
import { X, CaretRight } from "@phosphor-icons/react";
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
      {/* Edge Sticky Tab Button - Slim, Minimalist, Financial Ledger Style */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-0 top-[35%] z-[40] flex items-center justify-between gap-2.5 rounded-r-md border border-l-0 border-zinc-800 bg-zinc-950/95 py-3.5 px-2 text-zinc-400 shadow-[2px_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:text-pink-500 hover:border-pink-500/30 hover:translate-x-0.5 cursor-pointer focus-visible:outline-none select-none"
        title="Open Objectives Tracker"
        aria-label="Toggle Objectives Panel"
      >
        <div className="flex flex-col items-center gap-2">
          {/* Pulsing state indicator dot */}
          <span className="relative flex h-1.5 w-1.5">
            {hasIncompleteDaily ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-500/60 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pink-500"></span>
              </>
            ) : (
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-700"></span>
            )}
          </span>
          <span 
            className="text-[9px] font-bold uppercase tracking-[0.25em] font-mono [writing-mode:vertical-lr] text-zinc-300 hover:text-pink-500 transition-colors"
          >
            DAILY
          </span>
          <span className="text-[8px] font-mono font-bold text-zinc-500">
            {completedDailyCount}/{totalDailyCount}
          </span>
        </div>
      </button>

      {/* Backdrop Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[49] bg-black/50 backdrop-blur-[1px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-out Sidebar Panel */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-[50] w-80 max-w-[85vw] border-r border-zinc-900 bg-zinc-955/98 p-6 shadow-[25px_0_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header - Precise Typography */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pink-500 font-mono">OBJECTIVES LOG</span>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-100 font-display">
              Daily Ledger
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-zinc-900 p-1 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 transition-all cursor-pointer"
            aria-label="Close panel"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Progress Counter & Slim Line */}
        {totalDailyCount > 0 && (
          <div className="mb-6 rounded-lg border border-zinc-900/60 bg-zinc-950/40 p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">COMPLETION STATUS</span>
              <span className="text-xs font-bold font-mono text-zinc-300">
                [ {completedDailyCount} / {totalDailyCount} ]
              </span>
            </div>
            {/* Minimalist ultra-thin progress bar */}
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-900">
              <div
                className="h-full bg-pink-500 transition-all duration-500"
                style={{ width: `${(completedDailyCount / totalDailyCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Area - Clean Rows instead of cards */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[calc(100vh-14rem)] custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              <div className="mb-3 h-3 w-3 animate-spin rounded-full border border-pink-500 border-t-transparent mx-auto" />
              RETRIEVING STATUS...
            </div>
          ) : dailyMissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-mono">
              NO ACTIVE OBJECTIVES
            </div>
          ) : (
            <div className="divide-y divide-zinc-900 border-t border-b border-zinc-900">
              {dailyMissions.map((m) => {
                const pct = m.target > 0 ? Math.min(100, (m.currentValue / m.target) * 100) : 0;
                return (
                  <div
                    key={m.code}
                    className="py-4 flex flex-col gap-2 transition-colors duration-150 hover:bg-zinc-900/20"
                  >
                    {/* Status checkbox / text */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2.5 min-w-0">
                        {/* Clean ledger checkbox bracket */}
                        <span className={`font-mono text-xs font-bold shrink-0 ${m.completed ? "text-emerald-500" : "text-zinc-650"}`}>
                          {m.completed ? "[✓]" : "[ ]"}
                        </span>
                        
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold ${m.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                            {m.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal font-sans">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      {/* Reward amount in a clean text block */}
                      <span className="font-mono text-[10px] font-bold text-zinc-400 shrink-0">
                        {formatNumber(m.rewardCredits)} CR
                      </span>
                    </div>

                    {/* Progress fraction bar */}
                    {!m.completed && m.target > 1 && (
                      <div className="pl-6 flex items-center gap-3">
                        <div className="h-0.5 flex-1 bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full bg-pink-500/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-zinc-500 shrink-0">
                          {m.currentValue}/{m.target}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Link - Sleek & Professional */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-900 bg-zinc-955 p-4">
          <Link
            href="/missions"
            className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-900 hover:text-white active:scale-98 transition-all font-mono cursor-pointer select-none"
          >
            <span>DEEP OBJECTIVES LOG</span>
            <CaretRight size={12} weight="bold" />
          </Link>
        </div>
      </div>
    </>
  );
}

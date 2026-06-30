"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, Sparkle, GameController } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

const SPONSOR = { id: 15640966, name: "Raids", tier: "Legendary Core Support", code: "RAIDS_CORE_01" };

const TEAM = [
  { 
    id: 3484548, 
    name: "Almond Eye", 
    role: "Backend Architect",
    mod: "Hidden"
  },
  { 
    id: 11421465, 
    name: "Verxina", 
    role: "Lead Frontend Engineer",
    mod: "DoubleTime"
  },
  { 
    id: 6560131, 
    name: "Nishino Flower", 
    role: "Business Operations",
    mod: "HardRock"
  },
];

const MEMBER_THEMES: Record<string, { border: string; bg: string; text: string; glow: string; banner: string }> = {
  "Almond Eye": {
    border: "border-zinc-200 dark:border-zinc-805 hover:border-purple-500/40 dark:hover:border-purple-500/30",
    bg: "bg-purple-950/5 dark:bg-purple-950/10",
    text: "text-purple-600 dark:text-purple-400",
    glow: "hover:shadow-[0_15px_30px_-10px_rgba(168,85,247,0.15)]",
    banner: "from-purple-500 to-indigo-500",
  },
  "Verxina": {
    border: "border-zinc-200 dark:border-zinc-805 hover:border-cyan-500/40 dark:hover:border-cyan-500/30",
    bg: "bg-cyan-950/5 dark:bg-cyan-950/10",
    text: "text-cyan-600 dark:text-cyan-400",
    glow: "hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.15)]",
    banner: "from-cyan-500 to-teal-500",
  },
  "Nishino Flower": {
    border: "border-zinc-200 dark:border-zinc-805 hover:border-rose-500/40 dark:hover:border-rose-500/30",
    bg: "bg-rose-955/5 dark:bg-rose-955/10",
    text: "text-rose-600 dark:text-rose-400",
    glow: "hover:shadow-[0_15px_30px_-10px_rgba(244,63,94,0.15)]",
    banner: "from-rose-500 to-orange-500",
  }
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden min-h-screen">
      <div className="absolute top-0 right-0 -z-10 h-[380px] w-[380px] rounded-full bg-pink-500/12 dark:bg-pink-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[380px] w-[380px] rounded-full bg-purple-500/12 dark:bg-purple-500/5 blur-[130px] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <PageShell>
      <div className="mb-14 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-300 to-pink-500 dark:from-pink-500 dark:via-zinc-100 dark:to-pink-400 animate-gradient-text pb-2 uppercase">
          Inside OsuStocks
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 max-w-[65ch]">
          OsuStocks is a virtual fan-made trading simulator connecting real-world performance points to a gamified fantasy market.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-pink-500/25 dark:border-pink-500/15 bg-gradient-to-br from-pink-50/40 via-zinc-50/90 to-zinc-100/30 dark:from-pink-955/10 dark:via-zinc-955/40 dark:to-zinc-900/30 p-6 sm:p-8 mb-14 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] group backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[110px] pointer-events-none group-hover:bg-pink-500/15 transition-colors duration-500" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.02)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={14} className="text-pink-400 animate-pulse" weight="fill" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pink-500 dark:text-pink-400">
                {SPONSOR.tier}
              </span>
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none uppercase">
              Championship Partner: <span className="text-pink-500">{SPONSOR.name}</span>
            </h2>
            <p className="mt-5 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-[55ch]">
              The operations and automated pricing engines of OsuStocks are funded entirely by our legendary core sponsor. Because of their backing, the platform remains 100% ad-free and free to play.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <a
                href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-pink-500/15 border border-pink-500/30 px-5 py-2.5 text-xs font-bold text-pink-600 dark:text-pink-300 transition-all duration-300 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
              >
                Visit Champion Profile
              </a>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-start md:justify-center">
            <div className="relative p-2 rounded-full border border-pink-500/30 bg-zinc-100/60 dark:bg-zinc-950/60 backdrop-blur-md">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 opacity-20 blur-[6px] animate-pulse" />
              <Avatar
                src={`https://a.ppy.sh/${SPONSOR.id}`}
                name={SPONSOR.name}
                size="xl"
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-zinc-50 dark:ring-zinc-950 relative z-10"
              />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-xs text-white font-bold border-2 border-zinc-50 dark:border-zinc-950 shadow-md z-20">
                ★
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-6 flex items-center gap-2">
          <GameController size={18} className="text-purple-500 dark:text-purple-400" />
          <h2 className="text-lg font-display font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-100">
            Development Team Profile Stats
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((member) => {
            const theme = MEMBER_THEMES[member.name] || MEMBER_THEMES["Almond Eye"];
            return (
              <a
                key={member.id}
                href={`https://osu.ppy.sh/users/${member.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between rounded-[24px] border ${theme.border} bg-zinc-100/40 dark:bg-zinc-955/25 p-5 transition-all duration-300 ${theme.glow} hover:bg-zinc-200/30 dark:hover:bg-zinc-900/20 hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${theme.banner}`} />
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-current opacity-[0.02] rounded-full blur-2xl pointer-events-none group-hover:opacity-[0.04] transition-opacity" />
                <div>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={`https://a.ppy.sh/${member.id}`}
                      name={member.name}
                      size="md"
                      className="ring-2 ring-zinc-300/60 dark:ring-zinc-800 transition-all duration-300 group-hover:ring-purple-500/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-base font-display font-black text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-pink-500 dark:group-hover:text-purple-300">
                        {member.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold truncate uppercase tracking-wider font-mono">
                          {member.role}
                        </span>
                        <span className="text-zinc-350 dark:text-zinc-700 font-mono text-[9px]">•</span>
                        <span className={`font-black tracking-wide px-1.5 py-0.5 rounded text-[8px] uppercase bg-zinc-900/5 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/50 ${theme.text}`}>
                          {member.mod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-right">
                  <span className="text-[9px] font-mono text-pink-500 dark:text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Beatmap Profile &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <div className="mt-16 text-center">
        <Link
          href={user ? "/" : "/login"}
          className="relative inline-flex items-center gap-2.5 px-8 py-4 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 font-display text-base font-black uppercase tracking-wider text-white shadow-[0_15px_30px_-5px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_35px_-5px_rgba(6,182,212,0.45)] transition-all duration-300 hover:-translate-y-0.5 group/cta"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/cta:animate-[shimmer_1.5s_infinite]" />
          {user ? "Go to Trading Floor" : "Sign In & Start Trading"}
          <ArrowRight size={18} weight="bold" />
        </Link>
      </div>
    </PageShell>
  );
}

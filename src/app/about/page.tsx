"use client";

import { Avatar } from "@/components/ui/Avatar";
import { AmbientCyberBg } from "@/components/ui/AmbientCyberBg";
import { ArrowRight, Sparkle, GameController } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

const SPONSOR = { id: 15640966, name: "Raids", tier: "Legendary Core Support", code: "RAIDS_CORE_01" };

const TEAM = [
  { 
    id: 3484548, 
    name: "Almond Eye", 
    role: "Frontend & Game Mechanics",
    stats: { apm: "350+", polish: "S-Tier", mod: "Hidden" }
  },
  { 
    id: 11421465, 
    name: "Verxina", 
    role: "Backend Architect & APIs",
    stats: { response: "4ms", uptime: "99.9%", mod: "DoubleTime" }
  },
  { 
    id: 6560131, 
    name: "Nishino Flower", 
    role: "DevOps & Infrastructure",
    stats: { bandwidth: "10Gbps", safety: "100%", mod: "HardRock" }
  },
];

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="relative w-full overflow-hidden min-h-screen pb-20">
      <AmbientCyberBg />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 sm:py-16">
        
        <div className="mb-14 text-center sm:text-left">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.35)]">
            SYSTEM SPECIFICATION
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-display font-black tracking-tight text-white uppercase">
            Inside <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)] font-display">OsuStocks</span>
          </h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-[65ch]">
            OsuStocks is a virtual fan-made trading simulator connecting real-world performance points to a gamified fantasy market.
          </p>
        </div>

        <section className="relative overflow-hidden rounded-[28px] border border-pink-500/20 bg-gradient-to-br from-pink-900/[0.1] via-zinc-950/80 to-zinc-900/40 p-6 sm:p-8 mb-14 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[110px] pointer-events-none group-hover:bg-pink-500/15 transition-colors duration-500" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,72,153,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(236,72,153,0.02)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={14} className="text-pink-400 animate-pulse" weight="fill" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pink-400">
                  {SPONSOR.tier}
                </span>
              </div>
              <h2 className="text-3xl font-display font-black tracking-tight text-white leading-none uppercase">
                Championship Partner: <span className="text-pink-500">{SPONSOR.name}</span>
              </h2>
              <p className="mt-5 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-[55ch]">
                The operations and automated pricing engines of OsuStocks are funded entirely by our legendary core sponsor. Because of their backing, the platform remains 100% ad-free and free to play.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <a
                  href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-pink-500/15 border border-pink-500/30 px-5 py-2.5 text-xs font-bold text-pink-300 transition-all duration-300 hover:bg-pink-500 hover:text-white hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                >
                  Visit Champion Profile
                  <span className="text-[9px]">&#8599;</span>
                </a>
                <span className="text-[10px] font-mono font-bold text-zinc-500 border border-zinc-800/80 rounded px-2 py-1 bg-zinc-950/40">
                  VERIFIED IDENTIFIER: {SPONSOR.code}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-start md:justify-center">
              <div className="relative p-2 rounded-full border border-pink-500/30 bg-zinc-950/60 backdrop-blur-md">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 opacity-20 blur-[6px] animate-pulse" />
                <Avatar
                  src={`https://a.ppy.sh/${SPONSOR.id}`}
                  name={SPONSOR.name}
                  size="xl"
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-zinc-950 relative z-10"
                />
                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-xs text-white font-bold border-2 border-zinc-950 shadow-md z-20">
                  ★
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6 flex items-center gap-2">
            <GameController size={18} className="text-purple-400" />
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-zinc-100">
              Development Team Profile Stats
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((member) => (
              <a
                key={member.id}
                href={`https://osu.ppy.sh/users/${member.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between rounded-[24px] border border-zinc-800/80 bg-zinc-900/10 p-5 transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/20 hover:scale-[1.02] shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-4 border-b border-zinc-900/60 pb-4 mb-4">
                    <Avatar
                      src={`https://a.ppy.sh/${member.id}`}
                      name={member.name}
                      size="md"
                      className="ring-2 ring-zinc-800 transition-all duration-300 group-hover:ring-purple-500/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-base font-display font-black text-zinc-100 transition-colors group-hover:text-purple-300">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 font-medium truncate uppercase tracking-wider font-mono">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-[10px] text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span className="text-zinc-500">SPEED STAT:</span>
                      <span className="text-zinc-200 font-bold">{member.stats.apm || member.stats.response}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/40 pb-1">
                      <span className="text-zinc-500">ACCURACY:</span>
                      <span className="text-zinc-200 font-bold">{member.stats.polish || member.stats.uptime}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-zinc-500">FAV MODIFIER:</span>
                      <span className="text-pink-400 font-black tracking-wide">{member.stats.mod}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-right">
                  <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Beatmap Profile &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <Link
            href={user ? "/" : "/login"}
            className="relative inline-flex items-center gap-2.5 px-8 py-4 overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 font-display text-base font-black uppercase tracking-wider text-white shadow-[0_0_25px_rgba(236,72,153,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] group/cta"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/cta:animate-[shimmer_1.5s_infinite]" />
            {user ? "Go to Trading Floor" : "Sign In & Start Trading"}
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>

      </div>
    </div>
  );
}

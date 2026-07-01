"use client";

import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

const SPONSOR = { id: 15640966, name: "Raids", tier: "CHAMPIONSHIP SPONSOR", code: "RAIDS_CORE_01" };

const TEAM = [
  { 
    id: 3484548, 
    name: "Almond Eye", 
    role: "Backend Developer"
  },
  { 
    id: 11421465, 
    name: "Verxina", 
    role: "Frontend Developer"
  },
  { 
    id: 6560131, 
    name: "BUM", 
    role: "Business Operations"
  },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen">
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
        <h1 className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-50 pb-2 uppercase">
          About OsuStocks
        </h1>
        <p className="mt-3 text-sm text-zinc-650 dark:text-zinc-400 max-w-[65ch] font-medium leading-relaxed">
          OsuStocks is a fan-made fantasy market simulator where users trade virtual shares of osu! players based on live game performance and historical statistics.
        </p>
      </div>

      <section className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/30 dark:bg-zinc-955/15 p-6 sm:p-8 mb-14 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkle size={14} className="text-pink-500" weight="fill" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-pink-600 dark:text-pink-400">
                {SPONSOR.tier}
              </span>
            </div>
            <h2 className="text-2xl font-mono font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none uppercase">
              Platform Partner: <span className="text-pink-500">{SPONSOR.name}</span>
            </h2>
            <p className="mt-5 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-[55ch]">
              All automated pricing algorithms and server operations of OsuStocks are funded entirely by our core support sponsor. Because of their backing, the platform remains completely ad-free and free-to-play.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <a
                href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-xs font-bold text-white dark:text-zinc-950 transition-all duration-200 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-900 dark:border-zinc-100"
              >
                Visit Champion Profile
              </a>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-start md:justify-center">
            <div className="relative p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/60 backdrop-blur-md">
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
          <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-100">
            Development Team
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TEAM.map((member) => {
            return (
              <a
                key={member.id}
                href={`https://osu.ppy.sh/users/${member.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/30 dark:bg-zinc-955/15 p-5 transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-200/20 dark:hover:bg-zinc-900/10"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={`https://a.ppy.sh/${member.id}`}
                      name={member.name}
                      size="md"
                      className="ring-2 ring-zinc-300/60 dark:ring-zinc-800 transition-all duration-300 group-hover:ring-pink-500/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-pink-500">
                        {member.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold truncate uppercase tracking-wider font-mono">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-right">
                  <span className="text-[9px] font-mono text-pink-500 dark:text-pink-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Profile &rarr;
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
          className="relative inline-flex items-center gap-2.5 px-8 py-4 overflow-hidden rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-mono text-sm font-bold uppercase tracking-wider text-white dark:text-zinc-950 transition-all duration-200 border border-zinc-900 dark:border-zinc-100"
        >
          {user ? "Go to Trading Floor" : "Sign In & Start Trading"}
          <ArrowRight size={18} weight="bold" />
        </Link>
      </div>
    </PageShell>
  );
}

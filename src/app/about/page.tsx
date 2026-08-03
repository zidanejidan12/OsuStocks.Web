"use client";

import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";

const SPONSOR = { id: 15640966, name: "Raids" };

const TEAM = [
  {
    id: 3484548,
    name: "Almond Eye",
    role: "Backend",
    accent: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  },
  {
    id: 11421465,
    name: "Verxina",
    role: "Frontend",
    accent: "text-cyan-400 border-cyan-500/25 bg-cyan-500/10",
  },
  {
    id: 21866720,
    name: "JeiiiTzy",
    role: "Frontend",
    accent: "text-cyan-400 border-cyan-500/25 bg-cyan-500/10",
  },
  {
    id: 6560131,
    name: "Nishino Flower",
    role: "Backend",
    accent: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  },
];

export default function AboutPage() {
  const { user } = useAuth();

  return (
    <div className="relative w-full overflow-hidden">
      {/* A single soft wash — not a light show. */}
      <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-pink-500/10 blur-[130px]" />

      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          About
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          <span className="text-pink-500">Osu</span>Stocks
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
          A fan-made osu! stock market where you trade shares in osu! players and
          build a portfolio. Prices move with real pp and rank changes, and with
          how people trade.
        </p>

        <section className="mt-12 space-y-4 text-sm leading-relaxed text-zinc-300">
          <p>
            Every tracked player has a stock whose price rises and falls with
            their performance. Set a new top play or climb the rankings and the
            price reacts. Your own buys and sells nudge it along a bonding curve,
            with a per-trade cap to keep things fair.
          </p>
          <p className="text-zinc-500">
            OsuStocks is a game. All coins, prices, and holdings are virtual. They
            have no real-world value and cannot be exchanged for money. Not
            affiliated with osu! or ppy Pty Ltd.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Sponsor
          </h2>
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
            <Avatar
              src={`https://a.ppy.sh/${SPONSOR.id}`}
              name={SPONSOR.name}
              size="lg"
              className="ring-1 ring-zinc-800"
            />
            <div className="min-w-0">
              <p className="text-base font-semibold text-zinc-100">
                Sponsored by {SPONSOR.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {SPONSOR.name} helps keep OsuStocks running and free to play.
              </p>
              <a
                href={`https://osu.ppy.sh/users/${SPONSOR.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-pink-400 transition-colors hover:text-pink-300"
              >
                osu! profile
                <ArrowUpRight size={12} weight="bold" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Team
          </h2>
          <p className="mt-2 text-sm text-zinc-500">Built by a few osu! players.</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <li key={member.id}>
                <a
                  href={`https://osu.ppy.sh/users/${member.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-colors hover:border-pink-500/30 hover:bg-zinc-900/70"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={`https://a.ppy.sh/${member.id}`}
                      name={member.name}
                      size="md"
                      className="ring-1 ring-zinc-800 transition-all group-hover:ring-pink-500/40"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-pink-300">
                        {member.name}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${member.accent}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-[11px] text-zinc-500 transition-colors group-hover:text-zinc-400">
                    osu! profile
                    <ArrowUpRight size={11} weight="bold" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14">
          <Link
            href={user ? "/" : "/login"}
            className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
          >
            {user ? "Go to the market" : "Sign in to start trading"}
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}

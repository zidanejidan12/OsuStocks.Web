import type { Metadata } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { SponsorCard } from "@/components/SponsorCredit";

export const metadata: Metadata = {
  title: "About the osu! stock market game",
  description:
    "What is OsuStocks? A fan-made osu! stock market where you trade osu! players like stocks. Prices move with pp, rank, and trading. Learn how it works.",
  keywords: [
    "osu stocks",
    "osu stock market",
    "what is osustocks",
    "osu trading game",
    "osu fantasy",
  ],
  alternates: { canonical: "/about" },
};

// Development-team credit, linking to each member's osu! profile; avatars come
// from osu!'s CDN. Moved here off the sitewide footer to keep that uncluttered.
const TEAM = [
  { id: 3484548, name: "Almond Eye" },
  { id: 11421465, name: "Verxina" },
  { id: 6560131, name: "Nishino Flower" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        OsuStocks
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-4xl">
        About
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        A fan-made osu! stock-market game, and the people building it.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          What is OsuStocks?
        </h2>
        <div className="mt-3 space-y-4 text-sm leading-relaxed text-zinc-300">
          <p>
            OsuStocks turns the osu! leaderboard into a stock market. Every
            tracked player has a &ldquo;stock&rdquo; whose price rises and falls
            with their performance. As they set new top plays and climb
            the rankings, their price moves. Browse the market, buy shares in the
            players you believe in, and grow a portfolio.
          </p>
          <p>
            Prices react to two things:{" "}
            <strong className="font-medium text-zinc-100">
              real osu! performance
            </strong>{" "}
            (pp and rank changes synced from the osu! API) and{" "}
            <strong className="font-medium text-zinc-100">trading</strong>{" "}
            (your own buys and sells nudge a price along a bonding curve,
            with a per-trade cap to keep the market fair).
          </p>
          <p className="text-zinc-500">
            OsuStocks is a game. All coins, prices, and holdings are virtual.
            They have no real-world value and can never be exchanged for
            money. Not affiliated with osu! or ppy Pty Ltd.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Sponsor
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          OsuStocks is proudly sponsored by Raids.
        </p>
        <div className="mt-5 sm:max-w-sm">
          <SponsorCard />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
          Development Team
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Built by a small team of osu! players.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          OsuStocks was conceived, designed, and directed entirely by its
          developers. AI coding tools only helped speed up routine, repetitive
          work; the concept, the content, and every creative decision are ours.
        </p>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEAM.map((member) => (
            <li key={member.id}>
              <a
                href={`https://osu.ppy.sh/users/${member.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 transition-colors hover:border-pink-500/40 hover:bg-zinc-900/70"
              >
                <Avatar
                  src={`https://a.ppy.sh/${member.id}`}
                  name={member.name}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-pink-200">
                    {member.name}
                  </div>
                  <div className="text-xs text-zinc-500">osu! profile &#8599;</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

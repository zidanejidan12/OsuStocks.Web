import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

// Cosmetic credit — links to each member's osu! profile; avatars come from osu!'s CDN.
const TEAM = [
  { id: 3484548, name: "Almond Eye" },
  { id: 11421465, name: "Verxina" },
  { id: 6560131, name: "Nishino Flower" },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-16 border-t border-white/5 bg-zinc-950/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="text-sm font-semibold tracking-tight">
            <span className="text-pink-400">Osu</span>Stocks
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            A fan-made game. All coins, prices, and holdings are virtual — they
            have no real-world value and can never be exchanged for money. Not
            affiliated with osu! or ppy Pty Ltd.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">
            Development Team
          </span>
          <ul className="flex flex-col gap-2.5">
            {TEAM.map((member) => (
              <li key={member.id}>
                <a
                  href={`https://osu.ppy.sh/users/${member.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-zinc-400 transition-colors hover:text-pink-300"
                >
                  <Avatar
                    src={`https://a.ppy.sh/${member.id}`}
                    name={member.name}
                    size="sm"
                  />
                  <span>{member.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="flex flex-col gap-2.5 text-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">
            Legal
          </span>
          <Link
            href="/terms"
            className="text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            className="text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Privacy Policy
          </Link>
          <a
            href={API_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-zinc-100"
          >
            API source
          </a>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-zinc-600">
          OsuStocks &middot; virtual entertainment only &mdash; no real money, no
          payouts, not gambling.
        </div>
      </div>
    </footer>
  );
}

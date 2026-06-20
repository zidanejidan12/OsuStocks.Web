import Link from "next/link";
import { SponsorCredit } from "@/components/SponsorCredit";

const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

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

        <nav aria-label="Game" className="flex flex-col gap-2.5 text-sm">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600">
            Game
          </span>
          <Link
            href="/about"
            className="text-zinc-400 transition-colors hover:text-zinc-100"
          >
            About
          </Link>
          <Link
            href="/patch-notes"
            className="text-zinc-400 transition-colors hover:text-zinc-100"
          >
            Patch Notes
          </Link>
        </nav>

        <nav aria-label="Legal" className="flex flex-col gap-2.5 text-sm">
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            OsuStocks &middot; virtual entertainment only &mdash; no real money,
            no payouts, not gambling.
          </p>
          <SponsorCredit className="text-xs text-zinc-600" />
        </div>
      </div>
    </footer>
  );
}

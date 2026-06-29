import Link from "next/link";
import { SponsorCredit } from "@/components/SponsorCredit";

const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

export function Footer() {
  return (
    <footer className="relative z-10 mt-28 border-t border-zinc-900/60 bg-zinc-950/15 backdrop-blur-xl">
      {/* Top glowing ambient line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <div className="text-lg font-black tracking-tight text-white transition-transform duration-300 hover:scale-102">
            <span className="text-pink-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">Osu</span>Stocks
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500 font-medium">
            A fan-made virtual simulation game. All coins, prices, and holdings are completely virtual — they
            have no real-world value and can never be exchanged for money. Not
            affiliated with osu! or ppy Pty Ltd.
          </p>
        </div>

        <nav aria-label="Game" className="flex flex-col gap-3 text-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Game
          </span>
          <Link
            href="/about"
            className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1"
          >
            About
          </Link>
          <Link
            href="/patch-notes"
            className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1"
          >
            Patch Notes
          </Link>
        </nav>

        <nav aria-label="Legal" className="flex flex-col gap-3 text-sm">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Legal
          </span>
          <Link
            href="/terms"
            className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1"
          >
            Terms of Use
          </Link>
          <Link
            href="/privacy"
            className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1"
          >
            Privacy Policy
          </Link>
          <a
            href={API_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1"
          >
            API source
          </a>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium">
            OsuStocks &middot; virtual entertainment only &mdash; no real money,
            no payouts, not gambling.
          </p>
          <SponsorCredit className="text-xs text-zinc-500 font-semibold" />
        </div>
      </div>
    </footer>
  );
}

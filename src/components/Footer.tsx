"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SponsorCredit } from "@/components/SponsorCredit";
import { DiscordLogo, ShieldCheck, GameController, ChatTeardropText, PlugsConnected, ArrowUp } from "@phosphor-icons/react";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative z-10 mt-32 border-t border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500/30 to-transparent shadow-[0_-2px_10px_rgba(236,72,153,0.15)]" />
      
      <div className="mx-auto max-w-7xl px-8 py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-4 sm:grid-cols-2 lg:gap-16">
          
          <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-2">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-50 transition-all duration-300 hover:scale-102">
              <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">Osu</span>Stocks
            </div>
            <p className="text-sm lg:text-base leading-relaxed text-zinc-450 font-medium">
              The premier fantasy stock market simulation game for the osu! community. Predict performances, manage simulated portfolios, and compete with traders worldwide.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Server Synced & Live 24/7
              </span>
            </div>
          </div>

          <nav aria-label="Quick Navigation Links" className="flex flex-col gap-4 text-sm lg:text-base sm:col-span-1 lg:col-span-1">
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-500 mb-1">
              <GameController size={14} className="text-pink-500" />
              Navigation
            </span>
            <Link
              href="/"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Market Center
            </Link>
            <Link
              href="/trending"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Trending Players
            </Link>
            <Link
              href="/leaderboard"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Trader Rankings
            </Link>
            <Link
              href="/about"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              About Platform
            </Link>
          </nav>

          <nav aria-label="Support Resources" className="flex flex-col gap-4 text-sm lg:text-base sm:col-span-1 lg:col-span-1">
            <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-zinc-500 mb-1">
              <ShieldCheck size={14} className="text-cyan-400" />
              Legal & Support
            </span>
            <Link
              href="/terms"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Privacy Policy
            </Link>
            <Link
              href="/#faq"
              className="text-zinc-400 transition-all duration-200 hover:text-pink-400 hover:translate-x-1.5 font-medium"
            >
              Platform FAQ
            </Link>
            <span className="text-[11px] lg:text-xs text-zinc-600 font-medium leading-relaxed block">
              OsuStocks is a fantasy simulation game and has no real-world monetary affiliation.
            </span>
          </nav>
        </div>

        <div className="mt-16 pt-10 border-t border-zinc-900/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs lg:text-sm text-zinc-500 font-medium leading-relaxed">
              &copy; {new Date().getFullYear()} OsuStocks &bull; Fantasy Virtual Gaming System. All holdings are completely virtual.
            </p>
            <p className="text-[11px] lg:text-xs text-zinc-600 font-medium mt-1">
              This platform is not official, fan-made, and is not associated with osu! or ppy Pty Ltd.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-zinc-950/60 border border-zinc-900 px-5 py-3 hover:border-pink-500/25 transition-all duration-350 shadow-md">
              <SponsorCredit className="text-xs font-bold text-zinc-350" />
            </div>
            
            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 transition-all duration-300 hover:border-pink-500/40 hover:text-pink-400 hover:-translate-y-1 shadow-md"
            >
              <ArrowUp size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

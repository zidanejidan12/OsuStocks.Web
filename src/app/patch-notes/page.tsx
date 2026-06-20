import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalSection } from "@/components/legal/LegalSection";

export const metadata: Metadata = {
  title: "Patch Notes",
  description:
    "What's new in OsuStocks — market updates, trading changes, and new features.",
};

// Same typography as LegalSection, but the leading emoji in the heading is
// wrapped in an aria-hidden span so screen readers don't announce emoji names
// (e.g. "globe showing Europe-Africa") before the real title text.
function PatchSection({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
        <span aria-hidden="true">{emoji}</span> {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-400 [&_a:hover]:text-pink-300 [&_a]:text-pink-400 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export default function PatchNotesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        Updates
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-4xl">
        Patch Notes
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        What&rsquo;s changing in the market, and why.
      </p>

      {/* ── June 20, 2026 ───────────────────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
            June 20, 2026
          </h2>
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-pink-400">
            Latest
          </span>
        </div>

        <div className="mt-8 space-y-9">
          <PatchSection emoji="🌍" title="The market is 5,000 players bigger">
            <p>
              OsuStocks now tracks the <strong>top 5,000 osu! players</strong>{" "}
              by performance. That&rsquo;s thousands of new stocks to discover and
              trade &mdash; from the very top of the ladder down to rising names.
              New players opening for the first time are priced by their global
              rank, so stronger players list higher.
            </p>
          </PatchSection>

          <PatchSection emoji="⚖️" title="Fairer trading — your orders now move the price">
            <p>
              We&rsquo;ve changed how buying and selling affects a stock&rsquo;s
              price, to keep the market fair and stop price manipulation:
            </p>
            <ul>
              <li>
                <strong>Your trade moves the price as it fills.</strong> Big buys
                nudge a price up; big sells nudge it down &mdash; and you trade at
                the <strong>average price across that move</strong> (a little
                &ldquo;slippage&rdquo;), not the old price. So a large order costs a
                bit more to buy, and returns a bit less to sell.
              </li>
              <li>
                <strong>A ±10% cap per trade.</strong> No single order can move a
                stock more than 10% in one go, so nobody can crash or moon a stock
                with one giant trade.
              </li>
              <li>
                <strong>No more pump-and-dump.</strong> You can no longer buy a
                stock to pump its price and instantly sell into your own pump for
                free profit &mdash; a quick round trip now nets a small loss, just
                like a real market spread. Prices reflect genuine demand and player
                performance.
              </li>
            </ul>
            <p>
              <strong>Tip:</strong> more popular, widely-held stocks move less per
              trade, and splitting a very large order gets you a better average
              price.
            </p>
          </PatchSection>

          <PatchSection emoji="🌊" title="Liquidity matters now">
            <p>
              Stocks now have <strong>liquidity</strong> — a measure of how heavily
              a player is held and traded. It changes how trades behave:
            </p>
            <ul>
              <li>
                <strong>Deep, popular stocks barely move</strong> when you trade
                them and have tighter spreads — they can absorb big orders.
              </li>
              <li>
                <strong>Thin, obscure stocks swing hard</strong> and cost more to
                trade in and out of. High risk, high reward.
              </li>
            </ul>
            <p>
              You&rsquo;ll see a liquidity indicator (Thin / Moderate / Deep) on
              each stock&rsquo;s page so you know what you&rsquo;re getting into.
            </p>
          </PatchSection>

          <PatchSection emoji="💸" title="A small service fee on trades">
            <p>
              To keep the economy healthy and prices meaningful, trades now carry a
              small <strong>service fee</strong> (think of it like a transaction
              tax). It&rsquo;s <strong>progressive</strong>: small trades pay a
              very low rate, and only the larger portions of big trades pay more.
            </p>
            <ul>
              <li>Charged on both buys and sells, shown before you confirm.</li>
              <li>
                Tiered so casual trading stays cheap while whales contribute more
                &mdash; the fee is removed from circulation to fight inflation, not
                paid to anyone.
              </li>
            </ul>
          </PatchSection>

          <PatchSection emoji="✨" title="Also live">
            <ul>
              <li>
                <strong>Sign in with osu!</strong> &mdash; log in with your osu!
                account to start trading.
              </li>
              <li>
                <strong>Investor Levels</strong> &mdash; earn XP as you trade and
                climb an osu!-style level curve.
              </li>
              <li>
                <strong>Achievements &amp; Missions</strong> &mdash; one-time
                milestones and daily/weekly goals that reward you with credits.
              </li>
            </ul>
          </PatchSection>

          <LegalSection title="A reminder">
            <p>
              OsuStocks is a game &mdash; all coins, prices, and holdings are
              virtual and have no real-world value. Prices, balances, and rules can
              change as we keep tuning the market. Have fun, and trade smart.
            </p>
          </LegalSection>
        </div>
      </div>
    </div>
  );
}

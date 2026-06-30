import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/LegalSection";
import { CONTACT_EMAIL, GOVERNING_LAW } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "OsuStocks is a free, fan-made game. All currency and holdings are virtual — no real money, no payouts.",
};

const LAST_UPDATED = "June 7, 2026";
const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen w-full py-16 px-4 select-none">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-3xl relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-zinc-500 hover:text-pink-400 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Login
          </Link>
        </div>

        {/* Page Header */}
        <div className="border-b border-zinc-900 pb-8 mb-10">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.35)]">
            Legal Agreement
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight font-display text-zinc-50">
            Terms of <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">Use</span>
          </h1>
          <p className="mt-2.5 text-xs text-zinc-500 font-mono uppercase tracking-wider">
            Last updated: <span className="text-zinc-400 font-bold">{LAST_UPDATED}</span>
          </p>
        </div>

        {/* Main Document Content wrapped in Glassmorphism Card */}
        <div className="glass backdrop-blur-3xl bg-zinc-950/40 border border-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-10">
          
          {/* Important Highlight Disclaimer */}
          <div className="rounded-2xl border border-pink-500/20 bg-pink-950/10 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/25 shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
                <strong className="font-extrabold text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                  OsuStocks is a game.
                </strong>{" "}
                The coins, prices, shares, and portfolio values are entirely virtual
                and have <strong className="text-zinc-150 font-bold">no real-world monetary
                value</strong>. You cannot buy, sell, deposit, withdraw, or redeem
                them for money or anything of value. OsuStocks is not investing,
                trading, financial advice, or gambling - it is entertainment.
              </p>
            </div>
          </div>

          {/* Legal Sections */}
          <div className="space-y-6">
            <LegalSection title="1. Acceptance of these terms">
              <p>
                By accessing or using OsuStocks (the &ldquo;Service&rdquo;), you agree
                to these Terms of Use and our{" "}
                <a href="/privacy" className="font-bold text-pink-400 hover:text-pink-300">Privacy Policy</a>. If you do not agree, please do
                not use the Service.
              </p>
            </LegalSection>

            <LegalSection title="2. What OsuStocks is">
              <p>
                OsuStocks is a free, fan-made browser game that simulates a stock
                market using the public performance statistics of osu! players. You
                use a virtual balance to &ldquo;buy&rdquo; and &ldquo;sell&rdquo;
                virtual shares and track a virtual portfolio. It exists purely for fun
                and entertainment.
              </p>
            </LegalSection>

            <LegalSection title="3. No real money and no financial product">
              <p>
                Every in-game item - coins, balances, prices, shares, holdings,
                and profit or loss - is virtual and fictional. These items have
                no monetary or real-world value and cannot be purchased, cashed out,
                transferred, traded for goods or services, or redeemed for anything.
              </p>
              <p className="mt-2">
                OsuStocks does not process real payments and is{" "}
                <strong>
                  not a financial product, broker, exchange, investment service, or
                  gambling service
                </strong>
                . Nothing in the Service is financial advice. Prices are generated by
                the game and do not represent any real market or asset.
              </p>
            </LegalSection>

            <LegalSection title="4. Not affiliated with osu!">
              <p>
                OsuStocks is an independent fan project. It is{" "}
                <strong>
                  not created, endorsed, sponsored by, or affiliated with osu!, ppy
                  Pty Ltd, or any player
                </strong>{" "}
                featured in the game. &ldquo;osu!&rdquo; and related names and logos
                are the property of their respective owners. Player names and
                statistics are used only to power the game&rsquo;s simulation.
              </p>
            </LegalSection>

            <LegalSection title="5. Your osu! account">
              <p>
                You sign in using osu!&rsquo;s OAuth. You are responsible for activity
                under your account and for keeping your access token private. Do not
                share your token, attempt to access other people&rsquo;s accounts, or
                impersonate others.
              </p>
            </LegalSection>

            <LegalSection title="6. Acceptable use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>use bots, scripts, or automation to play or query the Service;</li>
                <li>
                  exploit bugs, or attempt to manipulate balances, prices, or the
                  simulated market unfairly;
                </li>
                <li>
                  access or interfere with accounts or data that are not your own;
                </li>
                <li>
                  disrupt, overload, or attack the Service or its underlying API;
                </li>
                <li>use the Service for any unlawful purpose.</li>
              </ul>
            </LegalSection>

            <LegalSection title="7. Virtual balances may change or reset">
              <p>
                Because nothing in the game has real value, we may add, change,
                remove, recalculate, or reset any virtual balances, prices, players,
                or game rules at any time, and may suspend or discontinue the Service,
                without notice and without liability to you.
              </p>
            </LegalSection>

            <LegalSection title="8. Provided &ldquo;as is&rdquo;">
              <p>
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as
                available,&rdquo; without warranties of any kind, express or implied.
                We do not guarantee that it will be accurate, uninterrupted, secure,
                or error-free.
              </p>
            </LegalSection>

            <LegalSection title="9. Limitation of liability">
              <p>
                To the maximum extent permitted by law, the operators of OsuStocks
                will not be liable for any indirect, incidental, or consequential
                damages arising from your use of, or inability to use, the Service.
                Because the Service involves no real money or value, you acknowledge
                there is no monetary loss associated with any virtual item.
              </p>
            </LegalSection>

            <LegalSection title="10. Changes to these terms">
              <p>
                We may update these Terms from time to time. Material changes will be
                reflected by the &ldquo;Last updated&rdquo; date above. Your continued
                use of the Service after changes take effect means you accept the
                updated Terms.
              </p>
            </LegalSection>

            {GOVERNING_LAW && (
              <LegalSection title="11. Governing law">
                <p>
                  These Terms are governed by the laws of {GOVERNING_LAW}, without
                  regard to its conflict-of-law rules. Because the Service involves no
                  real money or value, this clause concerns only the use of the game
                  itself.
                </p>
              </LegalSection>
            )}

            <LegalSection title={GOVERNING_LAW ? "12. Contact" : "11. Contact"}>
              <p>
                Questions about these Terms? Reach out through the project&rsquo;s
                repository:{" "}
                <a href={API_REPO} target="_blank" rel="noopener noreferrer" className="font-semibold text-pink-400 hover:text-pink-300">
                  github.com/zidanejidan12/OsuStocks.API
                </a>
                .
              </p>
              {CONTACT_EMAIL && (
                <p className="mt-2">
                  You can also email us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-pink-400 hover:text-pink-300">{CONTACT_EMAIL}</a>.
                </p>
              )}
            </LegalSection>
          </div>

        </div>
      </div>
    </div>
  );
}

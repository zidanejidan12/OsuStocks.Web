import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection } from "@/components/legal/LegalSection";
import { CONTACT_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What OsuStocks does with your data. A fan-made game with no payments and no third-party tracking.",
};

const LAST_UPDATED = "June 21, 2026";
const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

export default function PrivacyPage() {
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
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-pink-500/80">
            Legal Agreement
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight font-display text-zinc-50 dark:text-zinc-100">
            Privacy Policy
          </h1>
          <p className="mt-2.5 text-xs text-zinc-500 font-medium">
            Last updated: <span className="text-zinc-400">{LAST_UPDATED}</span>
          </p>
        </div>

        {/* Main Document Content wrapped in Glassmorphism Card */}
        <div className="glass backdrop-blur-3xl bg-zinc-950/40 border border-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl space-y-9">
          
          <p className="max-w-[65ch] text-xs sm:text-sm leading-relaxed text-zinc-400">
            This Privacy Policy explains what information OsuStocks (the
            &ldquo;Service&rdquo;) handles and why. OsuStocks is a free, fan-made
            game; it involves no payments, and we keep data to the minimum needed to
            run the game.
          </p>

          {/* Legal Sections */}
          <div className="space-y-6">
            <LegalSection title="1. Information we handle">
              <p>
                <strong>osu! account info (via OAuth).</strong> When you sign in, osu!
                shares a limited set of details so we can identify your account &mdash;
                your osu! user ID and username (and your role within the game). We do
                not receive your osu! password.
              </p>
              <p className="mt-2">
                <strong>Game data.</strong> As you play, the Service stores fictional
                game data tied to your account: your virtual wallet balance, your
                holdings and portfolio, and your virtual trade history. This is game
                data, not financial records.
              </p>
              <p className="mt-2">
                <strong>Stored in your browser.</strong> To keep you signed in, we
                store a session access token (a JWT) and its expiry in your
                browser&rsquo;s <code>localStorage</code>. This stays on your device.
              </p>
            </LegalSection>

            <LegalSection title="2. How we use information">
              <ul className="list-disc pl-5 space-y-1">
                <li>to sign you in and keep your session active;</li>
                <li>
                  to run the game &mdash; show the market, your portfolio and wallet,
                  and process virtual trades;
                </li>
                <li>
                  to operate and protect the Service, such as rate limiting and
                  preventing abuse.
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="3. What we do not do">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  We do not collect or process real payment or financial information
                  &mdash; there are none.
                </li>
                <li>We do not sell or rent your information.</li>
                <li>
                  We do not use advertising, ad networks, or cross-site tracking. Any
                  product analytics is optional and privacy-respecting (see
                  &ldquo;Analytics&rdquo; below).
                </li>
              </ul>
            </LegalSection>

            <LegalSection title="Analytics (optional)">
              <p>
                The deploying operator may enable <strong>PostHog</strong>, a
                product-analytics provider, to collect privacy-respecting usage events
                &mdash; such as page views and which features are used &mdash; to
                understand and improve the game. Analytics is{" "}
                <strong>off unless the operator configures it</strong>, is never used
                for advertising, and when enabled, PostHog processes this data on the
                operator&rsquo;s behalf. When analytics is disabled, the app loads no
                analytics code and sends no such data.
              </p>
            </LegalSection>

            <LegalSection title="4. Cookies and local storage">
              <p>
                We use your browser&rsquo;s <code>localStorage</code> to hold your
                session token; we do not use tracking cookies. Logging out, or
                clearing your browser storage, removes the token from your device.
              </p>
            </LegalSection>

            <LegalSection title="5. Third parties">
              <p>
                Sign-in is handled through osu! (ppy Pty Ltd) using OAuth; osu!&rsquo;s
                handling of your account data is governed by its own privacy policy.
                The Service is delivered through hosting and infrastructure providers
                that process requests in order to run the site.
              </p>
            </LegalSection>

            <LegalSection title="6. Data retention and deletion">
              <p>
                Game data stays associated with your account while it is active. You
                can remove the data stored on your device at any time by logging out or
                clearing your browser storage. To request deletion of your
                account&rsquo;s game data, contact us through the project repository
                below.
              </p>
            </LegalSection>

            <LegalSection title="7. Children&rsquo;s privacy">
              <p>
                OsuStocks is a general-audience game and is not directed at children.
                Access to osu! accounts is subject to osu!&rsquo;s own age and account
                requirements.
              </p>
            </LegalSection>

            <LegalSection title="8. Changes to this policy">
              <p>
                We may update this policy from time to time. Changes will be reflected
                by the &ldquo;Last updated&rdquo; date above.
              </p>
            </LegalSection>

            <LegalSection title="9. Contact">
              <p>
                Questions about privacy? Reach out through the project&rsquo;s
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
              <p className="mt-2">
                See also our <Link href="/terms" className="font-semibold text-pink-400 hover:text-pink-300">Terms of Use</Link>.
              </p>
            </LegalSection>
          </div>

        </div>
      </div>
    </div>
  );
}

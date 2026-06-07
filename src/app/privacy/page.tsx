import type { Metadata } from "next";
import { LegalSection } from "@/components/legal/LegalSection";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What OsuStocks does with your data. A fan-made game with no payments and no third-party tracking.",
};

const LAST_UPDATED = "June 7, 2026";
const API_REPO = "https://github.com/zidanejidan12/OsuStocks.API";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        Legal
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: {LAST_UPDATED}</p>

      <p className="mt-8 max-w-[65ch] text-sm leading-relaxed text-zinc-400">
        This Privacy Policy explains what information OsuStocks (the
        &ldquo;Service&rdquo;) handles and why. OsuStocks is a free, fan-made
        game; it involves no payments, and we keep data to the minimum needed to
        run the game.
      </p>

      <div className="mt-10 space-y-9">
        <LegalSection title="1. Information we handle">
          <p>
            <strong>osu! account info (via OAuth).</strong> When you sign in, osu!
            shares a limited set of details so we can identify your account &mdash;
            your osu! user ID and username (and your role within the game). We do
            not receive your osu! password.
          </p>
          <p>
            <strong>Game data.</strong> As you play, the Service stores fictional
            game data tied to your account: your virtual wallet balance, your
            holdings and portfolio, and your virtual trade history. This is game
            data, not financial records.
          </p>
          <p>
            <strong>Stored in your browser.</strong> To keep you signed in, we
            store a session access token (a JWT) and its expiry in your
            browser&rsquo;s <code>localStorage</code>. If you use the optional
            developer token field, the token you paste is stored the same way. This
            stays on your device.
          </p>
        </LegalSection>

        <LegalSection title="2. How we use information">
          <ul>
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
          <ul>
            <li>
              We do not collect or process real payment or financial information
              &mdash; there are none.
            </li>
            <li>We do not sell or rent your information.</li>
            <li>
              The OsuStocks web app does not use advertising or third-party
              analytics and tracking cookies.
            </li>
          </ul>
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
            <a href={API_REPO} target="_blank" rel="noopener noreferrer">
              github.com/zidanejidan12/OsuStocks.API
            </a>
            .
          </p>
          <p>
            See also our <a href="/terms">Terms of Use</a>.
          </p>
        </LegalSection>
      </div>
    </div>
  );
}

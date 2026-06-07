"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  SignIn,
  TrendUp,
  ChartPieSlice,
  Wallet,
  Flask,
  WarningCircle,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { fadeUp } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import { setAuth } from "@/lib/auth/token";

function twoHoursFromNow(): string {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
}

const FEATURES = [
  {
    Icon: TrendUp,
    title: "Live market",
    description: "Real-time prices that move with every set and tournament.",
  },
  {
    Icon: ChartPieSlice,
    title: "Track your portfolio",
    description: "Watch your positions, holdings, and returns at a glance.",
  },
  {
    Icon: Wallet,
    title: "Virtual wallet",
    description: "Trade with virtual funds. No real money, all the strategy.",
  },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function useDevToken() {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Paste an access token first.");
      return;
    }
    setError(null);
    setAuth({
      accessToken: trimmed,
      expiresAt: expiresAt.trim() || twoHoursFromNow(),
    });
    router.push("/");
  }

  return (
    <main className="bg-zinc-950 text-zinc-100">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-6">
        {/* LEFT — brand pitch */}
        <section className="order-1 md:order-none">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">
              <span className="text-pink-400">Osu</span>Stocks
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-zinc-400">
              Trade your favorite osu! players like stocks. Build a portfolio,
              follow the meta, and outsmart the market.
            </p>
          </Reveal>

          <Stagger className="mt-10 flex flex-col gap-5">
            {FEATURES.map(({ Icon, title, description }) => (
              <StaggerItem key={title} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25">
                  <Icon size={20} weight="bold" />
                </span>
                <div className="pt-0.5">
                  <h3 className="font-medium tracking-tight text-zinc-100">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                    {description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* RIGHT — auth card */}
        <section className="order-2 flex justify-center md:order-none md:justify-end">
          <Reveal delay={0.1} className="w-full max-w-md">
            <Card>
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-semibold tracking-tighter">
                    Sign in
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Continue with your osu! account to start trading.
                  </p>
                </div>

                <MagneticButton
                  onClick={() => login("/")}
                  className={buttonClasses({
                    variant: "primary",
                    size: "lg",
                    className: "w-full",
                  })}
                >
                  <SignIn size={20} weight="bold" />
                  Login with osu!
                </MagneticButton>

                <p className="text-center text-xs leading-relaxed text-zinc-500">
                  By signing in, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-pink-300"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-pink-300"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-zinc-800" />
                  <span className="text-xs uppercase tracking-wider text-zinc-600">
                    or
                  </span>
                  <span className="h-px flex-1 bg-zinc-800" />
                </div>

                {/* Development-only token flow */}
                <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                  <div className="space-y-2">
                    <Badge tone="accent">
                      <Flask size={14} weight="bold" />
                      Development only
                    </Badge>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Paste a JWT to sign in without OAuth.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="dev-access-token"
                      className="text-xs uppercase tracking-wider text-zinc-500"
                    >
                      Access token
                    </label>
                    <textarea
                      id="dev-access-token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      rows={3}
                      placeholder="eyJhbGciOiJ..."
                      className={`${INPUT_CLASS} resize-y font-mono`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="dev-expires-at"
                      className="text-xs uppercase tracking-wider text-zinc-500"
                    >
                      Expires at (ISO, optional)
                    </label>
                    <input
                      id="dev-expires-at"
                      type="text"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      placeholder="defaults to 2 hours from now"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {error && (
                      <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-1.5 text-xs text-rose-400"
                      >
                        <WarningCircle size={14} weight="bold" />
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={useDevToken}
                  >
                    Use this token
                  </Button>
                </div>
              </div>
            </Card>
          </Reveal>
        </section>
      </div>
    </main>
  );
}

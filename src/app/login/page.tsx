"use client";

import Link from "next/link";
import {
  SignIn,
  TrendUp,
  ChartPieSlice,
  Wallet,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { useAuth } from "@/lib/auth/auth-context";

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

export default function LoginPage() {
  const { login } = useAuth();

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
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
              A free fan-made game — credits are virtual, with no real-world value.
              Not affiliated with osu! or ppy&nbsp;Pty&nbsp;Ltd.
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
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Uses osu!&apos;s official login (OAuth) on osu.ppy.sh — we never
                    see or store your password.
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
              </div>
            </Card>
          </Reveal>
        </section>
      </div>
    </main>
  );
}

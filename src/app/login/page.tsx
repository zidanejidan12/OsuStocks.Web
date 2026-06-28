"use client";

import { useEffect, useState } from "react";
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

function PinkRain() {
  const [circles, setCircles] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newCircles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 16 + 8,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 4,
    }));
    setCircles(newCircles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {circles.map((c) => (
        <span
          key={c.id}
          className="absolute rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-[1px] animate-fall"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            top: `-30px`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear"
          }}
        />
      ))}
    </div>
  );
}

function AnimeMascot() {
  return (
    <div className="relative mx-auto mb-6 w-32 h-32 md:w-40 md:h-40 animate-float flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-pink-500/10 border border-pink-500/30 animate-pulse" />
      <div className="absolute -inset-4 rounded-full bg-pink-500/5 blur-md animate-pulse" />
      <svg
        width="80%"
        height="80%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-pink-500 transition-transform duration-500 hover:scale-110"
      >
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow" />
        <path d="M35 45 C38 45, 38 50, 35 50 C32 50, 32 45, 35 45 Z" fill="currentColor" />
        <path d="M65 45 C68 45, 68 50, 65 50 C62 50, 62 45, 65 45 Z" fill="currentColor" />
        <path d="M42 60 C45 65, 55 65, 58 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M25 25 L35 35 L20 40 Z" fill="currentColor" fillOpacity="0.8" />
        <path d="M75 25 L65 35 L80 40 Z" fill="currentColor" fillOpacity="0.8" />
        <path d="M50 10 L52 15 L57 17 L52 19 L50 24 L48 19 L43 17 L48 15 Z" fill="currentColor" className="animate-pulse" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <main className="relative bg-zinc-950 text-zinc-100 overflow-hidden">
      <PinkRain />
      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:gap-16 md:px-6">
        <section className="order-1 md:order-none">
          <Reveal>
            <div className="flex flex-col items-center md:items-start">
              <AnimeMascot />
              <h1 className="text-4xl text-center md:text-left font-semibold tracking-tighter sm:text-5xl">
                <span className="text-pink-400">Osu</span>Stocks
              </h1>
              <p className="mt-4 text-center md:text-left max-w-md text-lg leading-relaxed text-zinc-400">
                Trade your favorite osu! players like stocks. Build a portfolio,
                follow the meta, and outsmart the market.
              </p>
              <p className="mt-3 text-center md:text-left max-w-md text-sm leading-relaxed text-zinc-500">
                A free fan-made game — credits are virtual, with no real-world value.
                Not affiliated with osu! or ppy Pty Ltd.
              </p>
            </div>
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

                <MagneticButton
                  onClick={() => {
                    localStorage.setItem("osustocks.auth", JSON.stringify({ accessToken: "dummy_token", expiresAt: "2099-12-31T23:59:59Z" }));
                    window.location.href = "/";
                  }}
                  className={buttonClasses({
                    variant: "secondary",
                    size: "lg",
                    className: "w-full border border-pink-500/20 hover:border-pink-500/50 bg-zinc-900/50",
                  })}
                >
                  <SignIn size={20} weight="bold" className="text-pink-400" />
                  Bypass & Run UI Mode (Demo)
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChartLineUp, WarningCircle, ArrowRight } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { scaleIn } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import { setAuth } from "@/lib/auth/token";
import * as analytics from "@/lib/analytics";

function twoHoursFromNow(): string {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
}

// Only ever redirect to an internal path. Rejects absolute URLs and
// protocol-relative ("//evil.com") values so a crafted callback link can't turn
// sign-in into an open redirect.
function safeReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const reduceMotion = useReducedMotion();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function handle() {
      // Any failure here — a missing token, a rejected refresh(), or a network
      // error — must surface the error UI rather than spin forever.
      try {
        const search = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        const accessToken =
          search.get("accessToken") ?? hash.get("accessToken");
        const expiresAt = search.get("expiresAt") ?? hash.get("expiresAt");
        const returnTo = safeReturnTo(
          search.get("returnTo") ?? hash.get("returnTo"),
        );

        if (!accessToken) {
          if (!cancelled) setError(true);
          return;
        }

        setAuth({ accessToken, expiresAt: expiresAt ?? twoHoursFromNow() });
        analytics.track("login_completed");
        if (typeof window !== "undefined") {
          window.localStorage.setItem("show_welcome_toast", "true");
        }
        await refresh();
        if (!cancelled) router.replace(returnTo);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    handle();

    return () => {
      cancelled = true;
    };
  }, [router, refresh]);

  if (error) {
    return (
      <main className="grid min-h-[calc(100dvh-4rem)] place-items-center bg-zinc-950 px-4 py-12 text-zinc-100">
        <Reveal className="w-full max-w-md">
          <Card>
            <div className="flex flex-col items-center text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-400 ring-1 ring-inset ring-rose-500/25">
                <WarningCircle size={26} weight="bold" />
              </span>
              <h1 className="mt-5 text-xl font-semibold tracking-tighter">
                Sign-in failed
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
                We could not read an access token from the callback. Please try
                again.
              </p>
              <Link
                href="/login"
                className={buttonClasses({
                  variant: "primary",
                  size: "md",
                  className: "mt-6",
                })}
              >
                Back to login
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </Card>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center text-center"
      >
        <div className="relative grid h-16 w-16 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-2xl bg-pink-500/15 ring-1 ring-inset ring-pink-500/25"
            animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
            transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
          <motion.span
            className="relative text-pink-400"
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChartLineUp size={28} weight="bold" />
          </motion.span>
        </div>
        <p className="mt-5 text-sm font-medium tracking-tight text-zinc-300">
          Completing sign-in…
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Hang tight while we finish setting up your session.
        </p>
      </motion.div>
    </main>
  );
}

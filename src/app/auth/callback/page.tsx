"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/auth-context";
import { setAuth } from "@/lib/auth/token";

function twoHoursFromNow(): string {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function handle() {
      const search = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const accessToken =
        search.get("accessToken") ?? hash.get("accessToken");
      const expiresAt = search.get("expiresAt") ?? hash.get("expiresAt");
      const returnTo =
        search.get("returnTo") ?? hash.get("returnTo") ?? "/";

      if (!accessToken) {
        if (!cancelled) setError(true);
        return;
      }

      setAuth({ accessToken, expiresAt: expiresAt ?? twoHoursFromNow() });
      await refresh();
      if (!cancelled) router.replace(returnTo);
    }

    handle();

    return () => {
      cancelled = true;
    };
  }, [router, refresh]);

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-zinc-950 p-6 text-zinc-100">
        <Card className="w-full max-w-md text-center">
          <div className="space-y-3">
            <h1 className="text-lg font-semibold text-rose-400">
              Sign-in failed
            </h1>
            <p className="text-sm text-zinc-400">
              We could not read an access token from the callback. Please try
              again.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-400"
            >
              Back to login
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <Spinner label="Signing you in..." />
    </main>
  );
}

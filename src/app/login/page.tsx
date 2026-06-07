"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/auth-context";
import { setAuth } from "@/lib/auth/token";

function twoHoursFromNow(): string {
  return new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
}

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
    <main className="flex flex-1 items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold">OsuStocks</h1>
            <p className="text-sm text-zinc-400">
              Sign in to trade osu! player shares.
            </p>
          </div>

          <button
            type="button"
            onClick={() => login("/")}
            className="w-full rounded-lg bg-pink-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          >
            Login with osu!
          </button>

          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                Development only
              </p>
              <p className="text-xs text-zinc-500">
                Paste a JWT to sign in without completing OAuth.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">Access token</span>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  rows={3}
                  placeholder="eyJhbGciOi..."
                  className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">
                  Expires at (ISO, optional)
                </span>
                <input
                  type="text"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  placeholder="defaults to 2 hours from now"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-pink-500 focus:outline-none"
                />
              </label>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              type="button"
              onClick={useDevToken}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              Use this token
            </button>
          </div>
        </div>
      </Card>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getWallet,
  getWalletTransactions,
  ApiError,
} from "@/lib/api/client";
import type { Wallet, WalletTransaction } from "@/lib/api/types";
import { formatCurrency, formatChange, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/auth-context";

function PleaseLogIn() {
  return (
    <Card>
      <EmptyState
        title="Please log in"
        message="You need to be signed in to view your wallet."
        action={
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-400"
          >
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUnauthorized(false);

    Promise.all([getWallet(), getWalletTransactions()])
      .then(([walletData, txData]) => {
        if (cancelled) return;
        setWallet(walletData);
        setTransactions(txData.items);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load wallet."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (!user || unauthorized) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <PleaseLogIn />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Wallet</h1>

      {loading && <Spinner label="Loading wallet…" />}

      {!loading && error && (
        <Card className="border-rose-900/60 bg-rose-950/30">
          <p className="text-sm text-rose-300">{error}</p>
        </Card>
      )}

      {!loading && !error && wallet && (
        <div className="space-y-6">
          <Card>
            <Stat label="Balance" value={formatCurrency(wallet.balance)} />
          </Card>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Transactions
            </h2>
            {transactions.length === 0 ? (
              <Card>
                <EmptyState
                  title="No transactions yet"
                  message="Your wallet activity will appear here."
                />
              </Card>
            ) : (
              <Card className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.transactionId}
                          className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30"
                        >
                          <td className="px-4 py-3 text-zinc-200">
                            {tx.transactionType}
                          </td>
                          <td
                            className={`px-4 py-3 text-right tabular-nums ${
                              tx.amount >= 0
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }`}
                          >
                            {formatChange(tx.amount)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                            {formatDateTime(tx.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

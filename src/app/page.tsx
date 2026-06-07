"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MarketOverview, Paged, StockSort, StockSummary } from "@/lib/api/types";
import { getMarketOverview, getStocks, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/Spinner";
import { MarketOverviewCards } from "@/components/market/MarketOverviewCards";
import { StockList } from "@/components/market/StockList";

const PAGE_SIZE = 25;

function LoginNotice() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
      <p className="text-zinc-300">Please log in to continue.</p>
      <Link
        href="/login"
        className="mt-3 inline-block rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-600"
      >
        Go to login
      </Link>
    </div>
  );
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm text-rose-300">
      {message}
    </div>
  );
}

function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
        OsuStocks
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-400">
        Trade your favorite osu! players like stocks.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-8 rounded-lg bg-pink-500 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-pink-600"
      >
        Get started
      </button>
      <Link href="/login" className="mt-4 text-sm text-zinc-500 hover:text-zinc-300">
        Already have a token? Log in
      </Link>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading, login } = useAuth();

  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<StockSort>("change24h_desc");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input so we don't fetch on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Reset to the first page whenever the query changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  // Fetch the market overview once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setOverviewError(null);

    getMarketOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load market overview.";
        setOverviewError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fetch the paged stock list whenever the query parameters change.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setStocksLoading(true);
    setStocksError(null);

    getStocks({
      page,
      pageSize: PAGE_SIZE,
      sort,
      search: debouncedSearch || undefined,
    })
      .then((data: Paged<StockSummary>) => {
        if (cancelled) return;
        setStocks(data.items);
        setTotalCount(data.totalCount ?? data.items.length);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load stocks.";
        setStocksError(message);
        setStocks([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (!cancelled) setStocksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, page, sort, debouncedSearch]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Hero onLogin={() => login("/")} />;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Market</h1>
        <p className="text-sm text-zinc-400">
          Welcome back, {user.username}.
        </p>
      </div>

      {unauthorized ? (
        <LoginNotice />
      ) : (
        <div className="flex flex-col gap-6">
          {overviewError ? (
            <ErrorNotice message={overviewError} />
          ) : overview ? (
            <MarketOverviewCards overview={overview} />
          ) : (
            <div className="flex justify-center py-6">
              <Spinner label="Loading overview..." />
            </div>
          )}

          {stocksError && <ErrorNotice message={stocksError} />}

          <StockList
            stocks={stocks}
            loading={stocksLoading}
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            page={page}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </main>
  );
}

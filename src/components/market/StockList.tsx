"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  MagnifyingGlass,
  CaretRight,
  CaretLeft,
  ChartBar,
} from "@phosphor-icons/react";
import type { MarketCountry, StockSort, StockSummary } from "@/lib/api/types";
import { getMarketCountries } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Skeleton } from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Flag, countryName } from "@/components/ui/Flag";
import { formatNumber } from "@/lib/format";
import { spring } from "@/lib/motion";

// Sentinel value for the "All countries" option (no filter).
const ALL_COUNTRIES = "ALL";

const SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "name_asc", label: "Player (A-Z)" },
  { value: "name_desc", label: "Player (Z-A)" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
  { value: "volume_asc", label: "Volume (low to high)" },
  { value: "volume_desc", label: "Volume (high to low)" },
  { value: "change24h_asc", label: "24h Change (low to high)" },
  { value: "change24h_desc", label: "24h Change (high to low)" },
];

type Props = {
  stocks: StockSummary[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  sort: StockSort;
  onSortChange: (value: StockSort) => void;
  /** Selected country filter (ISO 3166-1 alpha-2), or "ALL" for no filter. */
  country: string;
  onCountryChange: (value: string) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export function StockList({
  stocks,
  loading,
  search,
  onSearchChange,
  sort,
  onSortChange,
  country,
  onCountryChange,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: Props) {
  const reduceMotion = useReducedMotion();
  // Only run the per-row entrance stagger on the very first mount — not on every
  // refetch/sort/search (which would re-animate the whole table on each keystroke).
  const hasAnimatedRef = useRef(false);
  const animateRows = !reduceMotion && !hasAnimatedRef.current;
  useEffect(() => {
    hasAnimatedRef.current = true;
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Populate the country dropdown once on mount; degrade gracefully (filter just
  // stays "All countries") if the endpoint errors.
  const [countries, setCountries] = useState<MarketCountry[]>([]);
  useEffect(() => {
    let cancelled = false;
    getMarketCountries()
      .then((items) => {
        if (!cancelled) setCountries(items);
      })
      .catch(() => {
        // Non-fatal: leave the list empty so only "All countries" shows.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCountry =
    country !== ALL_COUNTRIES && country !== "" ? country : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="stock-search" className="sr-only">
            Search players
          </label>
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            id="stock-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search players..."
            aria-label="Search players"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {selectedCountry && (
              <Flag countryCode={selectedCountry} className="h-4 w-[21px] shrink-0" />
            )}
            <select
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              aria-label="Filter by country"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 sm:w-auto"
            >
              <option value={ALL_COUNTRIES}>All countries</option>
              {countries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {countryName(c.countryCode)} — {formatNumber(c.count)}
                </option>
              ))}
            </select>
          </div>
          <label htmlFor="stock-sort" className="sr-only">
            Sort stocks
          </label>
          <select
            id="stock-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as StockSort)}
            aria-label="Sort stocks"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 sm:w-auto"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80">
        {loading ? (
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">24h</th>
                <th className="px-4 py-3 text-right font-medium">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : stocks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No stocks found"
              message="Try adjusting your search or filters."
              icon={<ChartBar size={22} weight="bold" />}
            />
          </div>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">24h</th>
                <th className="px-4 py-3 text-right font-medium">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {stocks.map((stock, i) => (
                <motion.tr
                  key={stock.stockId}
                  initial={animateRows ? { opacity: 0, y: 6 } : false}
                  animate={animateRows ? { opacity: 1, y: 0 } : undefined}
                  transition={
                    animateRows
                      ? { ...spring, delay: Math.min(i, 12) * 0.025 }
                      : undefined
                  }
                  className="group transition-colors hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/stocks/${stock.stockId}`}
                      className="inline-flex items-center gap-2.5 font-medium text-zinc-100 transition-colors group-hover:text-pink-400"
                    >
                      <Avatar
                        src={stock.avatarUrl}
                        name={stock.playerName}
                        size="sm"
                      />
                      <span className="inline-flex items-center gap-1.5">
                        {stock.playerName}
                        {stock.countryCode && (
                          <Flag
                            countryCode={stock.countryCode}
                            className="h-3 shrink-0"
                          />
                        )}
                        <CaretRight
                          size={14}
                          weight="bold"
                          className="text-pink-400 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-100">
                    <Money value={stock.currentPrice} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <PriceChange
                      value={stock.priceChange24h}
                      className="justify-end"
                    />
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-zinc-400">
                    {formatNumber(stock.volume)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(totalPages > 1 || totalCount > 0) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-mono tabular-nums text-zinc-500">
            {totalPages > 1 ? `Page ${page} of ${totalPages}` : ""}
            {totalCount > 0
              ? `${totalPages > 1 ? " · " : ""}${formatNumber(totalCount)} stocks`
              : ""}
          </span>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={!canPrev}
                className={buttonClasses({
                  variant: "secondary",
                  size: "md",
                  className: "disabled:pointer-events-none disabled:opacity-40",
                })}
              >
                <CaretLeft size={14} weight="bold" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={!canNext}
                className={buttonClasses({
                  variant: "secondary",
                  size: "md",
                  className: "disabled:pointer-events-none disabled:opacity-40",
                })}
              >
                Next
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

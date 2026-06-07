"use client";

import Link from "next/link";
import type { StockSort, StockSummary } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatCurrency, formatNumber } from "@/lib/format";

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
  page,
  pageSize,
  totalCount,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search players..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none sm:max-w-xs"
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as StockSort)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-pink-500 focus:outline-none sm:w-auto"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner label="Loading stocks..." />
          </div>
        ) : stocks.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No stocks found"
              message="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">24h</th>
                  <th className="px-4 py-3 text-right font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.stockId}
                    className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/stocks/${stock.stockId}`}
                        className="font-medium text-zinc-100 hover:text-pink-400"
                      >
                        {stock.playerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-100">
                      {formatCurrency(stock.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <PriceChange value={stock.priceChange24h} />
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      {formatNumber(stock.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>
          Page {page} of {totalPages}
          {totalCount > 0 ? ` · ${formatNumber(totalCount)} stocks` : ""}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-200 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-200 transition-colors hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

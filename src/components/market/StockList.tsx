"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlass,
  CaretRight,
  CaretLeft,
  ChartBar,
  Star,
  Coins,
  ArrowUp,
  ArrowDown,
  TrendUp,
  TrendDown,
  CaretDown,
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

interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

function CustomSelect<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (val: T) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 px-4 py-2.5 rounded-xl text-sm text-zinc-100 transition-all duration-200 cursor-pointer text-left focus:outline-none"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOpt.icon}
          <span>{selectedOpt.label}</span>
        </span>
        <CaretDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 min-w-[220px] max-h-60 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl p-1 z-50 focus:outline-none scrollbar-thin"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-xs rounded-lg transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-100"
                  }`}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sentinel value for the "All countries" option (no filter).
const ALL_COUNTRIES = "ALL";

const SORT_OPTIONS: { value: StockSort; label: string }[] = [
  { value: "change24h_desc", label: "Top Gainers (24h)" },
  { value: "change24h_asc", label: "Top Losers (24h)" },
  { value: "price_desc", label: "Highest Price" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "volume_desc", label: "Highest Volume" },
  { value: "volume_asc", label: "Lowest Volume" },
  { value: "name_asc", label: "Player (A-Z)" },
  { value: "name_desc", label: "Player (Z-A)" },
];

type Props = {
  stocks: StockSummary[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  sort: StockSort;
  onSortChange: (value: StockSort) => void;
  country: string;
  onCountryChange: (value: string) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onSelectStock?: (stockId: string) => void;
};

// Player specific SVG Sparkline Trend chart
function Sparkline({ change24h, id }: { change24h: number; id: string }) {
  const points: string[] = [];
  const count = 6;
  const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    const x = progress * 56;
    // Dynamic wavy line
    const wave = Math.sin(seed + i * 1.5) * 6;
    const trend = change24h * 0.3 * (progress - 0.5) * 8;
    const y = 15 - wave - trend;
    points.push(`${x},${y}`);
  }
  
  const color = change24h >= 0 ? "#10b981" : "#f43f5e";
  
  return (
    <svg width="56" height="30" className="opacity-90">
      <path
        d={`M ${points.join(" L ")}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StockRow({
  stock,
  animateRows,
  index,
  page,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: {
  stock: StockSummary;
  animateRows: boolean;
  index: number;
  page: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}) {
  const [prevPrice, setPrevPrice] = useState(stock.currentPrice);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (stock.currentPrice > prevPrice) {
      setFlash("up");
      const t = setTimeout(() => setFlash(null), 850);
      setPrevPrice(stock.currentPrice);
      return () => clearTimeout(t);
    } else if (stock.currentPrice < prevPrice) {
      setFlash("down");
      const t = setTimeout(() => setFlash(null), 850);
      setPrevPrice(stock.currentPrice);
      return () => clearTimeout(t);
    }
  }, [stock.currentPrice, prevPrice]);

  const flashClass =
    flash === "up"
      ? "bg-emerald-500/15"
      : flash === "down"
      ? "bg-rose-500/15"
      : "hover:bg-zinc-900/40 border-b border-zinc-900/40";

  const priceColor =
    flash === "up"
      ? "text-emerald-400 font-bold"
      : flash === "down"
      ? "text-rose-400 font-bold"
      : "text-zinc-100";

  // Calculate global page rank index
  const rank = (page - 1) * 25 + index + 1;

  // Derived 7d change
  const change7d = (stock.priceChange24h * 1.62) + (Math.sin(index) * 4);

  return (
    <motion.tr
      initial={animateRows ? { opacity: 0, y: 8 } : false}
      animate={animateRows ? { opacity: 1, y: 0 } : undefined}
      transition={
        animateRows
          ? { ...spring, delay: Math.min(index, 10) * 0.02 }
          : undefined
      }
      className={`group transition-all duration-300 ${flashClass}`}
    >
      {/* 1. Ranking */}
      <td className="px-4 py-3.5 text-center font-mono font-bold text-xs text-zinc-500">
        #{rank}
      </td>

      {/* Favorite star */}
      <td className="px-2 py-3.5 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`transition-colors hover:text-amber-400 p-1 rounded ${
            isFavorite ? "text-amber-400" : "text-zinc-600"
          }`}
        >
          <Star size={15} weight={isFavorite ? "fill" : "bold"} />
        </button>
      </td>

      {/* 2. Player info */}
      <td className="px-4 py-3.5">
        <button
          onClick={onSelect}
          className="inline-flex items-center gap-3.5 font-bold text-zinc-100 text-left transition-colors duration-300 group-hover:text-pink-400 focus:outline-none"
        >
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Avatar
              src={stock.avatarUrl}
              name={stock.playerName}
              size="sm"
              className="border border-zinc-800"
            />
          </div>
          <span className="inline-flex items-center gap-2">
            <span className="font-display font-bold text-[14px]">{stock.playerName}</span>
            {stock.countryCode && (
              <Flag
                countryCode={stock.countryCode}
                className="h-3 shrink-0"
              />
            )}
            <CaretRight
              size={14}
              weight="bold"
              className="text-pink-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
            />
          </span>
        </button>
      </td>

      {/* 3. Country code (Text representation) */}
      <td className="px-4 py-3.5 text-zinc-400 font-mono text-xs uppercase">
        {stock.countryCode ? countryName(stock.countryCode) : "Global"}
      </td>

      {/* 4. Share Price */}
      <td className={`px-4 py-3.5 text-right font-mono font-bold tabular-nums transition-colors duration-300 ${priceColor}`}>
        <Money value={stock.currentPrice} />
      </td>

      {/* 5. 24h Change */}
      <td className="px-4 py-3.5 text-right">
        <PriceChange
          value={stock.priceChange24h}
          className="justify-end font-semibold text-xs"
        />
      </td>

      {/* 6. 7d Change (Derived/Simulated) */}
      <td className="px-4 py-3.5 text-right">
        <PriceChange
          value={change7d}
          className="justify-end font-semibold text-xs"
        />
      </td>

      {/* 7. Volume */}
      <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-zinc-400">
        {formatNumber(stock.volume)}
      </td>

      {/* 8. Trend Sparkline */}
      <td className="px-4 py-2 align-middle">
        <div className="flex justify-end pr-2">
          <Sparkline change24h={stock.priceChange24h} id={stock.stockId} />
        </div>
      </td>

      {/* 9. Buy Button */}
      <td className="px-4 py-3.5 text-right">
        <button
          onClick={onSelect}
          className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-[0_2px_10px_rgba(236,72,153,0.15)] active:scale-95 hover:shadow-[0_2px_15px_rgba(236,72,153,0.3)]"
        >
          Buy
        </button>
      </td>
    </motion.tr>
  );
}

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
  onSelectStock,
}: Props) {
  const reduceMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);
  const animateRows = !reduceMotion && !hasAnimatedRef.current;

  useEffect(() => {
    hasAnimatedRef.current = true;
  }, []);

  // Favorites logic
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("osustocks.favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleFavorite = (stockId: string) => {
    const next = favorites.includes(stockId)
      ? favorites.filter((id) => id !== stockId)
      : [...favorites, stockId];
    setFavorites(next);
    localStorage.setItem("osustocks.favorites", JSON.stringify(next));
  };

  // Filter Mode tab: "ALL" | "GAINERS" | "LOSERS" | "FAVORITES"
  const [filterTab, setFilterTab] = useState<"ALL" | "GAINERS" | "LOSERS" | "FAVORITES">("ALL");

  // Filter stocks list locally if favorites active
  const filteredStocks = stocks.filter((s) => {
    if (filterTab === "FAVORITES") return favorites.includes(s.stockId);
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const [countries, setCountries] = useState<MarketCountry[]>([]);
  useEffect(() => {
    let cancelled = false;
    getMarketCountries()
      .then((items) => {
        if (!cancelled) setCountries(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCountry =
    country !== ALL_COUNTRIES && country !== "" ? country : null;

  const countryOptions = [
    { value: ALL_COUNTRIES, label: "All countries" },
    ...countries.map((c) => ({
      value: c.countryCode,
      label: `${countryName(c.countryCode)} (${c.count})`,
      icon: <Flag countryCode={c.countryCode} className="h-4 w-[21px] shrink-0" />,
    })),
  ];

  const sortOptions = SORT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filters panel */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search & minimal selector dropdowns */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
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
              placeholder="Search player name..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Country Selector */}
            <CustomSelect
              value={country}
              options={countryOptions}
              onChange={onCountryChange}
              className="min-w-[180px]"
            />

            {/* Sort Selector */}
            <CustomSelect
              value={sort}
              options={sortOptions}
              onChange={(val) => onSortChange(val as StockSort)}
              className="min-w-[190px]"
            />
          </div>
        </div>

        {/* Row 2: Minimal tab filter links (Top Gainer, Top Loser, Favorites) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-900 pb-2">
          {(["ALL", "GAINERS", "LOSERS", "FAVORITES"] as const).map((tab) => {
            const isActive = filterTab === tab;
            let label = "All Players";
            if (tab === "GAINERS") label = "Top Gainers";
            if (tab === "LOSERS") label = "Top Losers";
            if (tab === "FAVORITES") label = `Watchlist (${favorites.length})`;

            return (
              <button
                key={tab}
                onClick={() => {
                  setFilterTab(tab);
                  // Link sorting parameters where needed
                  if (tab === "GAINERS") onSortChange("change24h_desc");
                  if (tab === "LOSERS") onSortChange("change24h_asc");
                }}
                className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-pink-500/10 border border-pink-500/30 text-pink-400"
                    : "border border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Professional Trading Terminal Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
        {loading ? (
          <table className="w-full min-w-[900px] text-sm select-none">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-900/25 sticky top-0 backdrop-blur-md z-10">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-2 py-3 w-8"></th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">24h</th>
                <th className="px-4 py-3 text-right">7d</th>
                <th className="px-4 py-3 text-right">Volume</th>
                <th className="px-4 py-3 text-center w-24">Trend</th>
                <th className="px-4 py-3 text-right w-20">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/30">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="mx-auto h-4 w-6 rounded" /></td>
                  <td className="px-2 py-4"><Skeleton className="mx-auto h-4 w-4 rounded-full" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-4 w-16 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-4 w-14 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-4 w-14 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-4 w-16 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="mx-auto h-4 w-12 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-7 w-12 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : filteredStocks.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title={filterTab === "FAVORITES" ? "Watchlist is empty" : "No players found"}
              message={filterTab === "FAVORITES" ? "Star players in the market list to add them to your watchlist." : "Try adjusting your search query or filters."}
              icon={<ChartBar size={24} weight="bold" className="text-zinc-600" />}
            />
          </div>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-widest text-zinc-500 bg-zinc-900/40 sticky top-0 backdrop-blur-md z-10">
                <th className="px-4 py-3.5 text-center w-12 font-bold">Rank</th>
                <th className="px-2 py-3.5 w-8"></th>
                <th className="px-4 py-3.5 font-bold">Player</th>
                <th className="px-4 py-3.5 font-bold">Region</th>
                <th className="px-4 py-3.5 text-right font-bold">Price</th>
                <th className="px-4 py-3.5 text-right font-bold">24h Change</th>
                <th className="px-4 py-3.5 text-right font-bold">7d Change</th>
                <th className="px-4 py-3.5 text-right font-bold">Volume</th>
                <th className="px-4 py-3.5 text-center w-24 font-bold">Trend</th>
                <th className="px-4 py-3.5 text-right w-20 font-bold">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/30">
              {filteredStocks.map((stock, i) => (
                <StockRow
                  key={stock.stockId}
                  stock={stock}
                  animateRows={animateRows}
                  index={i}
                  page={page}
                  isFavorite={favorites.includes(stock.stockId)}
                  onToggleFavorite={() => toggleFavorite(stock.stockId)}
                  onSelect={() => onSelectStock?.(stock.stockId)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination component */}
      {(totalPages > 1 || totalCount > 0) && filterTab !== "FAVORITES" && (
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

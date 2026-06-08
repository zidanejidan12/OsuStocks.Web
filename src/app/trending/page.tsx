"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Tag,
  TrendUp,
  TrendDown,
  ChartBar,
  WarningCircle,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { getTrending, ApiError } from "@/lib/api/client";
import type { Trending, TrendingStock } from "@/lib/api/types";
import { formatCompact } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceChange } from "@/components/ui/PriceChange";
import { Reveal } from "@/components/motion/Reveal";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface Bucket {
  key: keyof Trending;
  title: string;
  Icon: PhosphorIcon;
  iconClass: string;
  metric: (s: TrendingStock) => ReactNode;
}

const BUCKETS: Bucket[] = [
  {
    key: "mostBought",
    title: "Most Bought",
    Icon: ShoppingCart,
    iconClass: "text-emerald-400",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "mostSold",
    title: "Most Sold",
    Icon: Tag,
    iconClass: "text-rose-400",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "fastestRising",
    title: "Fastest Rising",
    Icon: TrendUp,
    iconClass: "text-emerald-400",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "fastestFalling",
    title: "Fastest Falling",
    Icon: TrendDown,
    iconClass: "text-rose-400",
    metric: (s) => <PriceChange value={s.priceChange24h} />,
  },
  {
    key: "highestVolume",
    title: "Highest Volume",
    Icon: ChartBar,
    iconClass: "text-pink-400",
    metric: (s) => (
      <span className="font-mono text-sm tabular-nums text-zinc-300">
        {formatCompact(s.volume)}
      </span>
    ),
  },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">{children}</div>;
}

function BucketCard({ bucket, stocks }: { bucket: Bucket; stocks: TrendingStock[] }) {
  const { Icon, title, iconClass, metric } = bucket;
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/70 ${iconClass}`}>
          <Icon size={17} weight="bold" />
        </span>
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </div>
      {stocks.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">No data yet.</p>
      ) : (
        <motion.ul
          className="space-y-1"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {stocks.slice(0, 5).map((s, i) => (
            <motion.li key={s.stockId} variants={fadeUp}>
              <Link
                href={`/stocks/${s.stockId}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-800/50"
              >
                <span className="w-4 shrink-0 text-center font-mono text-xs tabular-nums text-zinc-600">
                  {i + 1}
                </span>
                <Avatar src={s.avatarUrl} name={s.playerName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">
                    {s.playerName}
                  </div>
                  <div className="font-mono text-xs tabular-nums text-zinc-500">
                    <Money value={s.currentPrice} />
                  </div>
                </div>
                <div className="shrink-0 text-right">{metric(s)}</div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  );
}

function TrendingSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="mb-4 h-7 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-14" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function TrendingPage() {
  const [data, setData] = useState<Trending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTrending()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Failed to load trending.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isEmpty =
    data !== null && BUCKETS.every((b) => (data[b.key]?.length ?? 0) === 0);

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
            Trending
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            What the market&apos;s moving on right now.
          </p>
        </header>
      </Reveal>

      {loading && <TrendingSkeleton />}

      {!loading && error && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </Reveal>
      )}

      {!loading && !error && isEmpty && (
        <Reveal>
          <EmptyState
            icon={<TrendUp size={20} weight="bold" />}
            title="Nothing trending yet"
            message="Trends appear once trading activity picks up."
          />
        </Reveal>
      )}

      {!loading && !error && data && !isEmpty && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUCKETS.map((bucket) => (
            <Reveal key={bucket.key}>
              <BucketCard bucket={bucket} stocks={data[bucket.key] ?? []} />
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
}

import Link from "next/link";
import type { MarketOverview, TopMover } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { PriceChange } from "@/components/ui/PriceChange";
import { formatCurrency, formatNumber } from "@/lib/format";

function MoverCard({ label, mover }: { label: string; mover: TopMover | null }) {
  if (!mover) {
    return (
      <Card>
        <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
        <div className="mt-2 text-sm text-zinc-500">No data</div>
      </Card>
    );
  }
  return (
    <Link href={`/stocks/${mover.stockId}`} className="block">
      <Card className="transition-colors hover:border-zinc-700 hover:bg-zinc-900">
        <div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-medium text-zinc-100">
            {mover.playerName}
          </span>
          <PriceChange value={mover.priceChange24h} className="text-sm" />
        </div>
        <div className="mt-1 text-lg font-semibold text-zinc-100">
          {formatCurrency(mover.currentPrice)}
        </div>
      </Card>
    </Link>
  );
}

export function MarketOverviewCards({ overview }: { overview: MarketOverview }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <Stat label="Total Stocks" value={formatNumber(overview.totalStocks)} />
      </Card>
      <Card>
        <Stat label="Total Volume" value={formatNumber(overview.totalVolume)} />
      </Card>
      <MoverCard label="Top Gainer" mover={overview.topGainer} />
      <MoverCard label="Top Loser" mover={overview.topLoser} />
    </div>
  );
}

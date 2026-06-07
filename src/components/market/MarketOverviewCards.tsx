import type { MarketOverview } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { MoverCard } from "@/components/market/MoverCard";
import { formatNumber } from "@/lib/format";

export function MarketOverviewCards({ overview }: { overview: MarketOverview }) {
  return (
    // Asymmetric bento: two compact Stat tiles stacked beside two richer
    // mover cards. Collapses to a single column on mobile.
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="grid grid-cols-2 gap-4 md:col-span-5">
        <Card>
          <Stat label="Total Stocks" value={formatNumber(overview.totalStocks)} />
        </Card>
        <Card>
          <Stat label="Total Volume" value={formatNumber(overview.totalVolume)} />
        </Card>
      </div>

      <div className="md:col-span-4">
        <MoverCard label="Top Gainer" mover={overview.topGainer} tone="success" />
      </div>
      <div className="md:col-span-3">
        <MoverCard label="Top Loser" mover={overview.topLoser} tone="danger" />
      </div>
    </div>
  );
}

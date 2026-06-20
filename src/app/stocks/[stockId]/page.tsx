import type { Metadata } from "next";
import { StockDetail } from "@/components/market/StockDetail";

// Market read endpoints are auth-gated, so we can't fetch the player name server-side
// yet — keep a keyword-rich generic title. Once the market read API is public, switch
// this to a generateMetadata that fetches the stock and emits "<Player> — osu! stock price".
export const metadata: Metadata = {
  title: "osu! player stock — live price & chart",
  description:
    "Live price, chart, and stats for an osu! player's stock on OsuStocks, the osu! stock market.",
};

export default async function Page(props: { params: Promise<{ stockId: string }> }) {
  const { stockId } = await props.params;
  return <StockDetail stockId={stockId} />;
}

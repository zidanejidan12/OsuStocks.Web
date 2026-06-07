import { StockDetail } from "@/components/market/StockDetail";

export default async function Page(props: { params: Promise<{ stockId: string }> }) {
  const { stockId } = await props.params;
  return <StockDetail stockId={stockId} />;
}

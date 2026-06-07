import { formatCurrency } from "@/lib/format";
import { Coin } from "./Coin";

// A currency amount: the osu! coin + the mono, tabular-figure number.
// Use this anywhere an amount is shown (replaces the old "$" prefix).
export function Money({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${className}`}
    >
      <Coin />
      {formatCurrency(value)}
    </span>
  );
}

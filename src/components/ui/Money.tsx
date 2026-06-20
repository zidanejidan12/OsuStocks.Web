import { formatCurrency } from "@/lib/format";
import { Coin } from "./Coin";

// A currency amount: the osu! coin + the mono, tabular-figure number.
// Use this anywhere an amount is shown (replaces the old "$" prefix).
// Screen readers hear "<amount> credits" via aria-label; the Coin stays
// decorative. Non-finite values (NaN / Infinity) render as an em-dash.
export function Money({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const finite = Number.isFinite(value);
  const text = finite ? formatCurrency(value) : "—";
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${className}`}
      aria-label={finite ? `${text} credits` : "unavailable"}
    >
      <Coin />
      <span aria-hidden="true">{text}</span>
    </span>
  );
}

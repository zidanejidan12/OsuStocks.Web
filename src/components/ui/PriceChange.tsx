"use client";

import { TrendUp, TrendDown } from "@phosphor-icons/react";
import { formatChange } from "@/lib/format";
import { Coin } from "./Coin";

// Signed, colored, mono change with a trend glyph. Emerald up / rose down.
// `format="currency"` (default) prepends the osu! coin and shows a 2-dp amount;
// `format="percent"` shows a signed percentage with no coin (for percent-valued
// fields like a top play's price impact — never feed those a currency render).
export function PriceChange({
  value,
  className,
  showIcon = true,
  format = "currency",
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
  format?: "currency" | "percent";
}) {
  const up = value > 0;
  const down = value < 0;
  const color = up
    ? "text-emerald-400"
    : down
      ? "text-rose-400"
      : "text-zinc-400";
  const Icon = up ? TrendUp : down ? TrendDown : null;
  const direction = up ? "up" : down ? "down" : "unchanged";

  // percent: value is already in percent units (e.g. 5 → "+5.0%").
  const text =
    format === "percent"
      ? `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(1)}%`
      : formatChange(value);

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${color} ${
        className ?? ""
      }`}
      role="img"
      aria-label={`${direction}, ${
        format === "percent" ? `${Math.abs(value).toFixed(1)} percent` : text
      }`}
    >
      {showIcon && Icon && <Icon size={14} weight="bold" aria-hidden="true" />}
      {format === "currency" && <Coin />}
      {text}
    </span>
  );
}

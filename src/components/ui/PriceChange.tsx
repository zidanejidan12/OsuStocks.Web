"use client";

import { TrendUp, TrendDown } from "@phosphor-icons/react";
import { formatChange } from "@/lib/format";
import { Coin } from "./Coin";

// Signed, colored, mono change with a trend glyph. Emerald up / rose down.
// `format="currency"` (default) prepends the osu! coin and shows a 2-dp amount;
// `format="percent"` shows a signed percentage with no coin (for percent-valued
// fields like a top play's price impact). Never feed those a currency render.
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
  // Non-finite guard: render a neutral placeholder with no misleading sign/direction.
  if (!Number.isFinite(value)) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono tabular-nums text-zinc-400 ${
          className ?? ""
        }`}
        role="img"
        aria-label="unavailable"
      >
        {format === "currency" && <Coin />}
        <span aria-hidden="true">-</span>
      </span>
    );
  }

  // Derive sign/direction from the value AS DISPLAYED (rounded to the same
  // precision as the text) so e.g. -0.004 → "+0.00" doesn't show a "down" arrow.
  const dp = format === "percent" ? 1 : 2;
  const factor = 10 ** dp;
  const rounded = Math.round(value * factor) / factor;

  const up = rounded > 0;
  const down = rounded < 0;
  const color = up
    ? "text-emerald-400"
    : down
      ? "text-rose-400"
      : "text-zinc-400";
  const Icon = up ? TrendUp : down ? TrendDown : null;
  const direction = up ? "up" : down ? "down" : "unchanged";

  // Format from the rounded value so the sign in the text matches the direction.
  const text =
    format === "percent"
      ? `${rounded < 0 ? "-" : "+"}${Math.abs(rounded).toFixed(1)}%`
      : formatChange(rounded);

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${color} ${
        className ?? ""
      }`}
      role="img"
      aria-label={`${direction}, ${
        format === "percent" ? `${Math.abs(rounded).toFixed(1)} percent` : text
      }`}
    >
      {showIcon && Icon && <Icon size={14} weight="bold" aria-hidden="true" />}
      {format === "currency" && <Coin />}
      {text}
    </span>
  );
}

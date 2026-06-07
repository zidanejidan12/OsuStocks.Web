"use client";

import { TrendUp, TrendDown } from "@phosphor-icons/react";
import { formatChange } from "@/lib/format";
import { Coin } from "./Coin";

// Signed, colored, mono change with a trend glyph and the osu! coin.
// Emerald up / rose down.
export function PriceChange({
  value,
  className,
  showIcon = true,
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
}) {
  const up = value > 0;
  const down = value < 0;
  const color = up
    ? "text-emerald-400"
    : down
      ? "text-rose-400"
      : "text-zinc-400";
  const Icon = up ? TrendUp : down ? TrendDown : null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono tabular-nums ${color} ${
        className ?? ""
      }`}
    >
      {showIcon && Icon && <Icon size={14} weight="bold" />}
      <Coin />
      {formatChange(value)}
    </span>
  );
}

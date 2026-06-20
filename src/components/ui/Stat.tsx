import type { ReactNode } from "react";

type StatSize = "sm" | "md" | "lg";

const VALUE_SIZES: Record<StatSize, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

// Label + mono numeric value. Numbers always use the mono face + tabular figures.
export function Stat({
  label,
  value,
  sub,
  size = "md",
  className = "",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  size?: StatSize;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono font-semibold tabular-nums text-zinc-50 ${VALUE_SIZES[size]}`}
      >
        {value}
      </div>
      {sub != null && <div className="mt-1 text-sm text-zinc-400">{sub}</div>}
    </div>
  );
}

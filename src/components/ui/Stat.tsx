import type { ReactNode } from "react";

// Label + mono numeric value. Numbers always use the mono face + tabular figures.
export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tabular-nums text-zinc-50">
        {value}
      </div>
      {sub != null && <div className="mt-1 text-sm text-zinc-400">{sub}</div>}
    </div>
  );
}

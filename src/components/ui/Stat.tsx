import type { ReactNode } from "react";

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
      <div className="text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
      {sub != null && <div className="mt-0.5 text-sm text-zinc-400">{sub}</div>}
    </div>
  );
}

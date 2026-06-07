import { formatChange } from "@/lib/format";

export function PriceChange({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const color =
    value > 0
      ? "text-emerald-400"
      : value < 0
        ? "text-rose-400"
        : "text-zinc-400";

  return (
    <span className={`${color}${className ? ` ${className}` : ""}`}>
      {formatChange(value)}
    </span>
  );
}

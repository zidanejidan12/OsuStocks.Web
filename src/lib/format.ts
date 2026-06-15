// Pure formatting helpers. No runtime dependencies.
// Note: amounts are unitless strings here — the osu! coin glyph is rendered by
// the <Money> / <PriceChange> components, not baked into these values.

const currencyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export function formatCurrency(n: number): string {
  return currencyFormatter.format(n);
}

export function formatNumber(n: number): string {
  return integerFormatter.format(n);
}

export function formatChange(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return sign + currencyFormatter.format(Math.abs(n));
}

export function formatDateTime(iso: string): string {
  if (!iso) return iso;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

export function formatDate(iso: string): string {
  if (!iso) return iso;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString();
}

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Large counts as "1.2K" / "3.4M". Good for volumes and market caps. */
export function formatCompact(n: number): string {
  return compactFormatter.format(n);
}

/** A 0–1 fraction as a percent, e.g. 0.124 → "12.4%". `signed` prepends +/−. */
export function formatPercent(fraction: number, signed = false): string {
  const pct = fraction * 100;
  const sign = signed ? (pct >= 0 ? "+" : "-") : "";
  return sign + Math.abs(pct).toFixed(1) + "%";
}

/** Coarse "time ago" label, e.g. "just now", "5m ago", "3h ago", "2d ago". */
export function formatRelativeTime(iso: string): string {
  if (!iso) return iso;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

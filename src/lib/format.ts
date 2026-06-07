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

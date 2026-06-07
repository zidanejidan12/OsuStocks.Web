// Shimmering placeholder. Size it to match the content it stands in for.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton rounded-md ${className ?? ""}`}
    />
  );
}

// Shimmering placeholder. Size it to match the content it stands in for.
// Decorative by default (aria-hidden). For a view that is *only* skeletons
// (no other loading affordance), pass `announce` to surface a single polite
// "Loading" to screen readers via role="status".
export function Skeleton({
  className,
  announce = false,
}: {
  className?: string;
  /** When true, add role="status" + an sr-only "Loading" label. */
  announce?: boolean;
}) {
  if (announce) {
    return (
      <div role="status" className={`skeleton rounded-md ${className ?? ""}`}>
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`skeleton rounded-md ${className ?? ""}`} />
  );
}

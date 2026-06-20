// Inline spinner. The wrapper carries role="status" + an accessible label so the
// spinning ring (decorative) is announced to screen readers as a busy state.
export function Spinner({ label }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className="inline-flex items-center gap-2 text-zinc-400"
    >
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-pink-500"
        aria-hidden="true"
      />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

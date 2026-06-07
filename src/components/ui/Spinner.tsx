export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-zinc-400">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-pink-500"
        aria-hidden="true"
      />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}

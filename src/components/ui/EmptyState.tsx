import type { ReactNode } from "react";

// Composed empty state. Pass an `icon` node (e.g. a Phosphor glyph) for context.
export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-500">
          {icon}
        </div>
      )}
      <div className="font-medium text-zinc-100">{title}</div>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-zinc-400">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

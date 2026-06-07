import type { ReactNode } from "react";

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
      <div className="font-medium text-zinc-200">{title}</div>
      {message && <p className="mt-1 text-sm text-zinc-400">{message}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

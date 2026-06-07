import type { ReactNode } from "react";

// Elevated surface. Tinted, wide-spreading shadow for depth without clutter.
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.8)] ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}

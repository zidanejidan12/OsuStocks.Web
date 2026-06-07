import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}

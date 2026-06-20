import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "danger";
type Size = "sm" | "md";

const TONES: Record<Tone, string> = {
  neutral: "bg-zinc-800/70 text-zinc-300 ring-zinc-700/50",
  accent: "bg-pink-500/15 text-pink-300 ring-pink-500/30",
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  danger: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function Badge({
  children,
  tone = "neutral",
  size = "sm",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset ${SIZES[size]} ${TONES[tone]} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}

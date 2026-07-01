import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 disabled:pointer-events-none disabled:opacity-50";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-pink-500 text-white hover:bg-pink-400 shadow-[0_10px_30px_-12px_rgba(236,72,153,0.7)]",
  secondary:
    "border border-zinc-700/80 bg-zinc-900/60 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/70 btn-secondary",
  ghost: "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100",
  danger:
    "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_10px_30px_-12px_rgba(244,63,94,0.7)]",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_10px_30px_-12px_rgba(16,185,129,0.7)]",
};

// Shared button styling so <button>, <Link>, and <MagneticButton> all match.
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${
    fullWidth ? "w-full" : ""
  } ${className}`
    .replace(/\s+/g, " ")
    .trim();
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  type = "button",
  disabled,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** When true: disables the button, sets aria-busy, and shows a leading spinner. */
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

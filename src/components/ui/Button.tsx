import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
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
    "border border-zinc-700/80 bg-zinc-900/60 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800/70",
  ghost: "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500",
};

// Shared button styling so <button>, <Link>, and <MagneticButton> all match.
export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

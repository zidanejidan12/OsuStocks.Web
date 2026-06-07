"use client";

// "Live" indicator with an infinite breathing ring. Memoized + isolated so the
// perpetual animation never re-renders its parent.
import { memo } from "react";
import { motion } from "framer-motion";

type Tone = "emerald" | "pink" | "amber";

function StatusDotBase({
  tone = "emerald",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const color =
    tone === "pink"
      ? "bg-pink-500"
      : tone === "amber"
        ? "bg-amber-400"
        : "bg-emerald-400";

  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <motion.span
        aria-hidden="true"
        className={`absolute inline-flex h-full w-full rounded-full ${color}`}
        animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

export const StatusDot = memo(StatusDotBase);

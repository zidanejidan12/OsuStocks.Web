"use client";

// App-wide Framer Motion configuration. `reducedMotion="user"` makes every
// motion component honor the OS "reduce motion" setting — Framer skips transform
// animations (the infinite marquee/float, scroll-reveal slides, route
// transitions) while keeping opacity. The CSS-only media query in globals.css
// can't reach Framer's JS-driven animations, so this is the piece that does.
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

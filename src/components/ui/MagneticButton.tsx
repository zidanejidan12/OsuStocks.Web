"use client";

// Button that pulls toward the cursor. Uses motion values + springs (never
// useState) so the magnetic tracking stays off the React render path.
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { forwardRef, useRef, type ReactNode, type MouseEvent } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    { children, className, strength = 0.35, onClick, type = "button", disabled },
    forwardedRef,
  ) {
    const reduceMotion = useReducedMotion();
    const innerRef = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 14, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 220, damping: 14, mass: 0.5 });

    function setRef(node: HTMLButtonElement | null) {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }

    function handleMove(e: MouseEvent<HTMLButtonElement>) {
      // Reduced motion: never displace, keep x/y at 0.
      if (reduceMotion) return;
      const el = innerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    }

    function reset() {
      x.set(0);
      y.set(0);
    }

    return (
      <motion.button
        ref={setRef}
        type={type}
        disabled={disabled}
        onMouseMove={reduceMotion ? undefined : handleMove}
        onMouseLeave={reduceMotion ? undefined : reset}
        onClick={onClick}
        style={reduceMotion ? undefined : { x: sx, y: sy }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
          className ?? ""
        }`.trim()}
      >
        {children}
      </motion.button>
    );
  },
);

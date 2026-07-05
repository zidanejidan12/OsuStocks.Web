"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

interface ColorScheme {
  bg1: string;
  bg2: string;
  bg3: string;
}

interface PathConfig {
  colors: ColorScheme;
  lightColors: ColorScheme;
  gridOpacity: number;
}

const PATH_CONFIGS: Record<string, PathConfig> = {
  // Default fallback (Home page or other pages)
  default: {
    colors: {
      bg1: "rgba(236, 72, 153, 0.12)", // Pink
      bg2: "rgba(6, 182, 212, 0.12)",  // Cyan
      bg3: "rgba(147, 51, 234, 0.1)",  // Purple
    },
    lightColors: {
      bg1: "rgba(236, 72, 153, 0.16)", // Stronger Pink Aurora
      bg2: "rgba(6, 182, 212, 0.14)",  // Stronger Cyan Aurora
      bg3: "rgba(147, 51, 234, 0.12)",  // Stronger Purple Aurora
    },
    gridOpacity: 0.015,
  },
  "/login": {
    colors: {
      bg1: "rgba(236, 72, 153, 0.22)", // Rich vibrant Pink
      bg2: "rgba(147, 51, 234, 0.18)",  // Deep Purple
      bg3: "rgba(6, 182, 212, 0.14)",   // Light Cyan
    },
    lightColors: {
      bg1: "rgba(236, 72, 153, 0.20)",
      bg2: "rgba(147, 51, 234, 0.16)",
      bg3: "rgba(6, 182, 212, 0.12)",
    },
    gridOpacity: 0.02,
  },
  // Trending page (Fiery, Orange/Rose theme)
  "/trending": {
    colors: {
      bg1: "rgba(249, 115, 22, 0.14)", // Orange
      bg2: "rgba(236, 72, 153, 0.12)", // Pink
      bg3: "rgba(220, 38, 38, 0.08)",  // Red
    },
    lightColors: {
      bg1: "rgba(249, 115, 22, 0.15)",
      bg2: "rgba(236, 72, 153, 0.12)",
      bg3: "rgba(220, 38, 38, 0.08)",
    },
    gridOpacity: 0.012,
  },
  // Leaderboard page (Majestic, Gold/Indigo theme)
  "/leaderboard": {
    colors: {
      bg1: "rgba(234, 179, 8, 0.14)",  // Gold/Yellow
      bg2: "rgba(99, 102, 241, 0.12)", // Indigo
      bg3: "rgba(236, 72, 153, 0.08)", // Pink
    },
    lightColors: {
      bg1: "rgba(234, 179, 8, 0.15)",
      bg2: "rgba(99, 102, 241, 0.12)",
      bg3: "rgba(236, 72, 153, 0.08)",
    },
    gridOpacity: 0.02,
  },
  // About page (Calm, Emerald/Cyan/Teal theme)
  "/about": {
    colors: {
      bg1: "rgba(16, 185, 129, 0.12)", // Emerald
      bg2: "rgba(6, 182, 212, 0.12)",  // Cyan
      bg3: "rgba(59, 130, 246, 0.08)",  // Blue
    },
    lightColors: {
      bg1: "rgba(16, 185, 129, 0.14)",
      bg2: "rgba(6, 182, 212, 0.12)",
      bg3: "rgba(59, 130, 246, 0.08)",
    },
    gridOpacity: 0.01,
  },
  // Portfolio page (Vivid Pink/Purple/Rose theme)
  "/portfolio": {
    colors: {
      bg1: "rgba(236, 72, 153, 0.16)", // Vivid Pink
      bg2: "rgba(147, 51, 234, 0.14)",  // Vivid Purple/Violet
      bg3: "rgba(244, 63, 94, 0.1)",    // Rose
    },
    lightColors: {
      bg1: "rgba(236, 72, 153, 0.18)",
      bg2: "rgba(147, 51, 234, 0.16)",
      bg3: "rgba(244, 63, 94, 0.12)",
    },
    gridOpacity: 0.018,
  },
};

export function OsuAuroraBackground() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isLightMode, setIsLightMode] = useState(false);
  // Framer-motion runs on JS, so the sitewide CSS prefers-reduced-motion rule
  // can't reach it — gate the scroll parallax here.
  const reduce = useReducedMotion();

  // Theme observer
  useEffect(() => {
    const checkLightMode = () => {
      setIsLightMode(document.documentElement.classList.contains("light"));
    };
    checkLightMode();
    const observer = new MutationObserver(checkLightMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const config = PATH_CONFIGS[pathname] || PATH_CONFIGS.default;
  const activeColors = isLightMode ? config.lightColors : config.colors;

  // Different translation mappings for layers of backgrounds
  const y1 = useTransform(scrollY, [0, 1500], [0, -180]);
  const yApproach = useTransform(scrollY, [0, 1500], [0, -120]);
  const opacityGrid = useTransform(scrollY, [0, 800], [1, 0.25]);

  const gridColor = isLightMode
    ? `rgba(28, 21, 28, ${config.gridOpacity * 2.2})` 
    : `rgba(255, 255, 255, ${config.gridOpacity})`;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Moving Aurora Mesh Gradients */}
      <motion.div style={{ y: reduce ? 0 : y1, backgroundColor: activeColors.bg1 }} className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-aurora-1" />

      {/* Grid overlay */}
      <motion.div 
        style={{
          opacity: reduce ? 1 : opacityGrid,
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
        }} 
        className="absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* osu! Approach Circles */}
      <motion.div style={{ y: reduce ? 0 : yApproach }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0">
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/15 shadow-[0_0_15px_rgba(236,72,153,0.08)] animate-approach-1" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.08)] animate-approach-2" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.04)] animate-approach-3" />
      </motion.div>
    </div>
  );
}

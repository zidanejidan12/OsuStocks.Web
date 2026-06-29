"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
      bg1: "rgba(236, 72, 153, 0.05)",
      bg2: "rgba(6, 182, 212, 0.05)",
      bg3: "rgba(147, 51, 234, 0.04)",
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
      bg1: "rgba(236, 72, 153, 0.08)",
      bg2: "rgba(147, 51, 234, 0.06)",
      bg3: "rgba(6, 182, 212, 0.05)",
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
      bg1: "rgba(249, 115, 22, 0.06)",
      bg2: "rgba(236, 72, 153, 0.05)",
      bg3: "rgba(220, 38, 38, 0.03)",
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
      bg1: "rgba(234, 179, 8, 0.06)",
      bg2: "rgba(99, 102, 241, 0.05)",
      bg3: "rgba(236, 72, 153, 0.03)",
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
      bg1: "rgba(16, 185, 129, 0.05)",
      bg2: "rgba(6, 182, 212, 0.05)",
      bg3: "rgba(59, 130, 246, 0.03)",
    },
    gridOpacity: 0.01,
  },
};

const gradientMap: Record<string, string> = {
  yellow: "from-amber-500/30 to-amber-500/5",
  orange: "from-orange-500/30 to-orange-500/5",
  indigo: "from-indigo-500/30 to-indigo-500/5",
  emerald: "from-emerald-500/30 to-emerald-500/5",
  pink: "from-pink-500/30 to-pink-500/5",
  cyan: "from-cyan-500/30 to-cyan-500/5",
  white: "from-white/20 to-white/5",
};

const shadowMap: Record<string, string> = {
  yellow: "rgba(245,158,11,0.2)",
  orange: "rgba(249,115,22,0.2)",
  indigo: "rgba(99,102,241,0.2)",
  emerald: "rgba(16,185,129,0.2)",
  pink: "rgba(236,72,153,0.2)",
  cyan: "rgba(6,182,212,0.2)",
  white: "rgba(255,255,255,0.15)",
};

const lightGradientMap: Record<string, string> = {
  yellow: "from-amber-500/15 to-amber-500/2",
  orange: "from-orange-500/15 to-orange-500/2",
  indigo: "from-indigo-500/15 to-indigo-500/2",
  emerald: "from-emerald-500/15 to-emerald-500/2",
  pink: "from-pink-500/15 to-pink-500/2",
  cyan: "from-cyan-500/15 to-cyan-500/2",
  white: "from-zinc-500/10 to-zinc-500/2",
};

export function OsuAuroraBackground() {
  const pathname = usePathname();
  const [particles, setParticles] = useState<any[]>([]);
  const { scrollY } = useScroll();
  const [isLightMode, setIsLightMode] = useState(false);

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
  const y2 = useTransform(scrollY, [0, 1500], [0, 100]);
  const y3 = useTransform(scrollY, [0, 1500], [0, -70]);
  const yApproach = useTransform(scrollY, [0, 1500], [0, -120]);
  const opacityGrid = useTransform(scrollY, [0, 800], [1, 0.25]);

  useEffect(() => {
    let colors = ["pink", "cyan", "white"];
    if (pathname === "/trending") {
      colors = ["orange", "pink", "white"];
    } else if (pathname === "/leaderboard") {
      colors = ["yellow", "indigo", "white"];
    } else if (pathname === "/about") {
      colors = ["emerald", "cyan", "white"];
    }

    const list = Array.from({ length: 25 }).map((_, i) => {
      const type = Math.random() > 0.4 ? "diamond" : "orb";
      const colorRand = Math.random();
      const color = colorRand > 0.6 ? colors[0] : colorRand > 0.3 ? colors[1] : colors[2];
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: type === "diamond" ? Math.random() * 3 + 2.5 : Math.random() * 25 + 15,
        delay: Math.random() * -10,
        duration: type === "diamond" ? Math.random() * 8 + 6 : Math.random() * 20 + 12,
        type,
        color
      };
    });
    setParticles(list);
  }, [pathname]);

  const isLogin = pathname === "/login";

  const gridColor = isLightMode 
    ? `rgba(28, 21, 28, ${config.gridOpacity})` 
    : `rgba(255, 255, 255, ${config.gridOpacity})`;

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${isLogin ? "" : "animate-hue-shift"}`}>
      {/* Moving Aurora Mesh Gradients */}
      <motion.div style={{ y: y1, backgroundColor: activeColors.bg1 }} className={`absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isLogin ? "" : "animate-aurora-1"}`} />
      <motion.div style={{ y: y2, backgroundColor: activeColors.bg2 }} className={`absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isLogin ? "" : "animate-aurora-2"}`} />
      <motion.div style={{ y: y3, backgroundColor: activeColors.bg3 }} className={`absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[130px] ${isLogin ? "" : "animate-aurora-3"}`} />

      {/* Grid overlay */}
      <motion.div 
        style={{ 
          opacity: opacityGrid,
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`
        }} 
        className="absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* osu! Approach Circles */}
      {!isLogin && (
        <motion.div style={{ y: yApproach }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0">
          <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/15 shadow-[0_0_15px_rgba(236,72,153,0.08)] animate-approach-1" />
          <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.08)] animate-approach-2" />
          <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.04)] animate-approach-3" />
        </motion.div>
      )}

      {/* falling snowflakes (diamonds) & floating blurred orbs */}
      {!isLogin && particles.map((p) => {
        if (p.type === "diamond") {
          const bgGradient = isLightMode 
            ? lightGradientMap[p.color] 
            : gradientMap[p.color];
          const shadowColor = shadowMap[p.color];
          
          return (
            <span
              key={p.id}
              className={`absolute transform rotate-45 bg-gradient-to-tr ${bgGradient} border border-white/10 animate-fall-wobble`}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                top: `-20px`,
                boxShadow: isLightMode ? "none" : `0 0 10px ${shadowColor}`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        } else {
          // Floating blurred orbs
          const bgClassName = isLightMode
            ? p.color === "pink"
              ? "bg-pink-500/3"
              : p.color === "cyan"
              ? "bg-cyan-500/3"
              : "bg-zinc-500/3"
            : p.color === "pink"
            ? "bg-pink-500/5"
            : p.color === "cyan"
            ? "bg-cyan-500/5"
            : "bg-white/5";
          return (
            <span
              key={p.id}
              className={`absolute rounded-full blur-[10px] animate-float-slow ${bgClassName}`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        }
      })}
    </div>
  );
}

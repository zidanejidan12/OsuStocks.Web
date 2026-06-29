"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function OsuAuroraBackground() {
  const [particles, setParticles] = useState<any[]>([]);
  const { scrollY } = useScroll();

  // Different translation mappings for layers of backgrounds
  const y1 = useTransform(scrollY, [0, 1500], [0, -180]);
  const y2 = useTransform(scrollY, [0, 1500], [0, 100]);
  const y3 = useTransform(scrollY, [0, 1500], [0, -70]);
  const yApproach = useTransform(scrollY, [0, 1500], [0, -120]);
  const opacityGrid = useTransform(scrollY, [0, 800], [1, 0.25]);

  useEffect(() => {
    const list = Array.from({ length: 30 }).map((_, i) => {
      const type = Math.random() > 0.4 ? "diamond" : "orb";
      const colorRand = Math.random();
      const color = colorRand > 0.6 ? "pink" : colorRand > 0.3 ? "cyan" : "white";
      return {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: type === "diamond" ? Math.random() * 3 + 2.5 : Math.random() * 30 + 15,
        delay: Math.random() * -10,
        duration: type === "diamond" ? Math.random() * 8 + 6 : Math.random() * 20 + 12,
        type,
        color
      };
    });
    setParticles(list);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 animate-hue-shift aurora-container">
      {/* Moving Aurora Mesh Gradients */}
      <motion.div style={{ y: y1 }} className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[120px] animate-aurora-1 aurora-bg-1" />
      <motion.div style={{ y: y2 }} className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-aurora-2 aurora-bg-2" />
      <motion.div style={{ y: y3 }} className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[130px] animate-aurora-3 aurora-bg-3" />

      {/* Grid overlay */}
      <motion.div style={{ opacity: opacityGrid }} className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] aurora-grid" />

      {/* osu! Approach Circles */}
      <motion.div style={{ y: yApproach }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0">
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/15 shadow-[0_0_15px_rgba(236,72,153,0.08)] animate-approach-1 approach-circle" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.08)] animate-approach-2 approach-circle" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.04)] animate-approach-3 approach-circle" />
      </motion.div>

      {/* falling snowflakes (diamonds) & floating blurred orbs */}
      {particles.map((p) => {
        if (p.type === "diamond") {
          const bgGradient = p.color === "pink" 
            ? "from-pink-500/35 to-pink-500/5" 
            : p.color === "cyan" 
            ? "from-cyan-500/35 to-cyan-500/5" 
            : "from-white/25 to-white/5";
          const shadowColor = p.color === "pink"
            ? "rgba(236,72,153,0.35)"
            : p.color === "cyan"
            ? "rgba(6,182,212,0.35)"
            : "rgba(255,255,255,0.25)";
          
          return (
            <span
              key={p.id}
              className={`absolute transform rotate-45 bg-gradient-to-tr ${bgGradient} border border-white/15 animate-fall-wobble`}
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                top: `-20px`,
                boxShadow: `0 0 10px ${shadowColor}`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        } else {
          // Floating blurred orbs
          const bgClassName = p.color === "pink"
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

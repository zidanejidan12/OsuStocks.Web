"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export function AmbientCyberBg() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client mount only to avoid SSR hydration differences
    const generated: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage width
      size: Math.random() * 3 + 2, // 2px to 5px
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * -20, // start immediately at random offsets
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      {/* 1. Cyber Grid Background Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] mix-blend-screen"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(236, 72, 153, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(236, 72, 153, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* 2. Scanning Laser/Grid Sweep */}
      <motion.div
        initial={{ y: "-10%" }}
        animate={{ y: "110%" }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-30"
        style={{
          boxShadow: "0 0 15px rgba(236, 72, 153, 0.15)",
        }}
      />

      {/* 3. Ambient Blurry Orbs */}
      {/* Orb 1: Pink Glimmer */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-pink-500/[0.06] blur-[90px]"
      />

      {/* Orb 2: Cyan Glimmer */}
      <motion.div
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 50, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] right-[5%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[110px]"
      />

      {/* Orb 3: Purple Glimmer */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, 30, 45, 0],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[10%] left-[15%] h-[380px] w-[380px] rounded-full bg-purple-600/[0.05] blur-[100px]"
      />

      {/* 4. Floating Digital Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: "105%", x: `${p.x}%` }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            y: "-5%",
            x: [
              `${p.x}%`,
              `${p.x + 3}%`,
              `${p.x - 2}%`,
            ],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          className="absolute rounded-sm bg-pink-400/10 border border-pink-400/20"
          style={{
            width: p.size,
            height: p.size,
            boxShadow: "0 0 8px rgba(236, 72, 153, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

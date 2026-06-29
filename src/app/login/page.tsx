"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn, ShieldCheck } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import { buttonClasses } from "@/components/ui/Button";

interface Snowflake {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: "pink" | "cyan" | "white";
  shape: "diamond" | "circle" | "star";
  swayX: number;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate snowflakes on the client to avoid SSR hydration mismatch
  useEffect(() => {
    const list: Snowflake[] = [];
    const colors: ("pink" | "cyan" | "white")[] = ["pink", "cyan", "white", "white"];
    const shapes: ("diamond" | "circle" | "star")[] = ["diamond", "circle", "diamond"];

    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 7 + 3, // 3px to 10px
        delay: Math.random() * -20, // pre-fill the screen
        duration: Math.random() * 10 + 12, // 12s to 22s
        opacity: Math.random() * 0.45 + 0.15, // 0.15 to 0.60
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        swayX: Math.random() * 50 - 25, // sway path range
      });
    }
    setSnowflakes(list);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientWidth, clientHeight } = e.currentTarget;
    // Normalized values between -1 and 1
    const x = (e.clientX - clientWidth / 2) / (clientWidth / 2);
    const y = (e.clientY - clientHeight / 2) / (clientHeight / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    // Smoothly return to center
    setMousePos({ x: 0, y: 0 });
  };

  // Framer motion variants for staggered entrance
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: 0.12,
        delayChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <main 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100dvh-4rem)] w-full flex items-center justify-center overflow-hidden py-10 px-4 sm:px-6 select-none perspective-[1000px]"
    >
      {/* Inject custom CSS keyframes for snowflake sway and breathing border glow */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall-sway {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: var(--target-opacity);
          }
          90% {
            opacity: var(--target-opacity);
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(var(--sway-x));
            opacity: 0;
          }
        }
        @keyframes border-glow-pulse {
          0%, 100% {
            border-color: rgba(236, 72, 153, 0.2);
            box-shadow: 
              0 25px 60px rgba(0, 0, 0, 0.7), 
              0 0 25px rgba(236, 72, 153, 0.05),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
          }
          50% {
            border-color: rgba(6, 182, 212, 0.45);
            box-shadow: 
              0 25px 60px rgba(0, 0, 0, 0.75), 
              0 0 35px rgba(6, 182, 212, 0.22),
              inset 0 1px 1px rgba(255, 255, 255, 0.08);
          }
        }
        .breathing-card {
          animation: border-glow-pulse 6s ease-in-out infinite;
        }
        @keyframes spin-clockwise {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-counterclockwise {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .animate-tech-ring-1 {
          animation: spin-clockwise 45s linear infinite;
        }
        .animate-tech-ring-2 {
          animation: spin-counterclockwise 35s linear infinite;
        }
        @keyframes electro-flow {
          0% {
            stroke-dashoffset: 900;
          }
          100% {
            stroke-dashoffset: -900;
          }
        }
        .electro-path {
          stroke-dasharray: 80 500;
          animation: electro-flow 8s linear infinite;
        }
        .electro-delay-1 { animation-delay: 1.5s; animation-duration: 9s; }
        .electro-delay-2 { animation-delay: 3s; animation-duration: 7s; }
        .electro-delay-3 { animation-delay: 4.5s; animation-duration: 10s; }
        .electro-delay-4 { animation-delay: 0.5s; animation-duration: 8.5s; }
        .electro-delay-5 { animation-delay: 2s; animation-duration: 7.5s; }
        .electro-delay-6 { animation-delay: 5.5s; animation-duration: 9.5s; }

        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .node-glow {
          animation: pulse-opacity 2.5s ease-in-out infinite;
        }
        .node-glow-delay-1 {
          animation: pulse-opacity 2.5s ease-in-out infinite;
          animation-delay: 0.8s;
        }
        .node-glow-delay-2 {
          animation: pulse-opacity 2.5s ease-in-out infinite;
          animation-delay: 1.6s;
        }
        @keyframes music-float-horizontal {
          0%, 100% {
            transform: scaleX(0.4);
            opacity: 0.3;
          }
          50% {
            transform: scaleX(1);
            opacity: 0.8;
            filter: drop-shadow(0 0 4px rgba(236, 72, 153, 0.45));
          }
        }
        @keyframes chart-float {
          0%, 100% {
            transform: scaleY(1);
            opacity: 0.16;
          }
          50% {
            transform: scaleY(1.04);
            opacity: 0.24;
          }
        }
        .animate-chart-float {
          transform-origin: bottom;
          animation: chart-float 7s ease-in-out infinite;
        }
        @keyframes osu-float-beat {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.025); opacity: 1; }
        }
        .animate-osu-float-beat {
          animation: osu-float-beat 5s ease-in-out infinite;
        }
        @keyframes card-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-card-float {
          animation: card-float 6s ease-in-out infinite;
        }
      ` }} />

      {/* Gaming Circuit / Rhythm Pathway Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 hidden md:block"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="neon-glow-pink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint Base Pathway Lines */}
        <g stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1.5" fill="none">
          <path d="M 100,100 L 400,100 L 550,250 L 750,250" />
          <path d="M 100,980 L 400,980 L 550,830 L 750,830" />
          <path d="M 1820,100 L 1520,100 L 1370,250 L 1170,250" />
          <path d="M 1820,980 L 1520,980 L 1370,830 L 1170,830" />
          <path d="M 50,540 L 300,540 L 400,440 L 750,440" />
          <path d="M 1870,540 L 1620,540 L 1520,640 L 1170,640" />
        </g>

        {/* Animated Glowing Electric Overlays */}
        <g fill="none" strokeWidth="2.5">
          <path 
            d="M 100,100 L 400,100 L 550,250 L 750,250" 
            stroke="#ec4899" 
            filter="url(#neon-glow-pink)"
            className="electro-path electro-delay-1"
          />
          <path 
            d="M 100,980 L 400,980 L 550,830 L 750,830" 
            stroke="#06b6d4" 
            filter="url(#neon-glow-cyan)"
            className="electro-path electro-delay-2"
          />
          <path 
            d="M 1820,100 L 1520,100 L 1370,250 L 1170,250" 
            stroke="#06b6d4" 
            filter="url(#neon-glow-cyan)"
            className="electro-path electro-delay-3"
          />
          <path 
            d="M 1820,980 L 1520,980 L 1370,830 L 1170,830" 
            stroke="#ec4899" 
            filter="url(#neon-glow-pink)"
            className="electro-path electro-delay-4"
          />
          <path 
            d="M 50,540 L 300,540 L 400,440 L 750,440" 
            stroke="#ec4899" 
            filter="url(#neon-glow-pink)"
            className="electro-path electro-delay-5"
          />
          <path 
            d="M 1870,540 L 1620,540 L 1520,640 L 1170,640" 
            stroke="#06b6d4" 
            filter="url(#neon-glow-cyan)"
            className="electro-path electro-delay-6"
          />
        </g>

        {/* Pulsing Nodes / Grid Junction Circles */}
        <g className="node-glow">
          <circle cx="100" cy="100" r="5" fill="#ec4899" />
          <circle cx="100" cy="980" r="5" fill="#06b6d4" />
          <circle cx="1820" cy="100" r="5" fill="#06b6d4" />
          <circle cx="1820" cy="980" r="5" fill="#ec4899" />
        </g>
        <g className="node-glow-delay-1">
          <circle cx="50" cy="540" r="5" fill="#ec4899" />
          <circle cx="1870" cy="540" r="5" fill="#06b6d4" />
          
          <circle cx="400" cy="100" r="3.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="400" cy="980" r="3.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="1520" cy="100" r="3.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="1520" cy="980" r="3.5" fill="rgba(255,255,255,0.4)" />
        </g>
        <g className="node-glow-delay-2">
          <circle cx="750" cy="250" r="6" stroke="#ec4899" strokeWidth="1.5" fill="none" />
          <circle cx="750" cy="250" r="2" fill="#ec4899" />

          <circle cx="750" cy="830" r="6" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
          <circle cx="750" cy="830" r="2" fill="#06b6d4" />

          <circle cx="1170" cy="250" r="6" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
          <circle cx="1170" cy="250" r="2" fill="#06b6d4" />

          <circle cx="1170" cy="830" r="6" stroke="#ec4899" strokeWidth="1.5" fill="none" />
          <circle cx="1170" cy="830" r="2" fill="#ec4899" />

          <circle cx="750" cy="440" r="6" stroke="#ec4899" strokeWidth="1.5" fill="none" />
          <circle cx="750" cy="440" r="2" fill="#ec4899" />

          <circle cx="1170" cy="640" r="6" stroke="#06b6d4" strokeWidth="1.5" fill="none" />
          <circle cx="1170" cy="640" r="2" fill="#06b6d4" />
        </g>
      </svg>

      {/* Falling Snowflakes Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {snowflakes.map((s) => {
          let shapeClass = "";
          if (s.shape === "diamond") shapeClass = "rotate-45";
          else if (s.shape === "circle") shapeClass = "rounded-full";
          else shapeClass = "[clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]";

          let colorStyle = "";
          if (s.color === "pink") {
            colorStyle = "bg-gradient-to-tr from-pink-500 to-pink-300 shadow-[0_0_8px_rgba(236,72,153,0.45)]";
          } else if (s.color === "cyan") {
            colorStyle = "bg-gradient-to-tr from-cyan-400 to-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.45)]";
          } else {
            colorStyle = "bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.35)]";
          }

          return (
            <span
              key={s.id}
              className={`absolute top-[-20px] ${shapeClass} ${colorStyle}`}
              style={{
                left: `${s.left}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animation: `fall-sway ${s.duration}s linear infinite`,
                animationDelay: `${s.delay}s`,
                // @ts-ignore
                "--target-opacity": s.opacity,
                "--sway-x": `${s.swayX}px`,
              }}
            />
          );
        })}
      </div>

      {/* Tech Rings Behind Card - outer wrapper rotates, inner wrapper beats */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] sm:w-[550px] sm:h-[550px] pointer-events-none z-0 animate-tech-ring-1">
        <div className="w-full h-full rounded-full border border-dashed border-pink-500/12 animate-osu-float-beat" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[430px] h-[430px] sm:w-[500px] sm:h-[500px] pointer-events-none z-0 animate-tech-ring-2">
        <div className="w-full h-full rounded-full border border-pink-500/5 border-t-cyan-500/12 border-b-cyan-500/12 animate-osu-float-beat" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Background Static Glow 1 - Pink - moves in opposite direction of mouse */}
      <div 
        className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] bg-pink-500/15 rounded-full blur-[120px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(calc(-50% + ${-mousePos.x * 30}px), calc(-50% + ${-mousePos.y * 30}px), 0)`,
        }}
      />
      {/* Background Static Glow 2 - Cyan - moves in opposite direction, slightly offset */}
      <div 
        className="absolute top-[60%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] bg-cyan-500/12 rounded-full blur-[120px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 20}px), 0)`,
        }}
      />
      {/* Background Static Glow 3 - Deep Purple - center ambient */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-purple-600/8 rounded-full blur-[130px] pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(calc(-50% + ${-mousePos.x * 10}px), calc(-50% + ${-mousePos.y * 10}px), 0)`,
        }}
      />

      {/* Stock Market Chart Shadow / Path */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[280px] pointer-events-none z-0 opacity-20 hidden md:block"
        viewBox="0 0 1920 280"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="neon-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Shadow Area below the line */}
        <path
          d="M 0,220 Q 300,110 600,200 T 1200,100 T 1800,170 T 1920,130 L 1920,280 L 0,280 Z"
          fill="url(#chart-grad)"
        />
        {/* Neon Chart Stroke Line */}
        <path
          d="M 0,220 Q 300,110 600,200 T 1200,100 T 1800,170 T 1920,130"
          fill="none"
          stroke="url(#neon-line-grad)"
          strokeWidth="3.5"
          filter="url(#neon-glow-pink)"
          className="animate-chart-float"
        />
      </svg>

      {/* Left Side Equalizer Bars (Gaming visualizer) */}
      <div className="fixed left-1.5 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 flex flex-col items-start gap-[2.5px] sm:gap-[3.5px] w-6 sm:w-12 md:w-16 opacity-20 sm:opacity-35 pointer-events-none z-10">
        {[...Array(18)].map((_, i) => {
          const duration = 3.2 + (i % 6) * 0.45;
          return (
            <span
              key={i}
              className="h-[2px] sm:h-[3px] rounded-r-[1px] bg-gradient-to-r from-pink-500/20 via-pink-500 to-cyan-400"
              style={{
                width: `${15 + (i % 8) * 10}%`,
                // @ts-ignore
                transformOrigin: "left",
                animation: `music-float-horizontal ${duration}s ease-in-out infinite alternate`,
                animationDelay: `${i * -0.2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Right Side Equalizer Bars (Gaming visualizer) */}
      <div className="fixed right-1.5 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-[2.5px] sm:gap-[3.5px] w-6 sm:w-12 md:w-16 opacity-20 sm:opacity-35 pointer-events-none z-10">
        {[...Array(18)].map((_, i) => {
          const duration = 3.2 + (i % 6) * 0.45;
          return (
            <span
              key={i}
              className="h-[2px] sm:h-[3px] rounded-l-[1px] bg-gradient-to-l from-pink-500/20 via-pink-500 to-cyan-400"
              style={{
                width: `${15 + (i % 8) * 10}%`,
                // @ts-ignore
                transformOrigin: "right",
                animation: `music-float-horizontal ${duration}s ease-in-out infinite alternate`,
                animationDelay: `${i * -0.2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main Container with slow floating animation - scalable width */}
      <div className="relative w-full max-w-[370px] sm:max-w-[390px] z-20 animate-card-float">
        
        {/* Login Card with dynamic breathing border glow */}
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass backdrop-blur-3xl bg-zinc-950/55 border border-zinc-800/40 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-9 flex flex-col items-center gap-6 sm:gap-7.5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] relative overflow-hidden group/card hover:border-pink-500/20 transition-all duration-300 breathing-card"
          style={{ transform: "translateZ(0px)" }}
        >
          
          {/* Subtle static gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent pointer-events-none" />

          {/* Header Branding */}
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
            {/* Logo Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-[20px] overflow-hidden border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-transform duration-300 hover:scale-105 animate-osu-float-beat">
              <img 
                src="/logo.jpg" 
                alt="OsuStocks Logo" 
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-3.5xl sm:text-4xl font-black tracking-tight font-display drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
              <span className="text-pink-500 font-extrabold drop-shadow-[0_0_15px_rgba(236,72,153,0.65)] hover:drop-shadow-[0_0_25px_rgba(236,72,153,0.85)] transition-all duration-300">Osu</span>
              <span className="text-zinc-50 dark:text-zinc-100 bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text">Stocks</span>
            </span>
            <p className="text-[9px] sm:text-[10px] text-zinc-500 font-extrabold uppercase tracking-[0.2em] mt-2">
              The Fantasy Stock Market
            </p>
          </motion.div>

          {/* Quick Info text */}
          <motion.div variants={itemVariants} className="text-center max-w-xs space-y-1.5 sm:space-y-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100 font-display tracking-tight">Sign In</h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed px-1">
              Trade your favorite osu! players like stocks. Compete, build your portfolio, and beat the market.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="w-full space-y-3 sm:space-y-3.5">
            <motion.button
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => login("/")}
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                className: "w-full py-3 sm:py-3.5 shadow-[0_4px_25px_rgba(236,72,153,0.3)] hover:shadow-[0_4px_30px_rgba(236,72,153,0.45)] hover:brightness-110 active:scale-98 transition-all duration-200 text-sm sm:text-base",
              })}
            >
              <SignIn size={20} weight="bold" />
              Login with osu!
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => {
                localStorage.setItem(
                  "osustocks.auth",
                  JSON.stringify({ accessToken: "dummy_token", expiresAt: "2099-12-31T23:59:59Z" })
                );
                window.location.href = "/";
              }}
              className={buttonClasses({
                variant: "secondary",
                size: "lg",
                className: "w-full py-3 sm:py-3.5 border border-zinc-850 bg-zinc-900/30 text-zinc-300 hover:text-white hover:border-pink-500/20 hover:bg-zinc-850/30 active:scale-98 transition-all duration-200 text-sm sm:text-base",
              })}
            >
              Bypass & Run UI Mode (Demo)
            </motion.button>
          </motion.div>

          {/* Legal and Security Info */}
          <motion.div variants={itemVariants} className="text-center space-y-2.5 mt-1 sm:mt-2">
            <p className="text-[9px] sm:text-[10px] text-zinc-500 leading-normal max-w-[280px] mx-auto flex items-center justify-center gap-1">
              <ShieldCheck size={13} weight="fill" className="text-pink-500/80 shrink-0" />
              Uses official osu! OAuth connection. Safe & secure.
            </p>
            <div className="text-[9px] sm:text-[10px] text-zinc-500 flex justify-center items-center gap-3.5">
              <Link
                href="/terms"
                className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-pink-300"
              >
                Terms of Use
              </Link>
              <span>&bull;</span>
              <Link
                href="/privacy"
                className="text-zinc-400 underline underline-offset-2 transition-colors hover:text-pink-300"
              >
                Privacy Policy
              </Link>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}

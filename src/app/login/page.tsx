"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn, ShieldCheck } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";

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
            border-color: rgba(236, 72, 153, 0.12);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 15px rgba(236, 72, 153, 0.03);
          }
          50% {
            border-color: rgba(236, 72, 153, 0.35);
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65), 0 0 25px rgba(236, 72, 153, 0.12);
          }
        }
        .breathing-card {
          animation: border-glow-pulse 6s ease-in-out infinite;
        }
      ` }} />

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

      {/* Background Static Glow - moves in opposite direction of mouse to create depth */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-[110px] pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(calc(-50% + ${-mousePos.x * 25}px), calc(-50% + ${-mousePos.y * 25}px), 0)`,
        }}
      />

      {/* Main Container with subtle tilt - scalable width */}
      <div 
        className="relative w-full max-w-[370px] sm:max-w-[390px] transition-transform duration-300 ease-out z-20"
        style={{
          transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0) rotateY(${mousePos.x * 6}deg) rotateX(${-mousePos.y * 6}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        
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
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-[20px] overflow-hidden border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.2)] transition-transform duration-300 hover:scale-105">
              <img 
                src="/logo.jpg" 
                alt="OsuStocks Logo" 
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-3.5xl sm:text-4xl font-black tracking-tight font-display drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
              <span className="text-pink-500 font-extrabold drop-shadow-[0_0_10px_rgba(236,72,153,0.55)]">Osu</span>
              <span className="text-zinc-50 dark:text-zinc-100">Stocks</span>
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
            <MagneticButton
              onClick={() => login("/")}
              className={buttonClasses({
                variant: "primary",
                size: "lg",
                className: "w-full py-3 sm:py-3.5 shadow-[0_4px_25px_rgba(236,72,153,0.3)] hover:shadow-[0_4px_30px_rgba(236,72,153,0.45)] hover:brightness-110 active:scale-98 transition-all duration-200 text-sm sm:text-base",
              })}
            >
              <SignIn size={20} weight="bold" />
              Login with osu!
            </MagneticButton>

            <MagneticButton
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
            </MagneticButton>
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

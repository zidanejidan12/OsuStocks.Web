"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn, ShieldCheck } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import { buttonClasses } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();

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
      className="relative min-h-[calc(100dvh-4rem)] w-full flex items-center justify-center overflow-hidden py-10 px-4 sm:px-6 select-none perspective-[1000px]"
    >
      {/* Inject custom CSS keyframes for the floating logo and card */}
      <style dangerouslySetInnerHTML={{ __html: `
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

      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-pink-500/12 rounded-full blur-[130px] pointer-events-none"
      />

      {/* Main Container with slow floating animation - scalable width */}
      <div className="relative w-full max-w-[370px] sm:max-w-[390px] z-20 animate-card-float">

        {/* Login Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass backdrop-blur-3xl bg-zinc-950/55 border border-zinc-800/40 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-9 flex flex-col items-center gap-6 sm:gap-7.5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] relative overflow-hidden group/card hover:border-pink-500/20 transition-all duration-300"
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
              Sign in with osu! to start trading players and building your portfolio.
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

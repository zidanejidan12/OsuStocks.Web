"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, WarningCircle, Lock, Wallet as WalletIcon, TrendUp, Users, Trophy, Question, ChartLineUp, Plus, Minus, CaretDown, Coins } from "@phosphor-icons/react";
import type { MarketOverview, Paged, StockSort, StockSummary, Wallet } from "@/lib/api/types";
import { getMarketOverview, getStocks, getWallet, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { buttonClasses } from "@/components/ui/Button";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/SponsorCredit";
import { MarketOverviewCards } from "@/components/market/MarketOverviewCards";
import { StockList } from "@/components/market/StockList";
import { LiveMarketPanel } from "@/components/market/LiveMarketPanel";
import { Coin } from "@/components/ui/Coin";
import { Avatar } from "@/components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 25;

function LoginNotice() {
  return (
    <Card>
      <EmptyState
        title="Please log in"
        message="Your session has expired. Sign in again to continue trading."
        icon={<Lock size={22} weight="bold" />}
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
            Log in
          </Link>
        }
      />
    </Card>
  );
}

// Custom Error Notification
function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
      <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Live Trading Activity Popup Component
function LiveActivityPopup() {
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [activeEvent, setActiveEvent] = useState<{
    id: number;
    type: "trade" | "alert" | "reward";
    badgeText: string;
    icon: string;
    avatarUrl: string | null;
    playerName: string;
    title: React.ReactNode;
    subText: React.ReactNode;
  } | null>(null);
  const [visible, setVisible] = useState(false);
  const [imgErrorId, setImgErrorId] = useState<number | null>(null);

  // Fetch real market stock list on mount
  useEffect(() => {
    getStocks({ page: 1, pageSize: 50 })
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setStocks(data.items);
        }
      })
      .catch(() => {
        // Silently fallback if backend is down/unreachable
      });
  }, []);

  useEffect(() => {
    const fallbackPlayers = ["mrekk", "Akolibed", "Lifeline", "Gasha", "Chicony", "Kalanluu", "WhiteCat", "Ryuk", "Intersect"];
    const randomUsernames = [
      "Cookiezi", "peppy", "shigetora", "zidan", "jason", "toy", "HappyStick", 
      "BeasttrollMC", "BTMC", "Azer", "Rafis", "Vaxei", "WubWoofWolf", 
      "Idke", "Rohulk", "Varvalian", "FlyingTuna", "Bubbleman", "Karthy"
    ];

    let timer: any;
    let fadeOutTimer: any;

    const showNextEvent = () => {
      setVisible(false);
      
      fadeOutTimer = setTimeout(() => {
        let playerName = "";
        let playerTicker = "";
        let playerPrice = 100;
        let playerChange = 0;
        let avatarUrl = null;

        if (stocks.length > 0) {
          const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
          playerName = randomStock.playerName;
          playerTicker = randomStock.stockId;
          playerPrice = randomStock.currentPrice;
          playerChange = randomStock.priceChange24h;
          avatarUrl = randomStock.avatarUrl ?? null;
        } else {
          playerName = fallbackPlayers[Math.floor(Math.random() * fallbackPlayers.length)];
          playerTicker = playerName.toUpperCase().substring(0, 4);
          playerPrice = Math.floor(Math.random() * 800) + 150;
          playerChange = (Math.random() * 25) - 10;
        }

        const buyer = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
        const amount = Math.floor(Math.random() * 25) + 2;
        const totalCredits = (amount * playerPrice).toLocaleString("en-US", { maximumFractionDigits: 1 });

        // Choose event type: "buy", "sell", "surge", "reward", "volume"
        const eventTypes = ["buy", "sell", "surge", "reward", "volume"];
        const chosenType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        let activeEv: {
          type: "trade" | "alert" | "reward";
          badgeText: string;
          icon: string;
          avatar: string | null;
          title: React.ReactNode;
          subText: React.ReactNode;
        };

        if (chosenType === "buy") {
          activeEv = {
            type: "trade",
            badgeText: "Live Buy",
            icon: "🛒",
            avatar: avatarUrl,
            title: (
              <span className="text-zinc-300 text-xs sm:text-sm">
                <strong className="text-zinc-50 font-semibold">{buyer}</strong> bought{" "}
                <strong className="text-pink-400 font-semibold">{amount} shares</strong> of{" "}
                <span className="text-zinc-100 font-semibold">{playerName}</span>
              </span>
            ),
            subText: (
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                Total: <span className="text-cyan-400 font-bold">{totalCredits} Cr</span> • Price: <span className="text-zinc-300">{playerPrice.toFixed(1)}</span>
              </span>
            )
          };
        } else if (chosenType === "sell") {
          activeEv = {
            type: "trade",
            badgeText: "Live Sell",
            icon: "💸",
            avatar: avatarUrl,
            title: (
              <span className="text-zinc-300 text-xs sm:text-sm">
                <strong className="text-zinc-50 font-semibold">{buyer}</strong> sold{" "}
                <strong className="text-zinc-400 font-semibold">{amount} shares</strong> of{" "}
                <span className="text-zinc-100 font-semibold">{playerName}</span>
              </span>
            ),
            subText: (
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                Total: <span className="text-zinc-300 font-semibold">{totalCredits} Cr</span> • Price: <span className="text-zinc-300">{playerPrice.toFixed(1)}</span>
              </span>
            )
          };
        } else if (chosenType === "surge") {
          const isSurge = playerChange >= 0;
          activeEv = {
            type: "alert",
            badgeText: isSurge ? "Price Surge" : "Price Dip",
            icon: isSurge ? "📈" : "📉",
            avatar: avatarUrl,
            title: (
              <span className="text-zinc-300 text-xs sm:text-sm">
                <span className="text-zinc-50 font-semibold">{playerName} ({playerTicker})</span>{" "}
                {isSurge ? "surged" : "dipped"}{" "}
                <span className={isSurge ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {isSurge ? "+" : ""}{playerChange.toFixed(2)}%
                </span>
              </span>
            ),
            subText: (
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                Current Price: <span className="text-zinc-100 font-bold">{playerPrice.toFixed(1)} Cr</span>
              </span>
            )
          };
        } else if (chosenType === "reward") {
          activeEv = {
            type: "reward",
            badgeText: "Daily Reward",
            icon: "💰",
            avatar: null,
            title: (
              <span className="text-zinc-300 text-xs sm:text-sm">
                <strong className="text-zinc-50 font-semibold">{buyer}</strong> claimed their daily credits
              </span>
            ),
            subText: (
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                Bonus: <span className="text-amber-400 font-bold">+1,000 Credits</span>
              </span>
            )
          };
        } else {
          activeEv = {
            type: "alert",
            badgeText: "Volume Spike",
            icon: "⚡",
            avatar: avatarUrl,
            title: (
              <span className="text-zinc-300 text-xs sm:text-sm">
                Trading activity spiking for{" "}
                <span className="text-zinc-50 font-semibold">{playerName} ({playerTicker})</span>
              </span>
            ),
            subText: (
              <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                24h Change: <span className={playerChange >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{playerChange >= 0 ? "+" : ""}{playerChange.toFixed(2)}%</span>
              </span>
            )
          };
        }

        setImgErrorId(null);
        setActiveEvent({
          id: Date.now(),
          type: activeEv.type,
          badgeText: activeEv.badgeText,
          icon: activeEv.icon,
          avatarUrl: activeEv.avatar,
          playerName: playerName,
          title: activeEv.title,
          subText: activeEv.subText,
        });
        setVisible(true);
      }, 400);
    };

    timer = setTimeout(showNextEvent, 2000);
    const interval = setInterval(showNextEvent, 9000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fadeOutTimer);
      clearInterval(interval);
    };
  }, [stocks]);

  if (!activeEvent) return null;

  const glowColorClass = activeEvent.type === "alert"
    ? "from-pink-500/5 via-transparent to-transparent"
    : activeEvent.type === "trade"
    ? "from-cyan-500/5 via-transparent to-transparent"
    : "from-amber-500/5 via-transparent to-transparent";

  const glowShadow = activeEvent.type === "alert"
    ? "shadow-[0_8px_30px_rgba(236,72,153,0.06)]"
    : activeEvent.type === "trade"
    ? "shadow-[0_8px_30px_rgba(6,182,212,0.06)]"
    : "shadow-[0_8px_30px_rgba(245,158,11,0.06)]";

  const badgeClass = activeEvent.type === "alert"
    ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
    : activeEvent.type === "trade"
    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
    : "bg-amber-500/10 text-amber-400 border border-amber-500/20";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-[20px] p-5 pb-6 border border-zinc-800/80 bg-gradient-to-br ${glowColorClass} bg-zinc-950/95 backdrop-blur-2xl ${glowShadow} transition-all duration-500 ease-out transform ${
        visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Dynamic Avatar Container */}
        <div className="relative shrink-0 select-none">
          {activeEvent.avatarUrl && imgErrorId !== activeEvent.id ? (
            <div className="relative h-11 w-11 overflow-hidden rounded-[14px] ring-2 ring-zinc-900/50 bg-zinc-900 border border-zinc-800/50 flex items-center justify-center">
              <img 
                src={activeEvent.avatarUrl} 
                alt="" 
                className="h-full w-full object-cover"
                onError={() => {
                  setImgErrorId(activeEvent.id);
                }}
              />
            </div>
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold border border-zinc-700/30 ring-2 ring-zinc-900/50 text-zinc-300">
              {activeEvent.playerName ? activeEvent.playerName.substring(0, 2).toUpperCase() : activeEvent.icon}
            </div>
          )}
          
          {/* Circular badge indicator at the corner of the avatar */}
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-[10px] border border-zinc-800 shadow-sm">
            {activeEvent.icon}
          </span>
        </div>

        {/* Details and Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
              {activeEvent.badgeText}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Just now
            </span>
          </div>
          
          <div className="mt-2 text-sm leading-snug">
            {activeEvent.title}
          </div>
          
          <div className="mt-1.5 flex items-center justify-between">
            {activeEvent.subText}
          </div>
        </div>
      </div>
      
      {/* Visual countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-zinc-900/30 overflow-hidden rounded-b-2xl">
        <div 
          className={`h-full bg-gradient-to-r ${
            activeEvent.type === "alert"
              ? "from-pink-500 to-rose-500"
              : activeEvent.type === "trade"
              ? "from-cyan-500 to-blue-500"
              : "from-amber-500 to-yellow-500"
          } transition-all linear`}
          style={{ 
            width: visible ? "100%" : "0%",
            transitionDuration: visible ? "8200ms" : "0ms"
          }}
        />
      </div>
    </div>
  );
}

// Premium Background Layer
function OsuAuroraBackground() {
  const [particles, setParticles] = useState<any[]>([]);

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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 animate-hue-shift">
      {/* Moving Aurora Mesh Gradients */}
      <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-pink-500/10 blur-[120px] animate-aurora-1" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px] animate-aurora-2" />
      <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[130px] animate-aurora-3" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* osu! Approach Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0">
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/15 shadow-[0_0_15px_rgba(236,72,153,0.08)] animate-approach-1" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.08)] animate-approach-2" />
        <div className="absolute top-1/2 left-1/2 w-full h-full rounded-full border border-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.04)] animate-approach-3" />
      </div>

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
                animationIterationCount: "infinite",
                animationTimingFunction: "linear"
              }}
            />
          );
        } else {
          const colorClass = p.color === "pink"
            ? "bg-pink-500/3"
            : p.color === "cyan"
            ? "bg-cyan-500/3"
            : "bg-zinc-400/2";
          
          return (
            <span
              key={p.id}
              className={`absolute rounded-full blur-xl animate-float ${colorClass}`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                animationIterationCount: "infinite"
              }}
            />
          );
        }
      })}
    </div>
  );
}

// Hero Landing Module
function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative w-full min-h-[75vh] flex items-center pt-12 pb-16 sm:pt-16 sm:pb-20">
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 grid items-center gap-8 md:grid-cols-2 md:gap-10">
        <Reveal>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-zinc-100">
              Trade osu!<br className="hidden md:inline" />
              {" "}players like<br />
              <span className="text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.75)] animate-pulse">stocks.</span>
            </h1>

            <p className="mt-6 max-w-[44ch] text-lg sm:text-xl font-normal leading-relaxed text-zinc-400">
              The ultimate fantasy market for osu! players. Build your portfolio with shares tied directly to live performance, predict the next top plays, and dominate the global leaderboards.
            </p>

            <div className="mt-8 flex flex-wrap justify-center md:justify-start items-center gap-3">
              <MagneticButton
                onClick={onLogin}
                className="relative group overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-semibold text-lg shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-all duration-300 flex items-center gap-3"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                Get Started
                <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform duration-300" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:pl-4">
          <div className="flex flex-col gap-4">
            <SponsorCard />
            <LiveMarketPanel />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <Skeleton className="h-8 w-40" />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 md:col-span-5">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-28 rounded-2xl md:col-span-4" />
        <Skeleton className="h-28 rounded-2xl md:col-span-3" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Skeleton className="h-11 w-full rounded-xl sm:max-w-xs" />
        <Skeleton className="h-11 w-full rounded-xl sm:w-48" />
      </div>
      <Skeleton className="mt-4 h-80 rounded-2xl" />
    </div>
  );
}

function WelcomeBanner({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl p-[1.5px] rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 shadow-[0_20px_50px_rgba(236,72,153,0.2)]"
        >
          <div className="bg-zinc-950/95 backdrop-blur-3xl rounded-[15px] p-5 flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <ChartLineUp size={22} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-zinc-100 flex items-center gap-1.5">
                Welcome to OsuStocks! 📈
              </h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                You have entered the ultimate virtual fantasy stock exchange. Buy & sell shares of your favorite osu! players, track live rank stats, and build your portfolio!
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 text-xs font-bold text-zinc-100 hover:text-white bg-pink-500 hover:bg-pink-600 border border-pink-600/50 shadow-md hover:shadow-lg px-3.5 py-2 rounded-xl transition-all duration-200"
            >
              Let's Trade
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const { user, loading: authLoading, login } = useAuth();

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) {
      const hasSeen = localStorage.getItem("osustocks_welcome_seen");
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setShowWelcome(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleDismissWelcome = () => {
    localStorage.setItem("osustocks_welcome_seen", "true");
    setShowWelcome(false);
  };

  const [overview, setOverview] = useState<MarketOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<StockSort>("change24h_desc");
  const [country, setCountry] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce the search input so we don't fetch on every keystroke. Resetting to
  // page 1 belongs with the query change here, not in a separate state-sync effect.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch the market overview once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect -- intentional: clear stale error/unauthorized before refetching */
    setOverviewError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getMarketOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load market overview.";
        setOverviewError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fetch the wallet once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getWallet()
      .then((data) => {
        if (!cancelled) setWallet(data);
      })
      .catch(() => {
        // fail silently
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Fetch the paged stock list whenever the query parameters change.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    // Intentional skeleton-on-refetch when the page/sort/search query changes;
    // the documented exception to react-hooks/set-state-in-effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    setStocksLoading(true);
    setStocksError(null);
    setUnauthorized(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    getStocks({
      page,
      pageSize: PAGE_SIZE,
      sort,
      search: debouncedSearch || undefined,
      country,
    })
      .then((data: Paged<StockSummary>) => {
        if (cancelled) return;
        setStocks(data.items);
        setTotalCount(data.totalCount ?? data.items.length);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setUnauthorized(true);
          return;
        }
        const message =
          err instanceof ApiError ? err.message : "Failed to load stocks.";
        setStocksError(message);
        setStocks([]);
        setTotalCount(0);
      })
      .finally(() => {
        if (!cancelled) setStocksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, page, sort, country, debouncedSearch]);

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="relative w-full overflow-x-hidden pb-16">
        <OsuAuroraBackground />
        <WelcomeBanner show={showWelcome} onDismiss={handleDismissWelcome} />
        <LiveActivityPopup />
        <Hero onLogin={() => login("/")} />
        <StatsSection />
        <HowItWorksSection />
        <InteractiveChartSection />
        <FaqSection />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Decorative ambient light gradients */}
      <div className="absolute top-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-900 pb-8 mb-8">
          {/* Welcome User Section */}
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatarUrl}
              name={user.username}
              size="lg"
              className="ring-2 ring-pink-500/20"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tighter text-zinc-100 sm:text-3xl">
                  {user.username}
                </h1>
                {user.equippedTitle && (
                  <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-medium text-pink-400 border border-pink-500/20">
                    {user.equippedTitle}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Good to see you back on the stock market today.
              </p>
            </div>
          </div>

          {/* Quick Wallet Stats Widget */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 min-w-[200px]">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <WalletIcon size={20} weight="bold" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 block font-medium">Available Balance</span>
              <span className="text-lg font-mono font-bold text-zinc-100 tabular-nums flex items-center gap-1.5 mt-0.5">
                <Coin />
                {wallet ? wallet.balance.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "..."}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Market Title and Status */}
      <Reveal delay={0.02}>
        <div className="flex items-end justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold tracking-tighter text-zinc-100 sm:text-2xl">
              Market Overview
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20">
              <StatusDot tone="cyan" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-400">
                Live
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {unauthorized ? (
        <div className="mt-8">
          <LoginNotice />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {overviewError ? (
            <ErrorNotice message={overviewError} />
          ) : overview ? (
            <Reveal delay={0.05}>
              <MarketOverviewCards overview={overview} />
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="grid grid-cols-2 gap-4 md:col-span-5">
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </div>
              <Skeleton className="h-28 rounded-2xl md:col-span-4" />
              <Skeleton className="h-28 rounded-2xl md:col-span-3" />
            </div>
          )}

          {stocksError && <ErrorNotice message={stocksError} />}

          <Reveal delay={0.1}>
            <StockList
              stocks={stocks}
              loading={stocksLoading}
              search={search}
              onSearchChange={setSearch}
              sort={sort}
              onSortChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              country={country}
              onCountryChange={(value) => {
                setCountry(value);
                setPage(1);
              }}
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </Reveal>
        </div>
      )}
    </div>
  );
}

// ==========================================
// NEW LANDING PAGE SECTIONS (CLIENT-SIDE ONLY)
// ==========================================

function StatsSection() {
  const stats = [
    { label: "Total Volume Traded", value: "15.8M+ Cr", icon: <Coins size={22} className="text-pink-400" /> },
    { label: "Active Managers", value: "2,400+ Traders", icon: <Users size={22} className="text-cyan-400" /> },
    { label: "Top Players Tracked", value: "15,000+ Stocks", icon: <Trophy size={22} className="text-amber-400" /> },
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s, idx) => (
            <div 
              key={idx}
              className="glass relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all duration-300"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5">
                {s.icon}
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">{s.label}</span>
                <span className="text-lg font-bold text-zinc-100 tracking-tight block mt-0.5">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function HowItWorksSection() {
  const [clickedCard, setClickedCard] = useState<number | null>(null);

  const steps = [
    {
      title: "1. Buy & Sell Shares",
      desc: "Buy shares of your favorite osu! players using virtual coins. Monitor the market, hold your position, and sell when the player performs well.",
      color: "from-pink-500/40 via-pink-500/10 to-transparent",
      accent: "text-pink-400"
    },
    {
      title: "2. Live PP & Rank Sync",
      desc: "Player prices are directly linked to their official osu! performance. If they rank up, set a new top play, or gain PP, their share value skyrockets.",
      color: "from-cyan-500/40 via-cyan-500/10 to-transparent",
      accent: "text-cyan-400"
    },
    {
      title: "3. Build Your Portfolio",
      desc: "Diversify your assets. Compete with other managers globally on the leaderboard, climb the broker ladder, and show off your trading instincts.",
      color: "from-amber-500/40 via-amber-500/10 to-transparent",
      accent: "text-amber-400"
    }
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:py-24">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
            How does <span className="text-pink-400">OsuStocks</span> work?
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            A fully simulated, data-driven fantasy stock exchange based entirely on actual osu! community performance.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const isClicked = clickedCard === idx;
          const isPink = idx === 0;
          const isCyan = idx === 1;
          const isAmber = idx === 2;

          const glowStyles = isClicked
            ? isPink
              ? "border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.45),0_0_50px_rgba(236,72,153,0.2)] bg-pink-500/[0.06]"
              : isCyan
              ? "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45),0_0_50px_rgba(6,182,212,0.2)] bg-cyan-500/[0.06]"
              : "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.45),0_0_50px_rgba(245,158,11,0.2)] bg-amber-500/[0.06]"
            : isPink
            ? "hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:bg-pink-500/[0.03]"
            : isCyan
            ? "hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:bg-cyan-500/[0.03]"
            : "hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:bg-amber-500/[0.03]";

          return (
            <Reveal key={idx} delay={idx * 0.05}>
              <div 
                onClick={() => setClickedCard(isClicked ? null : idx)}
                className={`glass relative group h-full overflow-hidden rounded-3xl p-8 transition-all duration-500 cursor-pointer border ${glowStyles}`}
              >
                {/* Soft corner color glow */}
                <div className={"absolute top-0 right-0 w-24 h-24 bg-gradient-to-br " + step.color + " rounded-bl-full opacity-40 pointer-events-none group-hover:opacity-75 transition-all duration-300"} />
                
                <h3 className={"text-xl font-bold tracking-tight " + step.accent}>{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

const MOCK_PREVIEW_PLAYERS = [
  {
    id: "mrekk",
    name: "mrekk",
    rank: "#1 Global",
    price: 2450.5,
    change: "+15.2%",
    color: "pink",
    chartPath: "M 0 130 C 50 145, 100 90, 150 110 C 200 65, 250 135, 300 45",
    points: [{x: 0, y: 130}, {x: 50, y: 145}, {x: 100, y: 90}, {x: 150, y: 110}, {x: 200, y: 65}, {x: 250, y: 135}, {x: 300, y: 45}],
    avatar: "https://a.ppy.sh/2211396",
  },
  {
    id: "akolibed",
    name: "Akolibed",
    rank: "#2 Global",
    price: 2310.0,
    change: "+8.7%",
    color: "cyan",
    chartPath: "M 0 115 C 50 120, 100 100, 150 115 C 200 80, 250 90, 300 60",
    points: [{x: 0, y: 115}, {x: 50, y: 120}, {x: 100, y: 100}, {x: 150, y: 115}, {x: 200, y: 80}, {x: 250, y: 90}, {x: 300, y: 60}],
    avatar: "https://a.ppy.sh/9269014",
  },
  {
    id: "lifeline",
    name: "Lifeline",
    rank: "#4 Global",
    price: 1850.2,
    change: "+4.1%",
    color: "amber",
    chartPath: "M 0 140 C 50 130, 100 135, 150 110 C 200 120, 250 95, 300 85",
    points: [{x: 0, y: 140}, {x: 50, y: 130}, {x: 100, y: 135}, {x: 150, y: 110}, {x: 200, y: 120}, {x: 250, y: 95}, {x: 300, y: 85}],
    avatar: "https://a.ppy.sh/11311039",
  }
];

function InteractiveChartSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"buy" | "sell">("buy");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; svgX: number; svgY: number; visible: boolean; price: string }>({
    x: 0, y: 0, svgX: 0, svgY: 0, visible: false, price: ""
  });

  const player = MOCK_PREVIEW_PLAYERS[activeIndex];
  const colorHex = player.color === "pink" ? "#ec4899" : player.color === "cyan" ? "#06b6d4" : "#f59e0b";

  const triggerAlert = (msg: string, type: "buy" | "sell") => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 2500);
  };

  const handleBuy = () => {
    setSharesOwned(prev => prev + 1);
    triggerAlert("+1 Share of " + player.name + " bought successfully!", "buy");
  };

  const handleSell = () => {
    if (sharesOwned <= 0) {
      triggerAlert("You don't own any shares of this player to sell!", "sell");
      return;
    }
    setSharesOwned(prev => prev - 1);
    triggerAlert("-1 Share of " + player.name + " sold successfully!", "sell");
  };

  const getSvgY = (pct: number, points: { x: number; y: number }[]) => {
    const targetX = pct * 300;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (targetX >= p1.x && targetX <= p2.x) {
        const ratio = (targetX - p1.x) / (p2.x - p1.x);
        return p1.y + ratio * (p2.y - p1.y);
      }
    }
    return points[points.length - 1].y;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const priceVal = player.price - (1 - pct) * 200 + Math.sin(pct * 10) * 45;
    
    const svgX = pct * 300;
    const svgY = getSvgY(pct, player.points);
    
    setTooltipPos({
      x,
      y: (svgY / 150) * rect.height,
      svgX,
      svgY,
      visible: true,
      price: priceVal.toFixed(1)
    });
  };

  const handleMouseLeave = () => {
    setTooltipPos(prev => ({ ...prev, visible: false }));
  };

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
            Experience the <span className="text-cyan-400">Trade Simulator</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Test the interface in real time below. Switch players, view price histories, and simulate buy/sell transactions.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glow-card relative overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-500" style={{ backgroundColor: colorHex }} />
          
          <div className={"absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold border backdrop-blur-md shadow-lg transition-all duration-300 " + (
            alertMsg ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          ) + " " + (
            alertType === "buy" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5" 
              : "bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5"
          )}>
            {alertMsg}
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex flex-col justify-between w-full lg:w-1/3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-4">
                  Tradable Players
                </span>
                <div className="flex flex-col gap-2">
                  {MOCK_PREVIEW_PLAYERS.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveIndex(idx);
                        setSharesOwned(0);
                      }}
                      className={"flex items-center gap-3.5 px-4 py-3 rounded-2xl border text-left transition-all duration-300 " + (
                        activeIndex === idx
                          ? "bg-zinc-900/40 border-zinc-800/80 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                          : "bg-transparent border-transparent hover:bg-zinc-900/20"
                      )}
                    >
                      <Avatar src={p.avatar} name={p.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-zinc-200 block">{p.name}</span>
                        <span className="text-xs text-zinc-500 block">{p.rank}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-zinc-300 block">{p.price.toFixed(1)}</span>
                        <span className={"text-xs font-semibold block " + (p.change.startsWith("+") ? "text-emerald-400" : "text-rose-400")}>{p.change}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-zinc-400 font-medium">Your Virtual Holdings</span>
                  <span className="text-xs font-mono font-bold text-zinc-100 flex items-center gap-1">
                    {sharesOwned} Shares
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBuy}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm border border-pink-600/50 transition-all duration-300 shadow-[0_2px_10px_rgba(236,72,153,0.2)] hover:shadow-[0_4px_16px_rgba(236,72,153,0.3)] active:scale-[0.98]"
                  >
                    <Plus size={14} weight="bold" />
                    Buy Share
                  </button>
                  <button
                    onClick={handleSell}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-semibold text-sm border border-zinc-800/80 transition-all duration-300 active:scale-[0.98]"
                  >
                    <Minus size={14} weight="bold" />
                    Sell Share
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between rounded-[20px] bg-zinc-950/20 border border-zinc-900/60 p-5 sm:p-6 min-h-[300px]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-black text-zinc-100 leading-none">{player.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{player.rank}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-black text-zinc-100">{player.price.toFixed(1)} Cr</span>
                    <span className={"text-xs font-bold block mt-1 " + (player.change.startsWith("+") ? "text-emerald-400" : "text-rose-400")}>
                      {player.change} (24h)
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-900/60 pt-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Market Cap</span>
                    <span className="text-sm font-semibold text-zinc-300 block mt-0.5">
                      {(player.price * 10000).toLocaleString("en-US", { maximumFractionDigits: 0 })} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">24h High</span>
                    <span className="text-sm font-semibold text-emerald-500 block mt-0.5">
                      {(player.price * 1.045).toFixed(1)} Cr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">24h Low</span>
                    <span className="text-sm font-semibold text-rose-500 block mt-0.5">
                      {(player.price * 0.942).toFixed(1)} Cr
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex-1 flex items-end h-[160px] sm:h-[200px] mt-6 select-none">
                <svg
                  className="w-full h-full cursor-crosshair overflow-visible"
                  viewBox="0 0 300 150"
                  preserveAspectRatio="none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient id={"grad-" + player.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colorHex} stopOpacity="0.18" />
                      <stop offset="100%" stopColor={colorHex} stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d={player.chartPath + " L 300 150 L 0 150 Z"}
                    fill={"url(#grad-" + player.id + ")"}
                    className="transition-all duration-500 ease-out"
                  />

                  <path
                    d={player.chartPath}
                    fill="none"
                    stroke={colorHex}
                    strokeWidth="2.5"
                    className="transition-all duration-500 ease-out"
                    style={{ filter: "drop-shadow(0 0 6px " + colorHex + "80)" }}
                  />

                  {tooltipPos.visible && (
                    <>
                      <line
                        x1={tooltipPos.svgX}
                        y1="0"
                        x2={tooltipPos.svgX}
                        y2="150"
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                        className="pointer-events-none"
                      />
                      <circle
                        cx={tooltipPos.svgX}
                        cy={tooltipPos.svgY}
                        r="5"
                        fill={colorHex}
                        stroke="#fff"
                        strokeWidth="2"
                        className="pointer-events-none"
                        style={{ filter: "drop-shadow(0 0 6px " + colorHex + ")" }}
                      />
                    </>
                  )}
                </svg>

                {tooltipPos.visible && (
                  <div
                    className="absolute bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 text-[11px] font-mono font-bold text-zinc-100 px-3 py-1.5 rounded-xl shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                      left: tooltipPos.x + "px",
                      top: (tooltipPos.y - 12) + "px"
                    }}
                  >
                    {tooltipPos.price} Cr
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      q: "Is this real money or real investing?",
      a: "No! OsuStocks is 100% virtual and free to play. The coins, shares, and portfolio values are exclusively for fun and virtual competition. You cannot buy or withdraw coins for real-world money, and there is no gambling involved."
    },
    {
      q: "How are player share prices calculated?",
      a: "Prices are calculated dynamically using an algorithm tied to a player's official osu! performance metrics (Performance Points (PP), global rank, and active play history) combined with our internal buying and selling supply/demand."
    },
    {
      q: "How often do player prices update?",
      a: "The market syncs periodically to update stats from the official osu! leaderboards. Price fluctuations triggered by trades on OsuStocks happen in real-time."
    },
    {
      q: "Can I list my own name as a stock?",
      a: "The platform automatically tracks the top 15,000 global osu! players. If you reach the global ranking threshold, you will automatically become a tradable stock for managers to invest in!"
    }
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <Reveal>
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight text-zinc-100 sm:text-4xl">
            Frequently Asked <span className="text-amber-400">Questions</span>
          </h2>
        </div>
      </Reveal>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => (
          <Reveal key={idx} delay={idx * 0.05}>
            <FaqItem q={faq.q} a={faq.a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={"glass overflow-hidden rounded-2xl transition-all duration-300 " + (
      isOpen 
        ? "border-pink-500/20 bg-zinc-950/40 shadow-[0_4px_20px_rgba(236,72,153,0.04)]" 
        : "hover:border-zinc-700/50"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-sm sm:text-base text-zinc-200 transition-colors hover:text-zinc-100"
      >
        {isOpen && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-pink-500 animate-pulse" />
        )}
        <span className={isOpen ? "pl-3 transition-all duration-300" : "pl-0 transition-all duration-300"}>{q}</span>
        <CaretDown 
          size={16} 
          weight="bold" 
          className={"text-zinc-500 transition-transform duration-300 " + (isOpen ? "rotate-180 text-pink-400" : "")} 
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-zinc-900/60"
          >
            <div className="p-5 pt-4 pl-8">
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

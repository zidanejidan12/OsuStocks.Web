export interface WalletTier {
  name: string;
  threshold: number;
  feeRate: number;
  color: string;
  cardStyle: string; // Outer glowing border styles
  bgStyle: string;   // Inner card gradient background
  textStyle: string; // Custom card text accents
}

export const WALLET_TIERS: WalletTier[] = [
  {
    name: "Basic Card",
    threshold: 0,
    feeRate: 0.02, // 2.0%
    color: "text-zinc-400 border-zinc-700/30 bg-zinc-955/20 shadow-[0_0_12px_rgba(113,113,122,0.1)]",
    cardStyle: "from-zinc-800/80 via-zinc-700/30 to-zinc-900 hover:from-zinc-500/40 hover:via-zinc-650/20 hover:to-zinc-600/30",
    bgStyle: "from-zinc-950 via-zinc-900/98 to-zinc-950",
    textStyle: "text-zinc-450",
  },
  {
    name: "Bronze Card",
    threshold: 1000,
    feeRate: 0.01, // 1.0%
    color: "text-orange-400 border-orange-500/20 bg-orange-955/20 shadow-[0_0_12px_rgba(249,115,22,0.1)]",
    cardStyle: "from-orange-800/80 via-orange-900/30 to-zinc-900 hover:from-orange-600/40 hover:via-orange-700/20 hover:to-orange-800/30",
    bgStyle: "from-amber-955/90 via-zinc-900/98 to-zinc-950",
    textStyle: "text-amber-500",
  },
  {
    name: "Silver Card",
    threshold: 5000,
    feeRate: 0.005, // 0.5%
    color: "text-zinc-350 border-zinc-500/20 bg-zinc-955/20 shadow-[0_0_12px_rgba(212,212,216,0.1)]",
    cardStyle: "from-slate-700/80 via-slate-600/30 to-zinc-900 hover:from-slate-500/40 hover:via-slate-550/20 hover:to-slate-650/30",
    bgStyle: "from-slate-900/90 via-zinc-900/98 to-zinc-950",
    textStyle: "text-slate-350",
  },
  {
    name: "Gold Card",
    threshold: 10000,
    feeRate: 0.0025, // 0.25%
    color: "text-amber-400 border-amber-500/20 bg-amber-955/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    cardStyle: "from-amber-600/85 via-yellow-750/30 to-zinc-900 hover:from-amber-500/45 hover:via-yellow-600/25 hover:to-yellow-700/35",
    bgStyle: "from-amber-955/80 via-zinc-900/98 to-yellow-955/20",
    textStyle: "text-amber-400",
  },
  {
    name: "Platinum Card",
    threshold: 50000,
    feeRate: 0.00125, // 0.125%
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]",
    cardStyle: "from-cyan-600/85 via-teal-750/30 to-zinc-900 hover:from-cyan-500/45 hover:via-teal-600/25 hover:to-teal-750/35",
    bgStyle: "from-cyan-955/70 via-zinc-900/98 to-teal-955/20",
    textStyle: "text-cyan-400",
  },
  {
    name: "Diamond Card",
    threshold: 100000,
    feeRate: 0.000625, // 0.0625%
    color: "text-fuchsia-400 border-fuchsia-500/25 bg-fuchsia-955/20 shadow-[0_0_12px_rgba(217,70,239,0.2)]",
    cardStyle: "from-fuchsia-600/85 via-purple-750/30 to-zinc-900 hover:from-fuchsia-500/45 hover:via-purple-600/25 hover:to-indigo-755/35",
    bgStyle: "from-fuchsia-955/70 via-zinc-900/98 to-purple-955/20",
    textStyle: "text-fuchsia-400",
  },
  {
    name: "Apex Card",
    threshold: 500000,
    feeRate: 0.0003125, // 0.03125%
    color: "text-rose-455 border-rose-500/30 bg-rose-955/25 shadow-[0_0_15px_rgba(244,63,94,0.25)]",
    cardStyle: "from-rose-600/90 via-pink-750/35 to-zinc-950 hover:from-rose-500/50 hover:via-pink-600/30 hover:to-purple-755/40 animate-pulse-slow",
    bgStyle: "from-rose-955/70 via-zinc-900/98 to-purple-955/30",
    textStyle: "text-rose-400 font-bold animate-pulse",
  },
];

export interface WalletStanding {
  currentTier: WalletTier;
  nextTier: WalletTier | null;
  neededForNext: number;
  progressToNext: number; // 0 to 1
  formattedFee: string;
}

export function getWalletStanding(balance: number): WalletStanding {
  // Sort descending to find the highest matching tier
  const sortedTiers = [...WALLET_TIERS].sort((a, b) => b.threshold - a.threshold);
  const currentTier = sortedTiers.find((t) => balance >= t.threshold) || WALLET_TIERS[0];
  
  // Find index of current tier in original sorted ascending array
  const currentIndex = WALLET_TIERS.findIndex((t) => t.name === currentTier.name);
  const nextTier = currentIndex < WALLET_TIERS.length - 1 ? WALLET_TIERS[currentIndex + 1] : null;
  
  let neededForNext = 0;
  let progressToNext = 1;
  
  if (nextTier) {
    neededForNext = nextTier.threshold - balance;
    const range = nextTier.threshold - currentTier.threshold;
    const currentProgress = balance - currentTier.threshold;
    progressToNext = Math.min(1, Math.max(0, currentProgress / range));
  }
  
  const formattedFee = `${(currentTier.feeRate * 100).toFixed(currentTier.feeRate < 0.001 ? 4 : currentTier.feeRate < 0.01 ? 3 : 1)}%`;

  return {
    currentTier,
    nextTier,
    neededForNext,
    progressToNext,
    formattedFee,
  };
}

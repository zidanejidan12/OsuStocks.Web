import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Leaderboard: top osu! stock traders",
  description:
    "See the top portfolios and richest traders on OsuStocks, the osu! stock market. Climb the ranks by trading osu! player stocks.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

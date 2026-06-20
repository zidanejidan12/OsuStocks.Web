import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Trending — osu! stock market movers",
  description:
    "The most-bought, most-sold, fastest-rising and highest-volume osu! player stocks right now on OsuStocks, the osu! stock market.",
  alternates: { canonical: "/trending" },
};

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

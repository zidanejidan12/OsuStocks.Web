import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — the osu! stock market game",
  description:
    "What is OsuStocks? A fan-made osu! stock market where you trade osu! players like stocks — prices move with pp, rank, and trading. Learn how it works.",
  keywords: [
    "osu stocks",
    "osu stock market",
    "what is osustocks",
    "osu trading game",
    "osu fantasy",
  ],
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

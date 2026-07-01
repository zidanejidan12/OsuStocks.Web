import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "View and track your locked and unlocked trading achievements on OsuStocks. Earn coin rewards for unlocking unique milestones.",
  openGraph: {
    title: "Achievements — OsuStocks",
    description: "Track and view your trading milestones on OsuStocks.",
    type: "website",
  },
};

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

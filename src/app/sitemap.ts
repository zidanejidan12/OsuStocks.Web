import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.osustocks.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Public, indexable pages only. Per-player stock pages are intentionally omitted
  // until the market read API is public (see TASKS / SEO notes) — they'd be thin
  // (auth-gated) content for crawlers today.
  const entries: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "hourly" },
    { path: "/trending", priority: 0.9, changeFrequency: "hourly" },
    { path: "/leaderboard", priority: 0.8, changeFrequency: "hourly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/patch-notes", priority: 0.6, changeFrequency: "weekly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return entries.map((e) => ({
    url: `${SITE}${e.path}`,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));
}

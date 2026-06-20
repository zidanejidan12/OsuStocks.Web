import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.osustocks.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Personal / auth-only areas — no SEO value and shouldn't be crawled.
        disallow: ["/admin", "/portfolio", "/wallet", "/trades", "/notifications", "/auth/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}

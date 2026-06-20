import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OsuStocks — the osu! stock market",
    short_name: "OsuStocks",
    description:
      "Trade osu! players like stocks. Browse the market, track your portfolio, and buy and sell shares tied to osu! player performance.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ec4899",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

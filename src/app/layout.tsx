import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { NotificationsProvider } from "@/lib/notifications/notifications-context";
import { ToastProvider } from "@/components/ui/Toast";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Backdrop } from "@/components/Backdrop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.osustocks.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OsuStocks — the osu! stock market",
    template: "%s · OsuStocks",
  },
  description:
    "OsuStocks is the osu! stock market — trade osu! players like stocks. Browse the market, track your portfolio, and buy and sell shares tied to osu! player performance.",
  applicationName: "OsuStocks",
  keywords: [
    "osu stocks",
    "osustocks",
    "osu market",
    "osu stock market",
    "osu! stock market",
    "osu trading",
    "osu trading game",
    "osu fantasy",
    "osu player stocks",
    "osu pp market",
  ],
  category: "games",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "OsuStocks",
    title: "OsuStocks — the osu! stock market",
    description: "Trade osu! players like stocks — browse the market and build a portfolio.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "OsuStocks — the osu! stock market",
    description: "Trade osu! players like stocks.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Set these as NEXT_PUBLIC_* build args to use the meta-tag verification method
  // (DNS TXT verification needs no code). Unset values are simply omitted.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : {},
  },
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
};

// Structured data so search engines understand the site + app (rich results).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "OsuStocks",
      description: "The osu! stock market — trade osu! players like stocks.",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "OsuStocks",
      url: SITE_URL,
      logo: `${SITE_URL}/icon`,
    },
    {
      "@type": "WebApplication",
      name: "OsuStocks",
      url: SITE_URL,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Trade osu! players like stocks. Browse the market, track your portfolio, and buy and sell shares tied to osu! player performance.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100">
        <a
          href="#main"
          className="sr-only z-[100] rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <MotionProvider>
          <Backdrop />
          <ToastProvider>
            <AuthProvider>
              <NotificationsProvider>
                <Nav />
                <main id="main" tabIndex={-1} className="relative flex-1 focus-visible:outline-none">
                  {children}
                </main>
                <Footer />
              </NotificationsProvider>
            </AuthProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

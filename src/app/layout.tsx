import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "OsuStocks",
    template: "%s · OsuStocks",
  },
  description:
    "Trade osu! players like stocks — browse the market, track your portfolio, and buy and sell shares tied to osu! player performance.",
  applicationName: "OsuStocks",
  openGraph: {
    type: "website",
    siteName: "OsuStocks",
    title: "OsuStocks",
    description: "Trade osu! players like stocks.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "OsuStocks",
    description: "Trade osu! players like stocks.",
  },
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
        <Backdrop />
        <AuthProvider>
          <Nav />
          <main className="relative flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

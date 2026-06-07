"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChartLineUp,
  ChartPieSlice,
  Wallet,
  SignOut,
  SignIn,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { buttonClasses } from "@/components/ui/Button";
import { spring } from "@/lib/motion";

const LINKS = [
  { href: "/", label: "Market", Icon: ChartLineUp },
  { href: "/portfolio", label: "Portfolio", Icon: ChartPieSlice },
  { href: "/wallet", label: "Wallet", Icon: Wallet },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25 transition-transform group-hover:scale-105">
            <ChartLineUp size={18} weight="bold" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            <span className="text-pink-400">Osu</span>Stocks
          </span>
        </Link>

        <ul className="ml-2 hidden items-center gap-1 text-sm sm:flex">
          {LINKS.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
                    active
                      ? "text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-lg bg-zinc-800/80 ring-1 ring-inset ring-white/5"
                    />
                  )}
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {loading ? (
            <Spinner />
          ) : user ? (
            <>
              <span className="hidden text-zinc-300 sm:inline">
                {user.username}
              </span>
              {user.role === "Admin" && <Badge tone="accent">Admin</Badge>}
              <button
                type="button"
                onClick={logout}
                className={buttonClasses({ variant: "secondary", size: "sm" })}
              >
                <SignOut size={16} weight="bold" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              <SignIn size={16} weight="bold" />
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/Spinner";

const LINKS = [
  { href: "/", label: "Market" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/wallet", label: "Wallet" },
];

export function Nav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-pink-500">Osu</span>Stocks
        </Link>

        <ul className="flex items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    active
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-100"
                  }`}
                >
                  {link.label}
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
              <span className="text-zinc-300">{user.username}</span>
              {user.role === "Admin" && (
                <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-xs font-medium text-pink-400">
                  Admin
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-zinc-800 px-3 py-1.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-pink-500 px-3 py-1.5 font-medium text-white transition-colors hover:bg-pink-400"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

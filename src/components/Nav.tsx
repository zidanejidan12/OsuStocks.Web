"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChartLineUp,
  ChartPieSlice,
  Wallet,
  Fire,
  Trophy,
  Medal,
  Target,
  Bell,
  GearSix,
  SignOut,
  SignIn,
  List,
  X,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth/auth-context";
import { useNotifications } from "@/lib/notifications/notifications-context";
import { Spinner } from "@/components/ui/Spinner";
import { buttonClasses } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { spring } from "@/lib/motion";

const LINKS = [
  { href: "/", label: "Market", Icon: ChartLineUp },
  { href: "/trending", label: "Trending", Icon: Fire },
  { href: "/leaderboard", label: "Leaderboard", Icon: Trophy },
  { href: "/achievements", label: "Achievements", Icon: Medal },
  { href: "/missions", label: "Missions", Icon: Target },
  { href: "/portfolio", label: "Portfolio", Icon: ChartPieSlice },
  { href: "/wallet", label: "Wallet", Icon: Wallet },
];

function isActiveHref(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NotificationBell() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const active = pathname.startsWith("/notifications");

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"
      }
      className={`relative grid h-9 w-9 place-items-center rounded-lg transition-colors ${
        active
          ? "bg-zinc-800/80 text-zinc-100 ring-1 ring-inset ring-white/5"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
      }`}
    >
      <Bell size={18} weight={active || unreadCount > 0 ? "fill" : "regular"} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-zinc-950">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  // The hamburger that opened the drawer — focus returns here on close so
  // keyboard users aren't dumped at the top of the document.
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The drawer panel — its focusable children define the Tab trap boundary.
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the drawer on navigation — intentional sync to the route, the
  // documented exception to react-hooks/set-state-in-effect.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setOpen(false);
  }, [pathname]);

  // While the drawer is open: lock background scroll, close on Escape, mark the
  // header + main + footer inert (hidden from AT and untabbable), trap Tab
  // within the panel, and on close return focus to the hamburger trigger.
  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";

    // Hide the rest of the page from assistive tech + keyboard while the modal
    // drawer is open. `inert` covers both tab order and AT exposure.
    const outside = [
      document.querySelector("header"),
      document.getElementById("main"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el instanceof HTMLElement);
    for (const el of outside) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !panel.contains(activeEl)) {
          e.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !panel.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      for (const el of outside) {
        el.removeAttribute("inert");
        el.removeAttribute("aria-hidden");
      }
      // Return focus to whatever opened the drawer.
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25 transition-transform group-hover:scale-105"
            >
              <ChartLineUp size={18} weight="bold" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              <span className="text-pink-400">Osu</span>Stocks
            </span>
          </Link>

          {/* Authenticated nav links — hidden for guests so they aren't sent into
              login-walled pages; logged-out visitors only see the landing page. */}
          {user && (
          <ul className="ml-2 hidden items-center gap-1 text-sm lg:flex">
            {LINKS.map(({ href, label, Icon }) => {
              const active = isActiveHref(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
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
          )}

          {/* Desktop auth cluster (lg+) */}
          <div className="ml-auto hidden items-center gap-2 text-sm sm:gap-3 lg:flex">
            {loading ? (
              <Spinner />
            ) : user ? (
              <>
                <NotificationBell />
                {user.role === "Admin" && (
                  <Link
                    href="/admin"
                    aria-label="Admin"
                    className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-zinc-800/80 text-pink-300 ring-1 ring-inset ring-pink-500/30"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                    }`}
                  >
                    <GearSix size={18} weight="bold" />
                  </Link>
                )}
                <Link
                  href="/portfolio"
                  aria-label={user.username}
                  title={user.username}
                  className="shrink-0 rounded-full ring-2 ring-transparent transition-colors hover:ring-pink-500/40"
                >
                  <Avatar src={user.avatarUrl} name={user.username} size="sm" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Logout"
                  className={buttonClasses({ variant: "secondary", size: "sm" })}
                >
                  <SignOut size={16} weight="bold" />
                  Logout
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

          {/* Mobile cluster (below lg): guests get a Login button; signed-in users get bell + menu */}
          <div className="ml-auto flex items-center gap-2 lg:hidden">
            {loading ? (
              <Spinner />
            ) : user ? (
              <>
                <NotificationBell />
                <button
                  ref={triggerRef}
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={open}
                  aria-controls="mobile-nav"
                  className="grid h-9 w-9 place-items-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
                >
                  <List size={20} weight="bold" />
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

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            />
            <motion.div
              ref={panelRef}
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-l border-white/10 bg-zinc-950 shadow-2xl"
              variants={{ hidden: { x: "100%" }, show: { x: 0 } }}
              transition={spring}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4">
                <span className="text-[15px] font-semibold tracking-tight">
                  <span className="text-pink-400">Osu</span>Stocks
                </span>
                <button
                  autoFocus
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                <ul className="flex flex-col gap-1">
                  {LINKS.map(({ href, label, Icon }) => {
                    const active = isActiveHref(pathname, href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? "bg-zinc-800/80 text-zinc-100 ring-1 ring-inset ring-white/5"
                              : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                          }`}
                        >
                          <Icon size={18} weight={active ? "fill" : "regular"} />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                  {user && (
                    <li>
                      <Link
                        href="/notifications"
                        aria-current={
                          pathname.startsWith("/notifications") ? "page" : undefined
                        }
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          pathname.startsWith("/notifications")
                            ? "bg-zinc-800/80 text-zinc-100 ring-1 ring-inset ring-white/5"
                            : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                        }`}
                      >
                        <Bell size={18} weight="regular" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-pink-500 px-1.5 text-[11px] font-semibold leading-none text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  )}
                  {user?.role === "Admin" && (
                    <li>
                      <Link
                        href="/admin"
                        aria-current={
                          pathname.startsWith("/admin") ? "page" : undefined
                        }
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                          pathname.startsWith("/admin")
                            ? "bg-zinc-800/80 text-pink-300 ring-1 ring-inset ring-pink-500/30"
                            : "text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                        }`}
                      >
                        <GearSix size={18} weight="bold" />
                        Admin
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>

              <div className="shrink-0 border-t border-white/5 p-3">
                {loading ? (
                  <div className="flex justify-center py-2">
                    <Spinner />
                  </div>
                ) : user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/portfolio"
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <Avatar src={user.avatarUrl} name={user.username} size="sm" />
                      <span className="truncate text-sm font-medium text-zinc-100">
                        {user.username}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        logout();
                      }}
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      <SignOut size={16} weight="bold" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className={buttonClasses({
                      variant: "primary",
                      size: "md",
                      className: "w-full",
                    })}
                  >
                    <SignIn size={16} weight="bold" />
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

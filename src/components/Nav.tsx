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
  Sun,
  Moon,
  Question,
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

const PUBLIC_LINKS = [
  { href: "/trending", label: "Trending", Icon: Fire },
  { href: "/leaderboard", label: "Leaderboard", Icon: Trophy },
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

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      setTheme("dark");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors"
    >
      {theme === "dark" ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  const { user, loading, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const shouldShow = window.localStorage.getItem("show_welcome_toast");
      if (shouldShow === "true") {
        setShowWelcomePopup(true);
        window.localStorage.removeItem("show_welcome_toast");
      }
    }
  }, [user]);

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
      <header className="sticky top-0 z-50 bg-zinc-950/75 backdrop-blur-xl">
        {/* Bottom glowing gradient border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-pink-500/30 via-purple-500/20 to-cyan-500/30" />
        
        <nav className="mx-auto flex h-16 max-w-none w-full items-center justify-between px-6 sm:px-10 xl:px-12 relative">
          
          {/* Left: Mobile hamburger menu (visible below lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-xl text-zinc-400 bg-zinc-900/30 border border-zinc-800/60 transition-all hover:bg-zinc-800/60 hover:text-pink-400 hover:border-pink-500/30 active:scale-95"
            >
              <List size={22} weight="bold" />
            </button>
          </div>

          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-4 xl:gap-8 lg:gap-5">
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/15 text-pink-400 ring-1 ring-inset ring-pink-500/25 transition-all duration-300 group-hover:scale-105 group-hover:bg-pink-500/25 group-hover:shadow-[0_0_12px_rgba(236,72,153,0.4)]"
              >
                <ChartLineUp size={18} weight="bold" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight transition-transform group-hover:translate-x-0.5">
                <span className="text-pink-500 font-extrabold drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] font-display">Osu</span>
                <span className="text-zinc-50 dark:text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] font-display">Stocks</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden items-center gap-1 xl:gap-2 text-sm lg:flex">
              {(user ? LINKS : PUBLIC_LINKS).map(({ href, label, Icon }) => {
                const active = isActiveHref(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-1.5 rounded-lg lg:px-2.5 lg:py-1.5 xl:px-4 xl:py-2 font-display text-xs uppercase tracking-wider font-extrabold transition-all duration-300 border ${
                        active
                          ? "text-white bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                          : "text-zinc-400 border-transparent hover:text-pink-300 hover:bg-zinc-900/40 hover:border-zinc-800"
                      }`}
                    >
                      <Icon 
                        size={15} 
                        weight={active ? "fill" : "regular"} 
                        className={active ? "text-pink-400" : "transition-colors"}
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: Actions / Auth Cluster */}
          <div className="flex items-center gap-1.5 xl:gap-2.5">
            <ThemeToggle />
            
            {/* Desktop Auth Links */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5">
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
                    className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 font-display text-xs font-bold uppercase tracking-wider lg:px-2.5 lg:py-1.5 xl:px-4 xl:py-2 transition-all active:scale-95 text-zinc-300 flex items-center gap-1.5"
                  >
                    <SignOut size={14} weight="bold" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="relative inline-flex items-center gap-1.5 lg:px-3 lg:py-1.5 xl:px-5 xl:py-2 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 font-display text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 group/login"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/login:animate-[shimmer_1.5s_infinite]" />
                  <SignIn size={14} weight="bold" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Auth/Toggle (visible below lg) */}
            <div className="flex lg:hidden items-center gap-2">
              {loading ? (
                <Spinner />
              ) : user ? (
                <NotificationBell />
              ) : (
                <Link
                  href="/login"
                  className="relative inline-flex items-center gap-1.5 px-4 py-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 font-display text-xs font-black uppercase tracking-widest text-white shadow-[0_0_12px_rgba(236,72,153,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 group/login"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/login:animate-[shimmer_1.5s_infinite]" />
                  <SignIn size={13} weight="bold" />
                  Login
                </Link>
              )}
            </div>
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
              className="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col border-r border-white/10 bg-zinc-950 shadow-2xl"
              variants={{ hidden: { x: "-100%" }, show: { x: 0 } }}
              transition={spring}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-4">
                <span className="text-[15px] font-semibold tracking-tight text-zinc-50 dark:text-zinc-100">
                  <span className="text-pink-500">Osu</span>Stocks
                </span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
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
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                <ul className="flex flex-col gap-1">
                  {(user ? LINKS : PUBLIC_LINKS).map(({ href, label, Icon }) => {
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

      {/* Welcome Popup Modal */}
      <AnimatePresence>
        {showWelcomePopup && user && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWelcomePopup(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-pink-500/35 bg-zinc-950/90 p-8 shadow-[0_0_50px_rgba(236,72,153,0.3)] backdrop-blur-xl text-center z-10"
            >
              {/* Corner decorative light path */}
              <div className="absolute -left-16 -top-16 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -right-16 -bottom-16 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
                aria-label="Close welcome message"
              >
                <X size={16} weight="bold" />
              </button>

              {/* Glowing Avatar Frame */}
              <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
                {/* Rotating accent aura */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-pink-500/40 animate-spin-slow" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 opacity-20 blur-md" />
                <div className="relative rounded-full ring-4 ring-zinc-900 shadow-2xl">
                  <Avatar src={user.avatarUrl} name={user.username} size="lg" />
                </div>
              </div>

              {/* Text */}
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.35)]">
                Welcome back
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight font-display text-zinc-50 leading-tight">
                Hi, <span className="bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-[0_0_15px_rgba(236,72,153,0.35)]">{user.username}</span>!
              </h2>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-zinc-400">
                You are successfully logged into OsuStocks. Start tracking performance, buying shares, and dominating the leaderboard!
              </p>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowWelcomePopup(false)}
                className="mt-6 w-full relative inline-flex items-center justify-center h-11 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 font-display text-xs font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:brightness-110 active:scale-95 group/btn"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                Start Trading
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

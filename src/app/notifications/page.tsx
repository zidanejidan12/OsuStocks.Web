"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  BellSlash,
  Receipt,
  TrendUp,
  Gift,
  Info,
  Lock,
  Checks,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import type { AppNotification, NotificationType } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { spring, fadeUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";
import { useNotifications } from "@/lib/notifications/notifications-context";

const TYPE_ICONS: Record<NotificationType, { Icon: PhosphorIcon; tone: string }> = {
  TradeExecuted: { Icon: Receipt, tone: "text-sky-400" },
  PriceAlert: { Icon: TrendUp, tone: "text-emerald-400" },
  Reward: { Icon: Gift, tone: "text-pink-400" },
  System: { Icon: Info, tone: "text-zinc-400" },
};

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">{children}</div>;
}

function PleaseLogIn() {
  return (
    <Card className="border border-zinc-805 bg-zinc-955/20 p-6">
      <EmptyState
        icon={<Lock size={20} weight="bold" className="text-pink-400" />}
        title="Access Restricted"
        message="You need to be signed in to view your notifications feed."
        action={
          <Link href="/login" className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-[0_2px_15px_rgba(236,72,153,0.25)]">
            Go to login
          </Link>
        }
      />
    </Card>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationRow({
  notification,
  onActivate,
}: {
  notification: AppNotification;
  onActivate: (n: AppNotification) => void;
}) {
  const { Icon, tone } = TYPE_ICONS[notification.type] ?? TYPE_ICONS.System;
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={
        reduceMotion ? undefined : { backgroundColor: "rgba(24,24,27,0.3)" }
      }
      transition={spring}
      onClick={() => onActivate(notification)}
      className={`flex w-full items-start gap-4 px-5 py-4.5 text-left transition-all border-l-2 ${
        notification.isRead 
          ? "border-l-transparent bg-zinc-955/5" 
          : "border-l-pink-500 bg-pink-500/[0.02] shadow-[inset_1px_0_0_rgba(236,72,153,0.1)]"
      }`}
    >
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-900 border border-zinc-800/60 shadow-md ${tone}`}>
        <Icon size={18} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${notification.isRead ? "text-zinc-350" : "text-zinc-100 font-bold"}`}>
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-450 leading-relaxed">{notification.message}</p>
      </div>
      <span className="shrink-0 whitespace-nowrap text-[9px] font-mono font-medium text-zinc-500">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </motion.button>
  );
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, unavailable, markRead, markAllRead } =
    useNotifications();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filterType, setFilterType] = useState<"all" | "trades" | "alerts" | "rewards" | "system">("all");

  useEffect(() => {
    setVisibleCount((c) => Math.min(c, Math.max(PAGE_SIZE, notifications.length)));
  }, [notifications.length]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "trades") return n.type === "TradeExecuted";
    if (filterType === "alerts") return n.type === "PriceAlert";
    if (filterType === "rewards") return n.type === "Reward";
    if (filterType === "system") return n.type === "System";
    return true;
  });

  const visible = filteredNotifications.slice(0, visibleCount);
  const hasMore = filteredNotifications.length > visibleCount;

  const onActivate = (n: AppNotification) => {
    if (!n.isRead) markRead(n.notificationId);
    if (n.link) router.push(n.link);
  };

  if (authLoading) {
    return (
      <PageShell>
        <NotificationsSkeleton />
      </PageShell>
    );
  }

  if (!user) {
    return (
      <PageShell>
        <Reveal>
          <PleaseLogIn />
        </Reveal>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Reveal>
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display bg-gradient-to-r from-zinc-100 via-pink-100 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-zinc-400 font-mono">
              {unreadCount > 0
                ? `${unreadCount} unread system feeds requiring attention`
                : "All incoming streams clear and processed."}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-pink-500/20 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
            >
              <Checks size={14} weight="bold" />
              Acknowledge All
            </button>
          )}
        </header>
      </Reveal>

      {/* Category filters */}
      <Reveal delay={0.05}>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {([
            { id: "all", label: "All Streams", count: notifications.length },
            { id: "trades", label: "Trades", count: notifications.filter(n => n.type === "TradeExecuted").length },
            { id: "alerts", label: "Price Alerts", count: notifications.filter(n => n.type === "PriceAlert").length },
            { id: "rewards", label: "Rewards", count: notifications.filter(n => n.type === "Reward").length },
            { id: "system", label: "System", count: notifications.filter(n => n.type === "System").length }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setVisibleCount(PAGE_SIZE);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
                filterType === tab.id
                  ? "bg-pink-500/10 text-pink-400 border-pink-500/35 shadow-[0_0_12px_rgba(236,72,153,0.1)]"
                  : "bg-zinc-950/20 text-zinc-500 border-zinc-800/80 hover:text-zinc-350 hover:border-zinc-700"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded-full ${
                  filterType === tab.id ? "bg-pink-500/25 text-pink-300" : "bg-zinc-900 text-zinc-550"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {loading && filteredNotifications.length === 0 && <NotificationsSkeleton />}

      {!loading && unavailable && filteredNotifications.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<BellSlash size={20} weight="bold" className="text-zinc-500" />}
            title="Notifications unavailable"
            message="We couldn't reach the notifications service. Try again shortly."
          />
        </Reveal>
      )}

      {!unavailable && !loading && filteredNotifications.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Bell size={20} weight="bold" className="text-zinc-500" />}
            title="No notifications"
            message="Incoming fills, price alerts, and rewards will be streamed here."
          />
        </Reveal>
      )}

      {filteredNotifications.length > 0 && (
        <Reveal>
          <motion.div
            className="divide-y divide-zinc-850/60 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {visible.map((n) => (
              <NotificationRow
                key={n.notificationId}
                notification={n}
                onActivate={onActivate}
              />
            ))}
          </motion.div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
              >
                Load more
              </button>
            </div>
          )}
        </Reveal>
      )}
    </PageShell>
  );
}

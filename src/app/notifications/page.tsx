"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Button, buttonClasses } from "@/components/ui/Button";
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
    <Card>
      <EmptyState
        icon={<Lock size={20} weight="bold" />}
        title="Please log in"
        message="You need to be signed in to view your notifications."
        action={
          <Link href="/login" className={buttonClasses({ size: "sm" })}>
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
  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={{ backgroundColor: "rgba(24,24,27,0.5)" }}
      transition={spring}
      onClick={() => onActivate(notification)}
      className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${
        notification.isRead ? "" : "bg-pink-500/[0.05]"
      }`}
    >
      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-800/70 ${tone}`}>
        <Icon size={18} weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-100">{notification.title}</span>
          {!notification.isRead && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-zinc-400">{notification.message}</p>
      </div>
      <span className="shrink-0 whitespace-nowrap text-xs text-zinc-500">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </motion.button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notifications, unreadCount, loading, unavailable, markRead, markAllRead } =
    useNotifications();

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
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-100 sm:text-4xl">
              Notifications
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up."}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => markAllRead()}>
              <Checks size={16} weight="bold" />
              Mark all read
            </Button>
          )}
        </header>
      </Reveal>

      {loading && notifications.length === 0 && <NotificationsSkeleton />}

      {!loading && unavailable && notifications.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<BellSlash size={20} weight="bold" />}
            title="Notifications unavailable"
            message="We couldn't reach the notifications service. Try again shortly."
          />
        </Reveal>
      )}

      {!unavailable && !loading && notifications.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Bell size={20} weight="bold" />}
            title="No notifications"
            message="Trade fills, price alerts, and rewards will show up here."
          />
        </Reveal>
      )}

      {notifications.length > 0 && (
        <Reveal>
          <motion.div
            className="divide-y divide-zinc-800/60 overflow-hidden rounded-2xl border border-zinc-800/80"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {notifications.map((n) => (
              <NotificationRow
                key={n.notificationId}
                notification={n}
                onActivate={onActivate}
              />
            ))}
          </motion.div>
        </Reveal>
      )}
    </PageShell>
  );
}

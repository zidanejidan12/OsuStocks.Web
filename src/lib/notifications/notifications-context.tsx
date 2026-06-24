"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppNotification } from "@/lib/api/types";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  /** True once a fetch has failed (e.g. endpoint not live yet) so the UI can soften. */
  unavailable: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const POLL_INTERVAL_MS = 60_000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const page = await getNotifications();
      setNotifications(page.items);
      setUnavailable(false);
    } catch {
      // Frontend-ahead. The endpoint may not exist yet. Stay quiet (no toast
      // spam) and let the bell simply show nothing.
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on login, poll while signed in, and refresh when the tab regains focus.
  useEffect(() => {
    // Intentional synchronous resets/kickoff on auth change. This is the
    // documented exception to react-hooks/set-state-in-effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh();
    /* eslint-enable react-hooks/set-state-in-effect */

    // Poll only while the tab is visible so a backgrounded tab stops hammering
    // the endpoint. Debounce the focus refetch so rapid alt-tabbing can't fire
    // back-to-back requests.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_INTERVAL_MS);
    let lastFocusRefresh = 0;
    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusRefresh < 10_000) return;
      lastFocusRefresh = now;
      refresh();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      // Optimistic update: flip locally, then tell the server.
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)),
      );
      try {
        await markNotificationRead(id);
      } catch {
        // Roll back on failure and tell the user (we don't fail silently).
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, isRead: false } : n)),
        );
        notify({
          tone: "danger",
          title: "Couldn't mark as read",
          message: "Please try again.",
        });
      }
    },
    [notify],
  );

  const markAllRead = useCallback(async () => {
    // Capture the snapshot at call time via the functional updater so a poll
    // landing mid-request can't be clobbered by a stale closure on rollback.
    let snapshot: AppNotification[] = [];
    setNotifications((prev) => {
      snapshot = prev;
      return prev.map((n) => ({ ...n, isRead: true }));
    });
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(snapshot);
      notify({
        tone: "danger",
        title: "Couldn't mark all as read",
        message: "Please try again.",
      });
    }
  }, [notify]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      unavailable,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, loading, unavailable, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (ctx === null) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Me } from "@/lib/api/types";
import { API_BASE_URL, getMe } from "@/lib/api/client";
import { clearAuth, getAccessToken } from "@/lib/auth/token";
import * as analytics from "@/lib/analytics";
import { useToast } from "@/components/ui/Toast";

interface AuthContextValue {
  user: Me | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (getAccessToken() === null) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          analytics.identify(me.userId, { osu_country: me.countryCode });
        }
      } catch {
        clearAuth();
        analytics.reset();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (returnTo?: string) => {
      analytics.track("login_started", { returnTo: returnTo ?? "/" });

      // Preflight the proxy -> backend before navigating away, so an outage
      // shows a branded toast instead of the browser's connection-error page.
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1200);
        const res = await fetch("/api/v1/health", { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("backend unhealthy");
      } catch {
        analytics.track("login_failed", { reason: "backend_unreachable" });
        notify({
          title: "Can't reach the server",
          message:
            "OsuStocks is unreachable right now. Please try again in a moment.",
          tone: "danger",
        });
        return;
      }

      const callback =
        window.location.origin +
        "/auth/callback?returnTo=" +
        encodeURIComponent(returnTo ?? "/");
      window.location.href =
        API_BASE_URL +
        "/api/v1/auth/login?returnUrl=" +
        encodeURIComponent(callback);
    },
    [notify],
  );

  const logout = useCallback(() => {
    clearAuth();
    analytics.reset();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      analytics.identify(me.userId, { osu_country: me.countryCode });
    } catch {
      clearAuth();
      analytics.reset();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

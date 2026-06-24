"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Me } from "@/lib/api/types";
import { API_BASE_URL, getMe, refreshSession } from "@/lib/api/client";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredAuth,
} from "@/lib/auth/token";
import * as analytics from "@/lib/analytics";

// Renew this far ahead of the access token's expiry so an in-flight request never races it.
const REFRESH_LEAD_MS = 2 * 60 * 1000;

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (getAccessToken() === null) {
        // The access token is missing or expired. If a refresh token survives, restore the session
        // silently rather than forcing a fresh osu! login.
        const restored = getRefreshToken() !== null && (await refreshSession());
        if (!restored) {
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
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

  // Proactively refresh the access token shortly before it expires while a session is active, so the
  // user keeps a valid token without waiting for a request to 401. Reschedules itself after each
  // success; on failure it stops and lets the next request's 401 handler clear the session.
  useEffect(() => {
    if (user === null) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function schedule() {
      if (timer) clearTimeout(timer);
      const auth = getStoredAuth();
      if (!auth?.refreshToken) return;
      const expiresAt = new Date(auth.expiresAt).getTime();
      if (Number.isNaN(expiresAt)) return;
      const delay = Math.max(0, expiresAt - Date.now() - REFRESH_LEAD_MS);

      timer = setTimeout(async () => {
        if (cancelled) return;
        const ok = await refreshSession();
        if (!cancelled && ok) schedule();
      }, delay);
    }

    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  const login = useCallback((returnTo?: string) => {
    analytics.track("login_started", { returnTo: returnTo ?? "/" });
    const callback =
      window.location.origin +
      "/auth/callback?returnTo=" +
      encodeURIComponent(returnTo ?? "/");
    window.location.href =
      API_BASE_URL +
      "/api/v1/auth/login?returnUrl=" +
      encodeURIComponent(callback);
  }, []);

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

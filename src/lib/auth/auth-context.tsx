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

  const login = useCallback(async (returnTo?: string) => {
    analytics.track("login_started", { returnTo: returnTo ?? "/" });
    
    // Quick ping to check if Next.js proxy can reach the backend
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1200);
      const res = await fetch("/api/v1/health", { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) {
        const callback =
          window.location.origin +
          "/auth/callback?returnTo=" +
          encodeURIComponent(returnTo ?? "/");
        window.location.href =
          API_BASE_URL +
          "/api/v1/auth/login?returnUrl=" +
          encodeURIComponent(callback);
        return;
      }
    } catch {
      // Backend is down or timed out, proceed to mock login if enabled
    }

    if (process.env.NEXT_PUBLIC_ENABLE_MOCK === "false") {
      console.error("Authentication failed: OsuStocks backend is unreachable.");
      alert("Cannot connect to OsuStocks server. Please try again later.");
      return;
    }

    console.warn("OsuStocks backend is unreachable. Initiating client-side mock login mode.");
    
    const mockAuth = {
      accessToken: "mock-session-token-99999",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Valid for 7 days
    };
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem("osustocks.auth", JSON.stringify(mockAuth));
      window.localStorage.setItem("show_welcome_toast", "true");
      window.location.href = returnTo ?? "/";
    }
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

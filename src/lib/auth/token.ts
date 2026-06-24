const STORAGE_KEY = "osustocks.auth";

export interface StoredAuth {
  accessToken: string;
  expiresAt: string;
  // Long-lived, single-use refresh token used to silently mint a new access token without
  // sending the user back through osu! OAuth. Optional so older stored sessions still parse.
  refreshToken?: string;
  refreshExpiresAt?: string;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (
      !parsed ||
      typeof parsed.accessToken !== "string" ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }
    return {
      accessToken: parsed.accessToken,
      expiresAt: parsed.expiresAt,
      refreshToken:
        typeof parsed.refreshToken === "string" ? parsed.refreshToken : undefined,
      refreshExpiresAt:
        typeof parsed.refreshExpiresAt === "string"
          ? parsed.refreshExpiresAt
          : undefined,
    };
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const auth = getStoredAuth();
  if (!auth) return null;
  const expiresAt = new Date(auth.expiresAt).getTime();
  if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) return null;
  return auth.accessToken;
}

/** The refresh token, or null when absent or past its own expiry. */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const auth = getStoredAuth();
  if (!auth?.refreshToken || !auth.refreshExpiresAt) return null;
  const expiresAt = new Date(auth.refreshExpiresAt).getTime();
  if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) return null;
  return auth.refreshToken;
}

export function setAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

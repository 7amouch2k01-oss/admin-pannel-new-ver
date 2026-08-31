/**
 * Transport for the admin console.
 *
 * Adds the Bearer header, unwraps the API's several success envelopes,
 * normalises its several error shapes, and handles token refresh.
 */
import { ApiError, networkError, normalizeError } from "./errors";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isRefreshExpired,
  setTokens,
} from "./auth-store";

/** Empty by default so the Vite dev proxy can serve /api same-origin. */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** No Authorization header, and never redirect on 401 (sign-in, reset). */
  anonymous?: boolean;
  /** Resolve to `null` on 401 instead of redirecting (auth.me). */
  nullOnUnauthorized?: boolean;
  /** 401 means "already logged out", which is success (logout). */
  treat401AsSuccess?: boolean;
  /** Pick the payload out of the envelope. Defaults to `data`, else whole body. */
  unwrap?: (body: any) => unknown;
};

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const suffix = qs.toString();
  return `${BASE_URL}${path}${suffix ? `?${suffix}` : ""}`;
};

const parseBody = async (res: Response): Promise<any> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const defaultUnwrap = (body: any) => {
  if (body && typeof body === "object" && "data" in body) return (body as any).data;
  return body;
};

// ── refresh (single-flight) ──────────────────────────────────────────────────

let inflightRefresh: Promise<string | null> | null = null;

const doRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isRefreshExpired()) return null;

  try {
    const res = await fetch(buildUrl("/api/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const body = await parseBody(res);
    const data = body?.data ?? body;
    if (!data?.accessToken || !data?.refreshToken) return null;
    // Refresh tokens rotate — persist BOTH or the next refresh uses a revoked one.
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt ?? null,
    });
    return data.accessToken as string;
  } catch {
    return null;
  }
};

/**
 * Returns a usable access token, refreshing at most once across all callers.
 * If another tab already rotated the pair, that token is adopted without a
 * network call.
 */
const ensureFreshToken = async (staleToken: string | null): Promise<string | null> => {
  const current = getAccessToken();
  if (current && current !== staleToken) return current;

  if (!inflightRefresh) {
    inflightRefresh = doRefresh().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
};

// ── logout ───────────────────────────────────────────────────────────────────

let loggingOut = false;

/** Replaces the old `main.tsx` cache subscribers, which matched on a message string. */
export const hardLogout = () => {
  if (loggingOut) return;
  loggingOut = true;
  clearTokens();
  const path = window.location.pathname;
  if (path !== "/auth" && path !== "/admin/reset-password") {
    window.location.href = "/auth";
  }
};

// ── request ──────────────────────────────────────────────────────────────────

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, query, anonymous, nullOnUnauthorized, treat401AsSuccess, unwrap } = options;

  const send = async (token: string | null) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token && !anonymous) headers.Authorization = `Bearer ${token}`;
    try {
      return await fetch(buildUrl(path, query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      throw networkError();
    }
  };

  const token = anonymous ? null : getAccessToken();
  let res = await send(token);

  if (res.status === 401 && !anonymous) {
    if (treat401AsSuccess) return null as T;

    const fresh = await ensureFreshToken(token);
    if (fresh) res = await send(fresh);

    if (!fresh || res.status === 401) {
      if (nullOnUnauthorized) {
        clearTokens();
        return null as T;
      }
      hardLogout();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
  }

  const parsed = await parseBody(res);
  if (!res.ok) throw normalizeError(res.status, parsed);
  return (unwrap ? unwrap(parsed) : defaultUnwrap(parsed)) as T;
};

/**
 * Token storage for the admin console.
 *
 * The API authenticates with `Authorization: Bearer` and its CORS config is
 * `origin:'*', credentials:false`, so cookies are not an option — tokens live in
 * localStorage. Refresh tokens ROTATE (each refresh revokes the previous one),
 * so both tokens must be persisted together and refreshes must be single-flight;
 * two concurrent refreshes would revoke each other and log the user out.
 */
const KEY = "styly.admin.auth";
const CHANNEL = "styly-admin-auth";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt?: string | null;
};

let cache: AuthTokens | null | undefined;

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;

const read = (): AuthTokens | null => {
  if (cache !== undefined) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    cache = null;
  }
  return cache;
};

export const getTokens = () => read();
export const getAccessToken = () => read()?.accessToken ?? null;
export const getRefreshToken = () => read()?.refreshToken ?? null;

export const setTokens = (tokens: AuthTokens, broadcast = true) => {
  cache = tokens;
  try {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  } catch {
    /* private mode — tokens stay in memory for this tab */
  }
  if (broadcast) channel?.postMessage({ type: "set", tokens });
};

export const clearTokens = (broadcast = true) => {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  if (broadcast) channel?.postMessage({ type: "clear" });
};

/** Sibling tabs adopt a rotated token pair instead of racing for their own. */
channel?.addEventListener("message", (event) => {
  const data = event.data as { type: string; tokens?: AuthTokens };
  if (data?.type === "set" && data.tokens) {
    cache = data.tokens;
  } else if (data?.type === "clear") {
    cache = null;
  }
});

/** Cross-tab fallback where BroadcastChannel is unavailable. */
if (typeof window !== "undefined" && !channel) {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) cache = undefined; // force a re-read
  });
}

export const isRefreshExpired = () => {
  const exp = read()?.refreshTokenExpiresAt;
  if (!exp) return false;
  const t = new Date(exp).getTime();
  return Number.isFinite(t) && t <= Date.now();
};

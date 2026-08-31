/**
 * Transport descriptors — one function per procedure the console calls.
 *
 * `/api/admin/*` is a BFF built for this console, so it already returns
 * console-shaped DTOs with money coerced to numbers. The only mapping left here
 * is for `/api/auth/*`, which is shared with the mobile app and therefore
 * returns the raw user row.
 */
import { request } from "./http";
import { clearTokens, getRefreshToken, setTokens } from "./auth-store";
import type {
  ActivityEntry, AdminBrand, AdminOrder, AdminPost, AdminUser, AdminWithdrawal,
  DashboardMetrics, FinancialSummary, Id, MonthlyPoint, Ok, PendingBrand,
} from "./types";

/**
 * Defensive numeric coercion. The admin API already sends numbers, but Prisma
 * serializes Decimal to a JSON *string* — if a raw value ever reached the UI it
 * would break .toFixed() and turn a + b into string concatenation.
 */
const num = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const listOf = <T,>(body: any): T[] => (Array.isArray(body) ? body : []);

// ── auth ─────────────────────────────────────────────────────────────────────

/** Raw /api/auth/* user row -> the shape the console renders. */
const toAdminUser = (u: any): AdminUser | null => {
  if (!u) return null;
  const name = [u.firstname, u.lastname].filter(Boolean).join(" ").trim();
  return {
    id: u.id,
    name: name || u.email || "",
    firstname: u.firstname ?? "",
    lastname: u.lastname ?? "",
    email: u.email ?? "",
    role: u.role === "admin" ? "admin" : "user",
    status: u.status ?? "active",
    permissions: Array.isArray(u.permissions) ? u.permissions : [],
    isOwner: u.isOwner === true,
    // Only the users list carries this (the server computes it); the signed-in
    // user's own co-owner flag is read from their row there.
    isCoOwner: u.isCoOwner === true,
    isDeveloper: u.isDeveloper === true,
    developerTitle: u.developerTitle ?? "",
    grade: u.gradeLevel ?? 1,
    gradeTitle: u.grad ?? "new Styler",
    stylePoints: u.stylePoints ?? 0,
    totalEarned: num(u.commissionEarned),
    avatarUrl: u.profileImage ?? u.profileUrl ?? null,
    phone: u.phone ?? null,
    createdAt: u.createdAt,
    // The console gates its shell on this; admins have no verification step.
    isEmailVerified: true,
  };
};

const persist = (data: any) => {
  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt ?? null,
    });
  }
  return data;
};

export const authMe = async (): Promise<AdminUser | null> => {
  const raw = await request<any>("/api/auth/me", { nullOnUnauthorized: true });
  return toAdminUser(raw);
};

export const signIn = async (input: { email: string; password: string }) => {
  // anonymous: a wrong password is a 401 that must surface as a toast, not a
  // redirect back to the page the user is already on.
  const data = await request<any>("/api/auth/login", { method: "POST", body: input, anonymous: true });
  persist(data);
  return { success: true as const, user: toAdminUser(data?.user) };
};

export const signUp = async (input: { name: string; email: string; password: string }) => {
  const parts = (input.name ?? "").trim().split(/\s+/).filter(Boolean);
  const data = await request<any>("/api/auth/register", {
    method: "POST",
    anonymous: true,
    body: {
      email: input.email,
      password: input.password,
      firstname: parts[0] ?? input.name,
      lastname: parts.slice(1).join(" ") || undefined,
    },
  });
  persist(data);
  return { success: true as const, user: toAdminUser(data?.user) };
};

export const logout = async () => {
  const refreshToken = getRefreshToken();
  try {
    await request<Ok>("/api/auth/logout", {
      method: "POST",
      body: { refreshToken },
      treat401AsSuccess: true,
    });
  } finally {
    clearTokens();
  }
  return { success: true as const };
};

export const requestPasswordReset = (input: { email: string }) =>
  request<Ok>("/api/auth/forgot-password", {
    method: "POST",
    body: { email: input.email },
    anonymous: true,
  }).then(() => ({
    success: true as const,
    message: "If that email is registered, a reset code has been sent to it.",
  }));

export const resetPassword = (input: { email: string; code: string; newPassword: string }) =>
  request<Ok>("/api/auth/reset-password", {
    method: "POST",
    anonymous: true,
    body: { email: input.email, code: input.code, newPassword: input.newPassword },
  }).then(() => ({ success: true as const, message: "Password updated. You can sign in now." }));

// ── dashboard & analytics ────────────────────────────────────────────────────

export const metrics = () => request<DashboardMetrics>("/api/admin/metrics");

export const recentActivity = () =>
  request<ActivityEntry[]>("/api/admin/activity", { query: { limit: 8 } }).then(listOf<ActivityEntry>);

export const financialSummary = () => request<FinancialSummary>("/api/admin/analytics/summary");

export const analyticsFull = () =>
  request<MonthlyPoint[]>("/api/admin/analytics/monthly").then(listOf<MonthlyPoint>);

// ── users ────────────────────────────────────────────────────────────────────

export const usersList = () => request<AdminUser[]>("/api/admin/users").then(listOf<AdminUser>);

export const usersCreate = (input: {
  name: string; email: string; password: string; role?: string; permissions?: string[];
}) => request<AdminUser>("/api/admin/users", { method: "POST", body: input });

export const usersUpdate = (input: {
  id: Id; name?: string; email?: string; password?: string; role?: string; status?: string;
}) => {
  const { id, ...body } = input;
  return request<AdminUser>("/api/admin/users/" + id, { method: "PUT", body });
};

export const usersUpdateRole = (input: { userId: Id; role: "admin" | "user" }) =>
  request<AdminUser>("/api/admin/users/" + input.userId + "/role", {
    method: "PATCH",
    body: { role: input.role },
  });

export const usersUpdateStatus = (input: { userId: Id; status: string }) =>
  request<AdminUser>("/api/admin/users/" + input.userId + "/status", {
    method: "PATCH",
    body: { status: input.status },
  });

export const usersUpdatePermissions = (input: { userId: Id; permissions: string[] }) =>
  request<AdminUser>("/api/admin/users/" + input.userId + "/permissions", {
    method: "PATCH",
    body: { permissions: input.permissions },
  });

export const usersToggleDeveloper = (input: {
  userId: Id; isDeveloper: boolean; developerTitle: string;
}) =>
  request<AdminUser>("/api/admin/users/" + input.userId + "/developer", {
    method: "PATCH",
    body: { isDeveloper: input.isDeveloper, developerTitle: input.developerTitle },
  });

// ── posts ────────────────────────────────────────────────────────────────────

export const postsAdminList = () => request<AdminPost[]>("/api/admin/posts").then(listOf<AdminPost>);

export const postsUpdateStatus = (input: { postId: Id; status: string }) =>
  request<Ok>("/api/admin/posts/" + input.postId + "/status", {
    method: "PATCH",
    body: { status: input.status },
  });

export const postsDelete = (input: { postId: Id }) =>
  request<Ok>("/api/admin/posts/" + input.postId, { method: "DELETE" });

// ── orders & shipments ───────────────────────────────────────────────────────

export const ordersList = () => request<AdminOrder[]>("/api/admin/orders").then(listOf<AdminOrder>);

export const ordersUpdateStatus = (input: { orderId: Id; status: string; notes?: string }) =>
  request<Ok>("/api/admin/orders/" + input.orderId + "/status", {
    method: "PATCH",
    body: { status: input.status, notes: input.notes },
  });

export const ordersCancel = (input: { orderId: Id; reason?: string }) =>
  request<Ok>("/api/admin/orders/" + input.orderId + "/cancel", {
    method: "PATCH",
    body: { reason: input.reason },
  });

export const shipmentUpdate = (input: {
  shipmentId: Id; status?: string; carrier?: string;
  trackingNumber?: string; estimatedDeliveryDate?: string; notes?: string;
}) => {
  const { shipmentId, ...body } = input;
  return request<Ok>("/api/admin/shipments/" + shipmentId, { method: "PATCH", body });
};

// ── brands ───────────────────────────────────────────────────────────────────

export const brandsList = () => request<AdminBrand[]>("/api/admin/brands").then(listOf<AdminBrand>);

export const brandsCreate = (input: { name: string; country?: string; category?: string }) =>
  request<AdminBrand>("/api/admin/brands", { method: "POST", body: input });

export const brandsUpdate = (input: { id: Id } & Partial<AdminBrand>) => {
  const { id, ...body } = input;
  return request<AdminBrand>("/api/admin/brands/" + id, { method: "PUT", body });
};

export const brandsDelete = (input: { id: Id }) =>
  request<Ok>("/api/admin/brands/" + input.id, { method: "DELETE" });

export const brandsPending = () =>
  request<PendingBrand[]>("/api/admin/brands/pending").then(listOf<PendingBrand>);

export const brandsApprove = (input: { storeId: Id; approve: boolean }) =>
  request<Ok>("/api/admin/brands/" + input.storeId + "/approve", {
    method: "PATCH",
    body: { approve: input.approve },
  });

// ── withdrawals ──────────────────────────────────────────────────────────────

export const withdrawalsList = () =>
  request<AdminWithdrawal[]>("/api/admin/withdrawals").then(listOf<AdminWithdrawal>);

export const withdrawalsUpdateStatus = (input: {
  id: Id; status: string; adminNotes?: string; rejectionReason?: string;
}) => {
  const { id, ...body } = input;
  return request<Ok>("/api/admin/withdrawals/" + id + "/status", { method: "PATCH", body });
};

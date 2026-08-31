/**
 * The console's data layer.
 *
 * Exposes the same call surface the pages were written against, so switching
 * them from tRPC to REST is an import change rather than a rewrite:
 *
 *   api.users.list.useQuery()
 *   api.users.updateRole.useMutation()
 *   const utils = api.useUtils(); utils.users.list.invalidate();
 *
 * Procedure names are kept verbatim from the old tRPC router — including ones
 * that no longer describe the backend well (`brandStore.listPending` is really
 * "brands awaiting verification", `delivery.adminListOrders` is just orders).
 * Renaming them would have meant touching every page for no behavioural gain.
 */
import { m, makeUseUtils, q } from "./core";
import * as ep from "./endpoints";
import type {
  ActivityEntry, AdminBrand, AdminOrder, AdminPost, AdminUser, AdminWithdrawal,
  DashboardMetrics, FinancialSummary, Id, MonthlyPoint, Ok, PendingBrand,
} from "./types";

const procedures = {
  auth: {
    me: q<void, AdminUser | null>(["auth", "me"], ep.authMe),
    signIn: m<{ email: string; password: string }, any>(["auth", "signIn"], ep.signIn),
    signUp: m<{ name: string; email: string; password: string }, any>(["auth", "signUp"], ep.signUp),
    logout: m<void, any>(["auth", "logout"], ep.logout),
    requestPasswordReset: m<{ email: string }, any>(["auth", "requestPasswordReset"], ep.requestPasswordReset),
    resetPassword: m<{ email: string; code: string; newPassword: string }, any>(
      ["auth", "resetPassword"], ep.resetPassword
    ),
  },

  dashboard: {
    metrics: q<void, DashboardMetrics>(["dashboard", "metrics"], ep.metrics),
    recentActivity: q<void, ActivityEntry[]>(["dashboard", "recentActivity"], ep.recentActivity),
  },

  analytics: {
    financialSummary: q<void, FinancialSummary>(["analytics", "financialSummary"], ep.financialSummary),
    full: q<void, MonthlyPoint[]>(["analytics", "full"], ep.analyticsFull),
  },

  users: {
    list: q<void, AdminUser[]>(["users", "list"], ep.usersList),
    create: m<any, AdminUser>(["users", "create"], ep.usersCreate),
    update: m<any, AdminUser>(["users", "update"], ep.usersUpdate),
    updateRole: m<{ userId: Id; role: "admin" | "user" }, AdminUser>(["users", "updateRole"], ep.usersUpdateRole),
    updateStatus: m<{ userId: Id; status: string }, AdminUser>(["users", "updateStatus"], ep.usersUpdateStatus),
    updatePermissions: m<{ userId: Id; permissions: string[] }, AdminUser>(
      ["users", "updatePermissions"], ep.usersUpdatePermissions
    ),
    toggleDeveloper: m<{ userId: Id; isDeveloper: boolean; developerTitle: string }, AdminUser>(
      ["users", "toggleDeveloper"], ep.usersToggleDeveloper
    ),
  },

  posts: {
    adminList: q<void, AdminPost[]>(["posts", "adminList"], ep.postsAdminList),
    updateStatus: m<{ postId: Id; status: string }, Ok>(["posts", "updateStatus"], ep.postsUpdateStatus),
    delete: m<{ postId: Id }, Ok>(["posts", "delete"], ep.postsDelete),
  },

  orders: {
    updateStatus: m<{ orderId: Id; status: string; notes?: string }, Ok>(
      ["orders", "updateStatus"], ep.ordersUpdateStatus
    ),
    cancelOrder: m<{ orderId: Id; reason?: string }, Ok>(["orders", "cancelOrder"], ep.ordersCancel),
  },

  delivery: {
    adminListOrders: q<void, AdminOrder[]>(["delivery", "adminListOrders"], ep.ordersList),
    updateShipment: m<any, Ok>(["delivery", "updateShipment"], ep.shipmentUpdate),
  },

  brands: {
    list: q<void, AdminBrand[]>(["brands", "list"], ep.brandsList),
    create: m<any, AdminBrand>(["brands", "create"], ep.brandsCreate),
    update: m<any, AdminBrand>(["brands", "update"], ep.brandsUpdate),
    delete: m<{ id: Id }, Ok>(["brands", "delete"], ep.brandsDelete),
  },

  brandStore: {
    listPending: q<void, PendingBrand[]>(["brandStore", "listPending"], ep.brandsPending),
    approve: m<{ storeId: Id; approve: boolean }, Ok>(["brandStore", "approve"], ep.brandsApprove),
  },

  withdrawals: {
    adminList: q<void, AdminWithdrawal[]>(["withdrawals", "adminList"], ep.withdrawalsList),
    adminUpdateStatus: m<any, Ok>(["withdrawals", "adminUpdateStatus"], ep.withdrawalsUpdateStatus),
  },
};

/** `api.useUtils()` mirrors tRPC's, so pages keep calling it unchanged. */
export const useUtils = makeUseUtils(procedures);

export const api = { ...procedures, useUtils };

export { ApiError, isForbidden, isUnauthorized } from "./errors";
export { clearTokens, getAccessToken } from "./auth-store";
export type * from "./types";

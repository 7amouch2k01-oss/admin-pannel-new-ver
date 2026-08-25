import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ENV } from "./env";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const syncProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    const token = ctx.req.headers["x-sync-token"];
    if (!token || token !== ENV.syncSecret) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or missing sync token",
      });
    }
    return next({ ctx });
  })
);

export const protectedProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user as NonNullable<typeof ctx.user>,
      },
    });
  })
);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user as NonNullable<typeof ctx.user>,
      },
    });
  })
);

/**
 * Creates an admin procedure that strictly checks for a specific modular permission
 * (e.g. "users", "products", "orders", "analytics", "brands", "settings").
 * Owners and Root Admins (ID 1 or isOwner = true) bypass checks automatically.
 */
export function permissionProcedure(permission: string) {
  return adminProcedure.use(
    t.middleware(async opts => {
      const { ctx, next } = opts;
      const user = ctx.user as any;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }

      // Owner and root admin bypass permission checks
      const isOwner = user.isOwner === true || user.id === 1;
      if (isOwner) {
        return next({
          ctx: {
            ...ctx,
            user: ctx.user,
          },
        });
      }

      // Check user permissions array
      const userPerms: string[] = Array.isArray(user.permissions)
        ? user.permissions
        : ["dashboard"];

      if (!userPerms.includes(permission)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Access denied: You do not have permission to access the '${permission}' module. Please contact the platform owner.`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    })
  );
}


/**
 * Compatibility alias.
 *
 * The console used to talk to a co-located tRPC server; it now talks to the
 * Styly REST API through `lib/api`, which exposes the same call surface. Pages
 * still import `trpc`, so this keeps that name working. It can go once every
 * page has been renamed to `api`.
 */
export { api as trpc, useUtils } from "./api";

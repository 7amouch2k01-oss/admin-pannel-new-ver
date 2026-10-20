# Baseline Engineering Report — Styly Admin Dashboard

## 1. Executive Summary

- **Repository**: `https://github.com/Wrapped-Tn/styly-admin-dashboard.git`
- **Architecture Role**: Dedicated enterprise admin Single Page Application (SPA).
- **Branch**: `antigravity/engineering-baseline`
- **Toolchain**: Node.js `v26.7.0` (pinned by `.nvmrc` to `20.19.0+`), pnpm `10.4.1`, Vite `7.1.9`, TypeScript `5.9.3`, React `19.2.1`, Tailwind CSS `4.1.14`.
- **Backend Architecture Shift**: The repository previously contained an experimental, co-located tRPC + MongoDB server that diverged from the production backend. In commit `6d0d69e`, the legacy server was removed and the admin console was rewired directly to the unified Styly REST API (`New_Styly_Back_end`: Express + Prisma + PostgreSQL).
- **Current Health**:
  - `pnpm install`: Clean (lockfile respected).
  - `pnpm check`: Passed (0 TypeScript errors).
  - `pnpm test`: Passed (12 tests passing across auth store, HTTP transport, and AdminGuard).
  - `pnpm build`: Passed (clean production assets compiled to `dist/public`).

---

## 2. Baseline Verification Log

| Command | Status | Result / Metrics |
| :--- | :--- | :--- |
| `pnpm install` | ✅ Passed | 270 base packages + 75 testing devDependencies installed in 14.5s |
| `pnpm check` | ✅ Passed | `tsc --noEmit` resolved 0 type errors across all client source and test files |
| `pnpm test` | ✅ Passed | Vitest runner executing 3 test suites: `auth-store.test.ts`, `http.test.ts`, `AdminGuard.test.tsx` (12 tests passed) |
| `pnpm build` | ✅ Passed | `dist/public/index.html` (1.15 kB), CSS (159.17 kB / 23.72 kB gzip), JS bundle (1,028.99 kB / 288.66 kB gzip) in 11.96s |

---

## 3. Architecture Topology

```
+-----------------------------------------------------------+
|              Styly Admin Console (React 19 SPA)           |
|  - Wouter routing (/admin/*)                              |
|  - TanStack Query v5 cache                                |
|  - Bearer JWT storage in localStorage with BroadcastSync |
|  - AdminGuard route protection & granular RBAC checks    |
+-----------------------------+-----------------------------+
                              |
                     HTTPS / Same-Origin
                              |
+-----------------------------v-----------------------------+
|                 Nginx Reverse Proxy (VPS)                 |
|  - Serves static SPA from /var/www/admin.styly.tn/current |
|  - Proxies /api/* to Styly API (127.0.0.1:4000)          |
|  - Proxies /files/* and /uploads/* to storage layer       |
+-----------------------------+-----------------------------+
                              |
+-----------------------------v-----------------------------+
|          Styly Core API (New_Styly_Back_end)              |
|  - Express REST API                                       |
|  - requireAdmin & requirePermission middleware            |
|  - Prisma ORM                                             |
|  - PostgreSQL Database                                    |
+-----------------------------------------------------------+
```

---

## 4. Key Findings & Environment Blockers

1. **Standalone SPA Design**: The console does not require a local MongoDB or tRPC server. In local development, it proxies `/api` and `/files` to `http://127.0.0.1:4000` via Vite `server.proxy` configurable with `VITE_API_PROXY_TARGET`.
2. **Missing Test Harness (Now Resolved)**: The project previously lacked an active unit test suite after the legacy server was removed. We added Vitest, `@testing-library/react`, and `@testing-library/jest-dom/vitest`, establishing test coverage over critical auth and authorization gates.
3. **Chunk Size Alert**: Main JavaScript bundle is currently ~1.02 MB uncompressed (~288 kB gzip). It contains full Recharts, Framer Motion, and Radix bundles. Route-level lazy loading (`React.lazy`) should be scheduled to optimize initial load times.

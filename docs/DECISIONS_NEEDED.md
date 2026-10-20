# Technical Decisions & Backlog — Styly Admin Dashboard

This document tracks technical decisions needed from project stakeholders and engineering leadership, categorized by impact and urgency.

---

## 1. High Priority Decisions

### Decision 1.1: Password Change Implementation in Settings Page
- **Context**: In `client/src/pages/Settings.tsx`, the password change form currently simulates a delay (`handlePasswordChange`) without calling an active backend API endpoint.
- **Options**:
  1. Wire the form to a dedicated `/api/auth/change-password` endpoint on the backend.
  2. Hide the password change section from the admin panel until the backend endpoint is implemented, directing administrators to use the OTP flow (`/admin/reset-password`).
- **Recommendation**: Implement and wire Option 1 if the backend endpoint is ready; otherwise enact Option 2 to avoid giving users false success feedback.

### Decision 1.2: Public Registration Visibility
- **Context**: In `client/src/pages/Auth.tsx`, registration is currently guarded behind `ENABLE_SELF_REGISTRATION = false`.
- **Options**:
  1. Keep self-registration strictly disabled in production (admin accounts should only be provisioned by existing Platform Owners).
  2. Convert to an invitation-only link with signed tokens.
- **Recommendation**: Keep Option 1 as default. Admin users should be provisioned via `usersCreate` inside the admin team management console.

---

## 2. Medium Priority Architecture Improvements

### Decision 2.1: Code-Splitting and Lazy Route Loading
- **Context**: The production build currently outputs a single primary JS chunk of 1,028 kB. Vite warns that chunks exceed 500 kB.
- **Options**:
  1. Implement `React.lazy()` for admin page routes (`Overview`, `Users`, `Products`, `Orders`, `Analytics`, `Brands`, `Settings`) in `AdminApp.tsx`.
  2. Configure manual rollup chunks in `vite.config.ts` for heavy third-party dependencies (`recharts`, `framer-motion`, `lucide-react`).
- **Recommendation**: Implement both. This will drop initial bundle load time by ~60% without breaking any runtime behavior.

### Decision 2.2: Phased Migration from `trpc` Import Aliases to `api`
- **Context**: `client/src/lib/trpc.ts` acts as an alias re-exporting `api` as `trpc`. All pages still import `trpc`.
- **Options**:
  1. Leave alias in place to minimize churn on active branches.
  2. Incrementally rename `import { trpc }` to `import { api }` file by file.
- **Recommendation**: Leave alias in place during baseline stabilization; refactor file by file when making domain modifications.

---

## 3. Recommended Backlog

1. **Sprint 1 (Immediate Next Steps)**:
   - Add route-level code splitting via `React.lazy()` to shrink bundle size.
   - Wire Settings page profile and password forms to verified backend endpoints or display informative status.
   - Expand unit tests to cover `endpoints.ts` response normalization.
2. **Sprint 2 (Hardening)**:
   - Add end-to-end integration tests using Mock Service Worker (MSW) or Playwright.
   - Implement audit log timeline UI for tracking admin actions (e.g., who changed which permissions).

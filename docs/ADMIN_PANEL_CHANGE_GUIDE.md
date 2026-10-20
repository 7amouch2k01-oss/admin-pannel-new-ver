# Admin Panel Change Guide — Styly Admin Dashboard

This guide provides a domain-by-domain architectural blueprint for engineers modifying or extending the Styly Admin Console.

---

## Domain Matrix

| Domain | Frontend View | Backend API Endpoints | Data Models / Types | Required Permission | Primary Tests |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & Session** | `pages/Auth.tsx`<br>`pages/ResetPassword.tsx` | `/api/auth/login`<br>`/api/auth/register`<br>`/api/auth/refresh`<br>`/api/auth/logout`<br>`/api/auth/forgot-password`<br>`/api/auth/reset-password` | `AdminUser`<br>`AuthTokens` | Public (Unauthenticated) | `lib/api/auth-store.test.ts`<br>`lib/api/http.test.ts` |
| **Users & Admin Team** | `pages/Users.tsx`<br>`components/UserDetailDialog.tsx`<br>`components/UserFormDialog.tsx` | `/api/admin/users`<br>`/api/admin/users/:id/role`<br>`/api/admin/users/:id/status`<br>`/api/admin/users/:id/permissions`<br>`/api/admin/users/:id/developer` | `AdminUser` | `users` (Owner/Co-Owner for privilege changes) | `components/AdminGuard.test.tsx` |
| **Creator Withdrawals** | `pages/Users.tsx` (Withdrawals tab) | `/api/admin/withdrawals`<br>`/api/admin/withdrawals/:id/status` | `AdminWithdrawal` | `users` | `components/AdminGuard.test.tsx` |
| **Products & Outfits** | `pages/Products.tsx` | `/api/admin/posts`<br>`/api/admin/posts/:id/status`<br>`/api/admin/posts/:id` | `AdminPost` | `products` | `components/AdminGuard.test.tsx` |
| **Orders & Logistics** | `pages/Orders.tsx` | `/api/admin/orders`<br>`/api/admin/orders/:id/status`<br>`/api/admin/orders/:id/cancel`<br>`/api/admin/shipments/:id` | `AdminOrder`<br>`AdminShipment` | `orders` | `components/AdminGuard.test.tsx` |
| **Brand Management** | `pages/Brands.tsx`<br>`components/BrandFormDialog.tsx` | `/api/admin/brands`<br>`/api/admin/brands/pending`<br>`/api/admin/brands/:id`<br>`/api/admin/brands/:id/approve` | `AdminBrand`<br>`PendingBrand` | `brands` | `components/AdminGuard.test.tsx` |
| **Financial Analytics** | `pages/Analytics.tsx`<br>`pages/Overview.tsx` | `/api/admin/metrics`<br>`/api/admin/analytics/summary`<br>`/api/admin/analytics/monthly`<br>`/api/admin/activity` | `DashboardMetrics`<br>`FinancialSummary`<br>`MonthlyPoint` | `analytics`<br>`dashboard` | `components/AdminGuard.test.tsx` |
| **System Settings** | `pages/Settings.tsx` | `/api/admin/users/:id` (password change via auth endpoint) | `AdminUser` | `settings` | `components/AdminGuard.test.tsx` |

---

## Detailed Domain Procedures

### 1. Users, Admin Roles & Developer Badges
- **How it works**:
  - `pages/Users.tsx` renders 3 views: App Users, Staff Team, and Creator Withdrawals.
  - Modifying an administrator's permissions requires `canManageAdminPermissions` (`isOwner === true` or `isCoOwner === true`).
  - Granting developer badges (`trpc.users.toggleDeveloper`) or changing titles requires Owner rights.
- **Rules for changes**:
  - Never allow an admin to modify their own permissions or demote themselves.
  - Ensure the backend rejects unauthorized role escalations with `403 Forbidden`.

### 2. Products & Outfits (Post Moderation)
- **How it works**:
  - `pages/Products.tsx` displays creator outfit posts with garment tags, engagement metrics, and status (`active`, `hidden`, `flagged`).
  - Actions: Hide post, restore post, or permanently delete.
- **Rules for changes**:
  - Ensure image assets load through `mediaUrl(post.imageUrl)` to guarantee proxy compatibility.

### 3. Orders, Shipments & Refunds
- **How it works**:
  - `pages/Orders.tsx` inspects customer orders partitioned by brand partners.
  - Provides tracking number assignments, status updates (`pending`, `confirmed`, `shipped`, `delivered`), cancellations, and refund processing.
- **Rules for changes**:
  - Financial adjustments and refund approvals directly affect net platform revenue. All status changes must be validated with backend confirmation toasts.

### 4. Creator Commissions & Withdrawals
- **How it works**:
  - Withdrawal requests appear in `Users.tsx` under the Withdrawals tab.
  - Admins can approve or reject with a documented rejection reason (which restores the creator's platform balance).
- **Rules for changes**:
  - Any change to payout statuses (`approved`, `completed`, `rejected`) must pass an atomic check to prevent duplicate payouts.

### 5. Adding a New Admin Route
When adding a new route:
1. Define the DTO in `client/src/lib/api/types.ts`.
2. Add the endpoint in `client/src/lib/api/endpoints.ts`.
3. Register the procedure in `client/src/lib/api/index.ts`.
4. Create the view component under `client/src/pages/YourPage.tsx`.
5. Add the flat route in `client/src/AdminApp.tsx` wrapped in `<AdminPage permission="your-permission">`.
6. Add the navigation item in `client/src/components/DashboardLayout.tsx` with permission gating.
7. Add test coverage in `client/src/components/AdminGuard.test.tsx`.

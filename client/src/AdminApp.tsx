import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import DashboardLayout from "./components/DashboardLayout";
import AdminGuard from "./components/AdminGuard";
import Unauthorized from "./pages/Unauthorized";
import Overview from "./pages/Overview";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Brands from "./pages/Brands";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";

/**
 * Wraps a page component with AdminGuard + DashboardLayout.
 * Each admin route renders through this to get auth protection + sidebar.
 */
function AdminPage({ children, permission = "dashboard" }: { children: React.ReactNode; permission?: string }) {
  return (
    <AdminGuard permission={permission}>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminGuard>
  );
}

function Router() {
  return (
    <Switch>
      {/* ── Root: redirect to /admin ── */}
      <Route path="/">
        <Redirect to="/admin" replace />
      </Route>

      {/* ── Auth / misc ── */}
      <Route path="/auth" component={Auth} />
      <Route path="/admin/reset-password" component={ResetPassword} />
      <Route path="/unauthorized" component={Unauthorized} />
      <Route path="/404" component={NotFound} />

      {/* ── Admin pages (flat routes, no nested Switch) ──
          Each route must be its own flat entry so wouter v3 exact-matching works. */}
      <Route path="/admin">
        <AdminPage permission="dashboard"><Overview /></AdminPage>
      </Route>

      <Route path="/admin/users">
        <AdminPage permission="users"><Users /></AdminPage>
      </Route>

      <Route path="/admin/products">
        <AdminPage permission="products"><Products /></AdminPage>
      </Route>

      <Route path="/admin/orders">
        <AdminPage permission="orders"><Orders /></AdminPage>
      </Route>

      <Route path="/admin/analytics">
        <AdminPage permission="analytics"><Analytics /></AdminPage>
      </Route>

      <Route path="/admin/brands">
        <AdminPage permission="brands"><Brands /></AdminPage>
      </Route>

      <Route path="/admin/settings">
        <AdminPage permission="settings"><Settings /></AdminPage>
      </Route>

      {/* ── Catch-all ── */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminApp() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AdminApp;

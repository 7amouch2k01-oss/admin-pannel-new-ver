import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

// Dev bypass: allow exploring without real backend auth session
const DEV_BYPASS_AUTH = true;

const MOCK_ADMIN_USER = {
  id: "amine-owner-id",
  name: "Amine",
  firstname: "Amine",
  lastname: "",
  email: "amine@styly.tn",
  role: "admin" as const,
  status: "active" as const,
  permissions: [
    "dashboard",
    "users",
    "products",
    "orders",
    "analytics",
    "brands",
    "settings",
    "advanced_settings",
  ],
  isOwner: true,
  isCoOwner: false,
  isDeveloper: true,
  developerTitle: "Platform Owner & Founder",
  grade: 5,
  gradeTitle: "Master Styler",
  stylePoints: 99999,
  totalEarned: 125000,
  avatarUrl: null,
  phone: "+216 22 100 200",
  createdAt: "2026-01-01T00:00:00.000Z",
  isEmailVerified: true,
};

export default function AdminGuard({
  children,
  permission = "dashboard",
}: {
  children: React.ReactNode;
  permission?: string;
}) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;

    if (!loading) {
      if (!user) {
        setLocation("/auth");
      } else if (user.role !== "admin") {
        setLocation("/unauthorized");
      } else if (permission && permission !== "dashboard") {
        const currentUser = user as any;
        const isOwner = currentUser.isOwner === true;
        if (!isOwner) {
          const perms: string[] = Array.isArray(currentUser.permissions)
            ? currentUser.permissions
            : ["dashboard"];
          if (!perms.includes(permission)) {
            setLocation("/unauthorized");
          }
        }
      }
    }
  }, [user, loading, setLocation, permission]);

  if (DEV_BYPASS_AUTH) {
    return <>{children}</>;
  }

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (permission && permission !== "dashboard") {
    const currentUser = user as any;
    const isOwner = currentUser.isOwner === true;
    if (!isOwner) {
      const perms: string[] = Array.isArray(currentUser.permissions)
        ? currentUser.permissions
        : ["dashboard"];
      if (!perms.includes(permission)) {
        return null;
      }
    }
  }

  return <>{children}</>;
}

export { MOCK_ADMIN_USER, DEV_BYPASS_AUTH };

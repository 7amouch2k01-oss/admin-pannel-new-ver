import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

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
    if (!loading) {
      if (!user) {
        setLocation("/auth");
      } else if (user.role !== "admin") {
        setLocation("/unauthorized");
      } else if (permission && permission !== "dashboard") {
        const currentUser = user as any;
        const isOwner = currentUser.isOwner === true || currentUser.id === 1;
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

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (permission && permission !== "dashboard") {
    const currentUser = user as any;
    const isOwner = currentUser.isOwner === true || currentUser.id === 1;
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

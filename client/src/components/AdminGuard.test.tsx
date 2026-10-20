import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AdminGuard from "./AdminGuard";

const mockUseLocation = vi.fn();
vi.mock("wouter", () => ({
  useLocation: () => ["/", mockUseLocation],
}));

let mockAuthState: {
  user: any;
  loading: boolean;
} = {
  user: null,
  loading: false,
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => mockAuthState,
}));

vi.mock("./DashboardLayoutSkeleton", () => ({
  DashboardLayoutSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe("AdminGuard", () => {
  it("renders skeleton while auth state is loading", () => {
    mockAuthState = { user: null, loading: true };
    render(
      <AdminGuard permission="dashboard">
        <div data-testid="protected-content">Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /auth and hides content", () => {
    mockAuthState = { user: null, loading: false };
    render(
      <AdminGuard permission="dashboard">
        <div data-testid="protected-content">Content</div>
      </AdminGuard>
    );

    expect(mockUseLocation).toHaveBeenCalledWith("/auth");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects non-admin role users to /unauthorized", () => {
    mockAuthState = {
      user: { id: "1", role: "user", email: "user@styly.tn" },
      loading: false,
    };
    render(
      <AdminGuard permission="dashboard">
        <div data-testid="protected-content">Content</div>
      </AdminGuard>
    );

    expect(mockUseLocation).toHaveBeenCalledWith("/unauthorized");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("blocks admin who lacks the required granular permission", () => {
    mockAuthState = {
      user: {
        id: "2",
        role: "admin",
        isOwner: false,
        permissions: ["dashboard", "users"],
      },
      loading: false,
    };
    render(
      <AdminGuard permission="orders">
        <div data-testid="protected-content">Content</div>
      </AdminGuard>
    );

    expect(mockUseLocation).toHaveBeenCalledWith("/unauthorized");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("allows admin with the required granular permission", () => {
    mockAuthState = {
      user: {
        id: "2",
        role: "admin",
        isOwner: false,
        permissions: ["dashboard", "orders"],
      },
      loading: false,
    };
    render(
      <AdminGuard permission="orders">
        <div data-testid="protected-content">Orders Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("allows platform owner to access any protected section regardless of permission array", () => {
    mockAuthState = {
      user: {
        id: "3",
        role: "admin",
        isOwner: true,
        permissions: [],
      },
      loading: false,
    };
    render(
      <AdminGuard permission="analytics">
        <div data-testid="protected-content">Analytics Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});

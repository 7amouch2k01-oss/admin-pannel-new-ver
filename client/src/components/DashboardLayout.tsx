import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users, ImageIcon, ShoppingCart, BarChart3, Settings, Moon, Sun, Package, Crown, Globe } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const menuItems = [
  { icon: LayoutDashboard, key: "nav.overview", defaultLabel: "Overview", path: "/admin", perm: "dashboard" },
  { icon: Users, key: "nav.users", defaultLabel: "Users", path: "/admin/users", perm: "users" },
  { icon: ImageIcon, key: "nav.posts", defaultLabel: "Posts", path: "/admin/products", perm: "products" },
  { icon: ShoppingCart, key: "nav.orders", defaultLabel: "Orders", path: "/admin/orders", perm: "orders" },
  { icon: BarChart3, key: "nav.analytics", defaultLabel: "Analytics", path: "/admin/analytics", perm: "analytics" },
  { icon: Package, key: "nav.brands", defaultLabel: "Brands", path: "/admin/brands", perm: "brands" },
  { icon: Settings, key: "nav.settings", defaultLabel: "Settings", path: "/admin/settings", perm: "settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full border border-border/40 rounded-3xl bg-card/60 backdrop-blur-md shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
            S
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-center">
              Styly Admin Portal
            </h1>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Access to this console requires administrator authentication.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/auth";
            }}
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-bold shadow-lg shadow-primary/20"
          >
            Sign in as Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  
  if (!toggleTheme) return null;
  
  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

function LanguageToggleButton() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      className="h-8 px-2 flex items-center justify-center gap-1.5 hover:bg-accent rounded-lg transition-colors text-xs font-mono font-bold focus:outline-none border border-border/40"
      title={language === "en" ? "Passer en Français" : "Switch to English"}
    >
      <Globe size={13} className="text-primary" />
      <span>{language === "en" ? "FR 🇫🇷" : "EN 🇬🇧"}</span>
    </button>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-6 w-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-neutral-200/20">
                    <img src="/logo.png" alt="Styly Logo" className="h-full w-full object-cover" />
                  </div>
                  <span className="font-extrabold tracking-tight truncate text-primary text-base bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Styly
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems
                .filter(item => {
                  const currentUser = user as any;
                  if (!currentUser || currentUser.isOwner) return true;
                  const perms: string[] = currentUser.permissions || ["dashboard", "users", "products", "orders", "analytics", "brands", "settings"];
                  return perms.includes(item.perm);
                })
                .map(item => {
                  const label = t(item.key, item.defaultLabel);
                  if (item.path === "/admin/users") {
                    const isUsersActive = location.startsWith("/admin/users");
                    return (
                      <SidebarMenuItem key="users-dropdown">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                              isActive={isUsersActive}
                              tooltip={label}
                              className={`h-10 transition-all font-normal w-full flex items-center justify-between`}
                            >
                              <div className="flex items-center gap-2">
                                <Users className={`h-4 w-4 ${isUsersActive ? "text-primary" : ""}`} />
                                <span>{label}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">▾</span>
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right" className="w-60 rounded-2xl p-2 shadow-xl border border-border/40">
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {t("nav.accountTypes", "Account Types")}
                            </div>
                            <DropdownMenuItem
                              onClick={() => {
                                setLocation("/admin/users?tab=app");
                                window.dispatchEvent(new CustomEvent("styly_users_tab_change", { detail: "app" }));
                              }}
                              className="flex items-center gap-2 rounded-xl text-xs font-semibold py-2 cursor-pointer"
                            >
                              <Users className="h-4 w-4 text-blue-500" />
                              <div className="flex flex-col">
                                <span>{t("nav.appUsers", "App Users")}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">{t("nav.appUsersDesc", "Brands, Creators & Shoppers only")}</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setLocation("/admin/users?tab=team");
                                window.dispatchEvent(new CustomEvent("styly_users_tab_change", { detail: "team" }));
                              }}
                              className="flex items-center gap-2 rounded-xl text-xs font-semibold py-2 cursor-pointer"
                            >
                              <Settings className="h-4 w-4 text-purple-500" />
                              <div className="flex flex-col">
                                <span>{t("nav.stylyMembers", "Styly Members")}</span>
                                <span className="text-[10px] text-muted-foreground font-normal">{t("nav.stylyMembersDesc", "Admins & team permissions")}</span>
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    );
                  }

                  const isActive = location === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => setLocation(item.path)}
                        tooltip={label}
                        className={`h-10 transition-all font-normal`}
                      >
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                        />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 gap-2">
            {!isMobile && (
              <div className="flex items-center justify-between px-2 py-1.5 rounded-lg border border-border/40 bg-accent/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:bg-transparent">
                <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                  <LanguageToggleButton />
                </div>
                <ThemeToggleButton />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0 border-amber-500/40">
                    <AvatarFallback className="text-xs font-black bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-500">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold truncate leading-none">
                        {user?.name || "Amine"}
                      </p>
                      {user?.isOwner && (
                        <Crown size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-1">
                      {user?.isOwner ? "Platform Owner" : (user?.email || "-")}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl">
                <div className="px-3 py-2 border-b border-border/40">
                  <p className="text-xs font-bold text-foreground">{user?.name || "Amine"}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{user?.email || "amine@styly.tn"}</p>
                  {user?.isOwner && (
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Root Owner
                    </span>
                  )}
                </div>
                <DropdownMenuItem
                  onClick={() => setLocation("/admin/settings")}
                  className="cursor-pointer text-xs"
                >
                  <Settings className="mr-2 h-3.5 w-3.5" />
                  <span>{t("nav.settings", "Settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive text-xs"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span>{t("nav.signout", "Sign out")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground font-bold">
                    {activeMenuItem ? t(activeMenuItem.key, activeMenuItem.defaultLabel) : "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggleButton />
              <ThemeToggleButton />
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}

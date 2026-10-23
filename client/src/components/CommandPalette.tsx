import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Users,
  ImageIcon,
  ShoppingCart,
  BarChart3,
  Package,
  Settings,
  Languages,
  Moon,
  Sun,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  CreditCard,
  UserCheck,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Fetch quick live entities for instant search
  const { data: users = [] } = trpc.users.list.useQuery();
  const { data: orders = [] } = trpc.delivery.adminListOrders.useQuery();
  const { data: brands = [] } = trpc.brands.list.useQuery();

  // Listen for Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleCustomOpen = () => setOpen(true);
    window.addEventListener("keydown", down);
    window.addEventListener("styly_open_command_palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("styly_open_command_palette", handleCustomOpen);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={
          language === "fr"
            ? "Rechercher une page, commande, marque, utilisateur, action..."
            : "Search pages, orders, brands, users, quick actions..."
        }
      />
      <CommandList className="max-h-[380px] overflow-y-auto">
        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
          {language === "fr" ? "Aucun résultat trouvé." : "No results found."}
        </CommandEmpty>

        {/* Navigation Section */}
        <CommandGroup heading={language === "fr" ? "Navigation Rapide" : "Quick Navigation"}>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin"))}
            className="cursor-pointer gap-2"
          >
            <LayoutDashboard className="h-4 w-4 text-blue-500" />
            <span>{t("nav.overview", "Overview")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/analytics"))}
            className="cursor-pointer gap-2"
          >
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span>{t("nav.analytics", "Analytics & Ledger")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/orders"))}
            className="cursor-pointer gap-2"
          >
            <ShoppingCart className="h-4 w-4 text-amber-500" />
            <span>{t("nav.orders", "Orders & Shipments")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/users"))}
            className="cursor-pointer gap-2"
          >
            <Users className="h-4 w-4 text-cyan-500" />
            <span>{t("nav.users", "Users & Staff")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/brands"))}
            className="cursor-pointer gap-2"
          >
            <Package className="h-4 w-4 text-purple-500" />
            <span>{t("nav.brands", "Brands Directory")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/products"))}
            className="cursor-pointer gap-2"
          >
            <ImageIcon className="h-4 w-4 text-rose-500" />
            <span>{t("nav.posts", "Posts & Content")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/settings"))}
            className="cursor-pointer gap-2"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>{t("nav.settings", "Settings")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Settings & Actions */}
        <CommandGroup heading={language === "fr" ? "Actions & Préférences" : "Quick Actions & Preferences"}>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const next = language === "fr" ? "en" : "fr";
                setLanguage(next);
              })
            }
            className="cursor-pointer gap-2"
          >
            <Languages className="h-4 w-4 text-primary" />
            <span>
              {language === "fr" ? "Passer la console en English 🇬🇧" : "Switch console to Français 🇫🇷"}
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => toggleTheme?.())}
            className="cursor-pointer gap-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            <span>
              {theme === "dark"
                ? language === "fr" ? "Activer le Mode Clair" : "Switch to Light Mode"
                : language === "fr" ? "Activer le Mode Sombre" : "Switch to Dark Mode"}
            </span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/users?tab=withdrawals"))}
            className="cursor-pointer gap-2"
          >
            <CreditCard className="h-4 w-4 text-amber-500" />
            <span>{language === "fr" ? "Examiner les demandes de retrait en attente" : "Review pending withdrawal requests"}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => setLocation("/admin/orders?status=refund_requested"))}
            className="cursor-pointer gap-2"
          >
            <Shield className="h-4 w-4 text-rose-500" />
            <span>{language === "fr" ? "Voir les réclamations et remboursements" : "View open refund claims"}</span>
          </CommandItem>
        </CommandGroup>

        {/* Live Brands matching */}
        {brands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={language === "fr" ? "Boutiques & Marques" : "Brands & Stores"}>
              {brands.slice(0, 5).map((b: any) => (
                <CommandItem
                  key={b.id}
                  onSelect={() => runCommand(() => setLocation("/admin/brands"))}
                  className="cursor-pointer gap-2"
                >
                  <Package className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold">{b.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{b.category || "Fashion"}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Recent Orders matching */}
        {orders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={language === "fr" ? "Commandes Récentes" : "Recent Orders"}>
              {orders.slice(0, 5).map((o: any) => (
                <CommandItem
                  key={o.id}
                  onSelect={() => runCommand(() => setLocation("/admin/orders"))}
                  className="cursor-pointer gap-2"
                >
                  <ShoppingCart className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold">{o.customerName || "Customer"}</span>
                  <span className="text-xs font-mono text-muted-foreground">#{(o.id || "").slice(0, 8)}</span>
                  <span className="text-xs font-bold text-emerald-400 ml-auto font-mono">
                    {Number(o.totalAmount || 0).toFixed(2)} TND
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

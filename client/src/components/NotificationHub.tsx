import React from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  CreditCard,
  Package,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export function NotificationHub() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();

  // Live queries for actionable events
  const { data: withdrawals = [] } = trpc.withdrawals.adminList.useQuery();
  const { data: pendingBrandRequests = [] } = trpc.brandStore.listPending.useQuery();
  const { data: orders = [] } = trpc.delivery.adminListOrders.useQuery();
  const { data: posts = [] } = trpc.posts.adminList.useQuery();

  // Calculate real pending items requiring admin action
  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === "pending" || w.status === "approved");
  const refundRequestedOrders = (orders as any[]).filter((o: any) => o.status === "refund_requested");
  const flaggedPosts = (posts as any[]).filter((p: any) => p.status === "flagged");
  const pendingBrands = (pendingBrandRequests as any[]).length;

  const totalAlertCount =
    pendingWithdrawals.length +
    refundRequestedOrders.length +
    flaggedPosts.length +
    pendingBrands;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-xl border-border/50 bg-background/80 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Operational Notifications"
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {totalAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-pulse">
              {totalAlertCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-2xl p-2 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-foreground">
              {language === "fr" ? "Centre d'Opérations Styly" : "Styly Operations Hub"}
            </span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {totalAlertCount > 0
              ? `${totalAlertCount} ${language === "fr" ? "en attente" : "pending"}`
              : (language === "fr" ? "Tout est à jour" : "All clear")}
          </Badge>
        </div>

        <div className="py-1 space-y-1 max-h-[340px] overflow-y-auto">
          {/* Pending Creator & Brand Withdrawals */}
          {pendingWithdrawals.length > 0 ? (
            <DropdownMenuItem
              onClick={() => setLocation("/admin/users?tab=withdrawals")}
              className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-amber-500/10 focus:bg-amber-500/10 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {pendingWithdrawals.length} {language === "fr" ? "Retraits en Attente" : "Withdrawal Requests"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {language === "fr"
                    ? "Virements créateurs & marques à valider"
                    : "Creator & brand payouts awaiting disbursement"}
                </p>
              </div>
            </DropdownMenuItem>
          ) : null}

          {/* Customer Refund Claims */}
          {refundRequestedOrders.length > 0 ? (
            <DropdownMenuItem
              onClick={() => setLocation("/admin/orders")}
              className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-rose-500/10 focus:bg-rose-500/10 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-rose-500">
                  {refundRequestedOrders.length} {language === "fr" ? "Demandes de Remboursement" : "Return Claims"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {language === "fr"
                    ? "Réclamations clients ouvertes sur des commandes"
                    : "Open customer returns needing review"}
                </p>
              </div>
            </DropdownMenuItem>
          ) : null}

          {/* Pending Brand Store Applications */}
          {pendingBrands > 0 ? (
            <DropdownMenuItem
              onClick={() => setLocation("/admin/brands")}
              className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-purple-500/10 focus:bg-purple-500/10 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                <Package size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-purple-400">
                  {pendingBrands} {language === "fr" ? "Nouvelles Marques" : "Brand Applications"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {language === "fr"
                    ? "Boutiques partenaires en attente d'approbation"
                    : "Partner fashion stores awaiting certification"}
                </p>
              </div>
            </DropdownMenuItem>
          ) : null}

          {/* Flagged Community Looks */}
          {flaggedPosts.length > 0 ? (
            <DropdownMenuItem
              onClick={() => setLocation("/admin/products")}
              className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-blue-500/10 focus:bg-blue-500/10 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-400">
                  {flaggedPosts.length} {language === "fr" ? "Publications Signalées" : "Flagged Outfits"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {language === "fr"
                    ? "Tenues nécessitant vérification admin"
                    : "Community looks requiring review"}
                </p>
              </div>
            </DropdownMenuItem>
          ) : null}

          {totalAlertCount === 0 && (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-75" />
              <p className="text-xs font-bold text-foreground">
                {language === "fr" ? "Opérations à Jour !" : "Everything is in Order!"}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-[200px] mx-auto">
                {language === "fr"
                  ? "Aucun virement en attente, réclamation ou marque non traitée."
                  : "No pending payouts, open refund claims, or unreviewed stores."}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ImageIcon, ShoppingCart, BarChart3, Package, ArrowUpRight, TrendingUp, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Overview() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: metrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();
  const { data: activity, isLoading: activityLoading } = trpc.dashboard.recentActivity.useQuery();
  const { data: finance } = trpc.analytics.financialSummary.useQuery();

  const currentUser = user as any;
  const isOwner = currentUser?.isOwner === true;
  const userPermissions: string[] = isOwner
    ? ["dashboard", "users", "products", "orders", "analytics", "brands", "settings"]
    : Array.isArray(currentUser?.permissions)
    ? currentUser.permissions
    : ["dashboard"];

  // 5 Quick Navigation Core Cards with explicit permission mapping
  const quickNavCards = [
    {
      title: t("overview.usersTitle"),
      desc: t("overview.usersDesc"),
      value: metrics?.totalUsers ?? 0,
      subtext: t("overview.usersSub"),
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20 hover:border-blue-500/50",
      path: "/admin/users",
      perm: "users",
    },
    {
      title: t("overview.postsTitle"),
      desc: t("overview.postsDesc"),
      value: metrics?.totalPosts ?? 0,
      subtext: t("overview.postsSub"),
      icon: ImageIcon,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20 hover:border-rose-500/50",
      path: "/admin/products",
      perm: "products",
    },
    {
      title: t("overview.ordersTitle"),
      desc: t("overview.ordersDesc"),
      value: metrics?.totalOrders ?? 0,
      subtext: t("overview.ordersSub"),
      icon: ShoppingCart,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20 hover:border-amber-500/50",
      path: "/admin/orders",
      perm: "orders",
    },
    {
      title: t("overview.analyticsTitle"),
      desc: t("overview.analyticsDesc"),
      value: finance?.grossRevenue !== undefined ? `${finance.grossRevenue.toFixed(0)} TND` : `${(metrics?.totalRevenue ?? 0).toFixed(0)} TND`,
      subtext: `${t("overview.analyticsSub")}: ${finance?.netGain !== undefined ? finance.netGain.toFixed(0) : "0"} TND`,
      icon: BarChart3,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      path: "/admin/analytics",
      perm: "analytics",
    },
    {
      title: t("overview.brandsTitle"),
      desc: t("overview.brandsDesc"),
      value: metrics?.totalBrands ?? 0,
      subtext: t("overview.brandsSub"),
      icon: Package,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20 hover:border-purple-500/50",
      path: "/admin/brands",
      perm: "brands",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
            S
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{t("overview.hubBadge")}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">{t("overview.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("overview.subtitle")}
        </p>
      </div>

      {/* 5 Core Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {quickNavCards.map((card) => {
          const Icon = card.icon;
          const hasAccess = userPermissions.includes(card.perm);

          return (
            <Card
              key={card.title}
              onClick={() => {
                if (!hasAccess) {
                  toast.error(`Permission Denied: You do not have access to ${card.title}.`);
                  return;
                }
                setLocation(card.path);
              }}
              className={`border bg-card/60 backdrop-blur transition-all duration-200 relative ${
                hasAccess
                  ? `cursor-pointer hover:scale-[1.02] hover:shadow-xl group ${card.border}`
                  : "opacity-60 cursor-not-allowed border-dashed border-border/70 hover:opacity-75"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {hasAccess ? (
                    <div className="h-6 w-6 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                      <Lock className="h-3 w-3" />
                      <span>{t("overview.locked")}</span>
                    </div>
                  )}
                </div>
                <CardTitle className={`text-sm font-bold mt-3 transition-colors ${hasAccess ? "text-foreground group-hover:text-primary" : "text-muted-foreground"}`}>
                  {card.title}
                </CardTitle>
                <CardDescription className="text-[11px] line-clamp-1">
                  {hasAccess ? card.desc : t("overview.lockedDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 space-y-1">
                <div className="text-2xl font-black text-foreground">
                  {metricsLoading ? <Skeleton className="h-7 w-16" /> : card.value}
                </div>
                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasAccess ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {card.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Financial Summary Highlight Banner */}
      {finance && (
        <Card className="border border-border/50 bg-gradient-to-r from-card/80 via-primary/5 to-card/80 backdrop-blur p-6 rounded-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("overview.salesTitle")}</p>
              <p className="text-2xl font-black text-foreground">{finance.grossRevenue.toFixed(2)} TND</p>
              <p className="text-[11px] text-muted-foreground">{t("overview.salesSub")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("overview.refundsTitle")}</p>
              <p className="text-2xl font-black text-rose-500">-{finance.totalRefunds.toFixed(2)} TND</p>
              <p className="text-[11px] text-muted-foreground">
                {finance.refundsCount} {t("overview.refundsReturned")}{finance.pendingRefundsCount > 0 ? ` · ${finance.pendingRefundsCount} ${t("overview.refundsClaims")}` : ""}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("overview.commPaidTitle")}</p>
              <p className="text-2xl font-black text-amber-500">-{finance.commissionsPaid.toFixed(2)} TND</p>
              <p className="text-[11px] text-muted-foreground">{finance.commissionsPending.toFixed(2)} TND {t("overview.commPending")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider font-bold">{t("overview.netGainTitle")}</p>
              <p className={`text-2xl font-black ${finance.netGain < 0 ? "text-rose-500" : "text-emerald-500"}`}>
                {finance.netGain < 0 ? "" : "+"}{finance.netGain.toFixed(2)} TND
              </p>
              <p className="text-[11px] text-emerald-600/80 font-medium">{t("overview.netGainSub")}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent System Activity */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{t("overview.activityTitle")}</CardTitle>
              <CardDescription>
                {t("overview.activityDesc")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
              <CheckCircle2 size={13} />
              <span>{t("overview.activitySynced")}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              activity.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                      {log.entityType ? log.entityType[0].toUpperCase() : "A"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-foreground">{log.action}</p>
                        <span className="text-[9px] bg-background border border-border/50 px-1.5 py-0.5 rounded font-mono uppercase text-muted-foreground">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{log.description || `${log.entityType} action logged`}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono whitespace-nowrap ml-4">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">{t("overview.activityEmpty")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

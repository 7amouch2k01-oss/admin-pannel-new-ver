import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  ComposedChart,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateFinancialReportPDF } from "@/lib/reports";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { AdminWithdrawal } from "@/lib/api/types";
import {
  DollarSign, TrendingUp, TrendingDown, Undo2, BadgePercent, Sparkles,
  Users, ShoppingBag, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2,
  XCircle, AlertCircle, BarChart3, FlaskConical, ArrowUpRight, Activity,
} from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => v.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (part: number, total: number) =>
  total === 0 ? "—" : `${((part / total) * 100).toFixed(1)}%`;

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "11px",
  },
  labelStyle: { color: "var(--popover-foreground)", fontWeight: "bold" },
};

const STATUS_COLORS: Record<AdminWithdrawal["status"], string> = {
  pending: "#f59e0b",
  approved: "#3b82f6",
  completed: "#10b981",
  rejected: "#f43f5e",
};

const STATUS_ICONS: Record<AdminWithdrawal["status"], React.ReactNode> = {
  pending:   <Clock size={12} className="text-amber-500" />,
  approved:  <CheckCircle2 size={12} className="text-blue-500" />,
  completed: <CheckCircle2 size={12} className="text-emerald-500" />,
  rejected:  <XCircle size={12} className="text-rose-500" />,
};

const MONTH_MAP_FR: Record<string, string> = {
  Nov: "Nov", Dec: "Déc", Jan: "Janv", Feb: "Févr", Mar: "Mars", Apr: "Avr",
  May: "Mai", Jun: "Juin", Jul: "Juil", Aug: "Août", Sep: "Sept", Oct: "Oct",
};

// ─── crypto custom tooltip ───────────────────────────────────────────────────

function CryptoChartTooltip({ active, payload, label, unit = "TND" }: any) {
  const { language } = useLanguage();
  if (!active || !payload || !payload.length) return null;
  const monthDisplay = language === "fr" && MONTH_MAP_FR[label] ? MONTH_MAP_FR[label] : label;
  return (
    <div className="rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-2 min-w-[190px] pointer-events-none">
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 font-mono text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{monthDisplay} 2026</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {language === "fr" ? "Registre Direct" : "Live Ledger"}
        </span>
      </div>
      <div className="space-y-1">
        {payload.map((item: any) => {
          if (!item.value && item.value !== 0) return null;
          const isCurrency = unit === "TND" && (item.dataKey === "revenue" || item.dataKey === "netRevenue" || item.dataKey === "refunds");
          return (
            <div key={item.dataKey || item.name} className="flex items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                <span className="truncate max-w-[110px]">{item.name}</span>
              </div>
              <span className="font-bold text-foreground">
                {isCurrency ? `${fmt(Number(item.value))} TND` : Number(item.value).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── demo / preview data ─────────────────────────────────────────────────────
// Realistic financial market distribution with organic spikes, pullbacks, and S-curve adoption

const DEMO_FINANCIAL = {
  grossRevenue:         213_200.00,
  totalRefunds:           6_810.00,
  refundsCount:              52,
  pendingRefunds:          980.00,
  pendingRefundsCount:        8,
  commissionsPaid:        25_480.00,
  commissionsPending:      3_820.00,
  netGain:              180_910.00,
};

const DEMO_MONTHLY = [
  { month: "Nov", revenue: 9_850,  refunds: 320,  netRevenue: 9_530,  orders: 76,  users: 820,   newUsers: 65 },
  { month: "Dec", revenue: 15_400, refunds: 510,  netRevenue: 14_890, orders: 118, users: 995,   newUsers: 175 },
  { month: "Jan", revenue: 11_200, refunds: 290,  netRevenue: 10_910, orders: 86,  users: 1_085, newUsers: 90 },
  { month: "Feb", revenue: 14_150, refunds: 430,  netRevenue: 13_720, orders: 108, users: 1_195, newUsers: 110 },
  { month: "Mar", revenue: 17_200, refunds: 580,  netRevenue: 16_620, orders: 132, users: 1_360, newUsers: 165 },
  { month: "Apr", revenue: 19_850, refunds: 640,  netRevenue: 19_210, orders: 154, users: 1_570, newUsers: 210 },
  { month: "May", revenue: 16_100, refunds: 410,  netRevenue: 15_690, orders: 122, users: 1_690, newUsers: 120 },
  { month: "Jun", revenue: 20_400, refunds: 720,  netRevenue: 19_680, orders: 158, users: 1_880, newUsers: 190 },
  { month: "Jul", revenue: 23_200, refunds: 810,  netRevenue: 22_390, orders: 179, users: 2_130, newUsers: 250 },
  { month: "Aug", revenue: 21_350, refunds: 690,  netRevenue: 20_660, orders: 164, users: 2_290, newUsers: 160 },
  { month: "Sep", revenue: 18_900, refunds: 490,  netRevenue: 18_410, orders: 146, users: 2_475, newUsers: 185 },
  { month: "Oct", revenue: 25_600, refunds: 920,  netRevenue: 24_680, orders: 198, users: 2_780, newUsers: 305 },
];

const DEMO_METRICS = { totalUsers: 2_780, totalOrders: 1_641, totalPosts: 412, totalBrands: 54, totalRevenue: 213_200.00 };

const DEMO_WITHDRAWALS: AdminWithdrawal[] = [
  { id: "d1",  userId: "u1",  brandId: null, type: "user",  requesterName: "Sarra Ben Ali",    requesterEmail: "sarra@styly.tn",     amount: 420.00,   paymentMethod: "D17",           status: "completed", paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-15T10:00:00Z" },
  { id: "d2",  userId: "u2",  brandId: null, type: "user",  requesterName: "Yassine Mrad",     requesterEmail: "yassine@styly.tn",   amount: 310.50,   paymentMethod: "Bank Transfer",  status: "pending",   paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-14T09:30:00Z" },
  { id: "d3",  userId: "u3",  brandId: "b1", type: "brand", requesterName: "Lilas Boutique",   requesterEmail: "lilas@brand.tn",     amount: 1_850.00, paymentMethod: "Bank Transfer",  status: "completed", paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-13T14:20:00Z" },
  { id: "d4",  userId: "u4",  brandId: null, type: "user",  requesterName: "Amira Khelifi",    requesterEmail: "amira@styly.tn",     amount: 195.75,   paymentMethod: "D17",           status: "approved",  paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-12T11:00:00Z" },
  { id: "d5",  userId: "u5",  brandId: "b2", type: "brand", requesterName: "Zara TN Partner",  requesterEmail: "partner@zaratn.com", amount: 3_200.00, paymentMethod: "Bank Transfer",  status: "pending",   paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-11T08:45:00Z" },
  { id: "d6",  userId: "u6",  brandId: null, type: "user",  requesterName: "Omar Dridi",       requesterEmail: "omar@styly.tn",      amount: 540.00,   paymentMethod: "D17",           status: "rejected",  paymentDetails: {}, adminNotes: null, rejectionReason: "Unverified account", createdAt: "2026-10-10T16:00:00Z" },
  { id: "d7",  userId: "u7",  brandId: "b3", type: "brand", requesterName: "Moda Casa",        requesterEmail: "finance@modacasa.tn",amount: 920.00,   paymentMethod: "Bank Transfer",  status: "completed", paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-09T13:10:00Z" },
  { id: "d8",  userId: "u8",  brandId: null, type: "user",  requesterName: "Fatma Riahi",      requesterEmail: "fatma@styly.tn",     amount: 280.25,   paymentMethod: "D17",           status: "completed", paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-08T10:55:00Z" },
  { id: "d9",  userId: "u9",  brandId: "b4", type: "brand", requesterName: "ElStyle Co.",      requesterEmail: "payouts@elstyle.tn", amount: 2_100.00, paymentMethod: "Bank Transfer",  status: "approved",  paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-07T09:00:00Z" },
  { id: "d10", userId: "u10", brandId: null, type: "user",  requesterName: "Karim Hamdi",      requesterEmail: "karim@styly.tn",     amount: 615.00,   paymentMethod: "Bank Transfer",  status: "completed", paymentDetails: {}, adminNotes: null, rejectionReason: null,              createdAt: "2026-10-06T15:30:00Z" },
];

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

function KpiCard({ label, value, sub, icon, color = "text-foreground", trend }: KpiCardProps) {
  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </CardTitle>
          <span className="opacity-80">{icon}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            {trend === "up" && <TrendingUp size={10} className="text-emerald-500" />}
            {trend === "down" && <TrendingDown size={10} className="text-rose-500" />}
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── withdrawal table ────────────────────────────────────────────────────────

function WithdrawalTable({ rows }: { rows: AdminWithdrawal[] }) {
  const { t, language } = useLanguage();
  if (rows.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
        {t("analytics.comm.noRequests")}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("analytics.comm.thRequester")}</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("analytics.comm.thAmount")}</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("analytics.comm.thMethod")}</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("analytics.comm.thStatus")}</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t("analytics.comm.thDate")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((w) => (
            <tr key={w.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <td className="py-2 px-3">
                <div className="font-medium text-foreground truncate max-w-[140px]">{w.requesterName}</div>
                <div className="text-muted-foreground truncate max-w-[140px]">{w.requesterEmail}</div>
              </td>
              <td className="py-2 px-3 font-semibold text-amber-400">{fmt(w.amount)} TND</td>
              <td className="py-2 px-3 text-muted-foreground capitalize">{w.paymentMethod}</td>
              <td className="py-2 px-3">
                <Badge
                  variant="outline"
                  className="gap-1 text-[10px] capitalize"
                  style={{ borderColor: STATUS_COLORS[w.status], color: STATUS_COLORS[w.status] }}
                >
                  {STATUS_ICONS[w.status]}
                  {t(`common.${w.status}`, w.status)}
                </Badge>
              </td>
              <td className="py-2 px-3 text-muted-foreground">
                {new Date(w.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

type CommissionView = "user" | "brand";

export default function Analytics() {
  const { t, language } = useLanguage();
  const [commissionView, setCommissionView] = useState<CommissionView>("user");
  const [demoMode, setDemoMode] = useState(false);
  const [revenueChartMode, setRevenueChartMode] = useState<"all" | "gross" | "net">("all");
  const [userChartMode, setUserChartMode] = useState<"both" | "cumulative" | "inflow">("both");

  const { data: fullAnalytics = [], isLoading: fullLoading } = trpc.analytics.full.useQuery();
  const { data: financial, isLoading: financeLoading } = trpc.analytics.financialSummary.useQuery();
  const { data: withdrawals = [], isLoading: wLoading } = trpc.withdrawals.adminList.useQuery();
  const { data: dashMetrics, isLoading: metricsLoading } = trpc.dashboard.metrics.useQuery();

  const isDataLoading = fullLoading || financeLoading || wLoading || metricsLoading;
  const isLoading = demoMode ? false : isDataLoading;
  const isWithdrawalsLoading = demoMode ? false : wLoading;

  // ── demo mode: swap every live value for the fake dataset when ON ──────────
  const activeFinancial   = demoMode ? DEMO_FINANCIAL   : financial;
  const activeMonthly     = demoMode ? DEMO_MONTHLY     : fullAnalytics;
  const activeWithdrawals = demoMode ? DEMO_WITHDRAWALS : withdrawals;
  const activeDashMetrics = demoMode ? DEMO_METRICS     : dashMetrics;

  // ── dynamic ticker metrics for the crypto charts ──────────────────────────
  const latestPoint = activeMonthly[activeMonthly.length - 1] ?? {
    revenue: 0, netRevenue: 0, refunds: 0, orders: 0, users: 0, newUsers: 0, month: "—",
  };
  const prevPoint = activeMonthly.length >= 2 ? activeMonthly[activeMonthly.length - 2] : null;

  const revGrowthPct = prevPoint && prevPoint.revenue > 0
    ? ((latestPoint.revenue - prevPoint.revenue) / prevPoint.revenue) * 100
    : 0;
  const athRevenue = useMemo(
    () => Math.max(...activeMonthly.map((m) => m.revenue), 0),
    [activeMonthly]
  );
  const atlRevenue = useMemo(
    () => Math.min(...activeMonthly.map((m) => m.revenue).filter((v) => v > 0), 0),
    [activeMonthly]
  );

  const usersGrowthPct = prevPoint && prevPoint.users > 0
    ? ((latestPoint.users - prevPoint.users) / prevPoint.users) * 100
    : 0;

  // ── commission split from withdrawals ─────────────────────────────────────
  const commStats = useMemo(() => {
    const userW = activeWithdrawals.filter((w) => w.type === "user");
    const brandW = activeWithdrawals.filter((w) => w.type === "brand");

    const sum = (arr: AdminWithdrawal[], status?: AdminWithdrawal["status"][]) =>
      arr
        .filter((w) => !status || status.includes(w.status))
        .reduce((acc, w) => acc + w.amount, 0);

    const count = (arr: AdminWithdrawal[], status?: AdminWithdrawal["status"][]) =>
      arr.filter((w) => !status || status.includes(w.status)).length;

    return {
      // user / creator commissions
      userPaid:    sum(userW, ["completed"]),
      userPending: sum(userW, ["pending", "approved"]),
      userCount:   count(userW),
      userPaidCount:    count(userW, ["completed"]),
      userPendingCount: count(userW, ["pending", "approved"]),
      userRejected:     count(userW, ["rejected"]),
      userRows: [...userW].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      // brand payouts
      brandPaid:    sum(brandW, ["completed"]),
      brandPending: sum(brandW, ["pending", "approved"]),
      brandCount:   count(brandW),
      brandPaidCount:    count(brandW, ["completed"]),
      brandPendingCount: count(brandW, ["pending", "approved"]),
      brandRejected:     count(brandW, ["rejected"]),
      brandRows: [...brandW].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      // totals for reference
      totalDisbursed: sum(activeWithdrawals, ["completed"]),
      totalPending:   sum(activeWithdrawals, ["pending", "approved"]),
    };
  }, [activeWithdrawals]);

  // ── true platform profit ───────────────────────────────────────────────────
  const gross      = activeFinancial?.grossRevenue ?? 0;
  const refunds    = activeFinancial?.totalRefunds ?? 0;
  const platformProfit = gross - refunds - commStats.userPaid - commStats.brandPaid;

  // ── order metrics from monthly data ───────────────────────────────────────
  const totalOrders = useMemo(() => activeMonthly.reduce((a, r) => a + (r.orders ?? 0), 0), [activeMonthly]);
  const avgOrderValue = totalOrders > 0 ? gross / totalOrders : 0;

  // ── withdrawal status breakdown for pie chart ─────────────────────────────
  const statusPie = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of activeWithdrawals) map[w.status] = (map[w.status] ?? 0) + 1;
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activeWithdrawals]);

  // ── monthly commission bar chart (approximate from financial data) ─────────
  // We don't have month-by-month commission data from the server, so we build a
  // proportional estimate — labelled clearly in the chart description.
  const hasActivity = activeMonthly.some((r) => r.orders > 0 || r.revenue > 0);

  const activeView = commissionView === "user" ? {
    label:        t("analytics.comm.labelUser", "Creator (User) Commissions"),
    paid:         commStats.userPaid,
    pending:      commStats.userPending,
    totalCount:   commStats.userCount,
    paidCount:    commStats.userPaidCount,
    pendingCount: commStats.userPendingCount,
    rejectedCount:commStats.userRejected,
    rows:         commStats.userRows,
    accentColor:  "#f59e0b",
  } : {
    label:        t("analytics.comm.labelBrand", "Brand Partner Payouts"),
    paid:         commStats.brandPaid,
    pending:      commStats.brandPending,
    totalCount:   commStats.brandCount,
    paidCount:    commStats.brandPaidCount,
    pendingCount: commStats.brandPendingCount,
    rejectedCount:commStats.brandRejected,
    rows:         commStats.brandRows,
    accentColor:  "#a855f7",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">{t("analytics.title")}</h1>
            {demoMode && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 text-xs px-2 py-0.5 animate-pulse">
                {t("analytics.demoModeActive")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("analytics.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                generateFinancialReportPDF({
                  gross,
                  refunds,
                  creatorCommissions: commStats.userPaid,
                  brandPayouts: commStats.brandPaid,
                  netProfit: platformProfit,
                  totalOrders: activeDashMetrics?.totalOrders ?? totalOrders,
                  totalUsers: activeDashMetrics?.totalUsers ?? 0,
                  periodLabel: demoMode ? "Simulation Démo 2026" : "Clôture Réelle 2026",
                });
                toast.success(
                  language === "fr"
                    ? "Rapport financier PDF généré avec succès !"
                    : "Financial PDF statement downloaded!"
                );
              } catch (e: any) {
                toast.error("Erreur lors de la génération du rapport");
              }
            }}
            className="gap-2 rounded-xl border-border/60 hover:border-emerald-500/50 hover:text-emerald-400 shadow-xs"
          >
            <FileText size={15} className="text-emerald-400" />
            <span>{language === "fr" ? "Exporter PDF Officiel" : "Export PDF Statement"}</span>
          </Button>

          <Button
            type="button"
            variant={demoMode ? "default" : "outline"}
            size="sm"
            onClick={() => setDemoMode((prev) => !prev)}
            className={`gap-2 rounded-xl transition-all ${
              demoMode
                ? "bg-amber-500 hover:bg-amber-600 text-black font-semibold border-amber-400 shadow-lg shadow-amber-500/20"
                : "border-border/60 hover:border-amber-500/50 hover:text-amber-400"
            }`}
          >
            <FlaskConical size={15} />
            {demoMode ? t("analytics.exitDemo") : t("analytics.previewDemo")}
          </Button>
        </div>
      </div>

      {/* ── Row 1: Core Financial KPIs ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t("analytics.kpi.gross")}
          value={`${fmt(gross)} TND`}
          sub={t("analytics.kpi.grossSub")}
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          color="text-emerald-400"
          trend="up"
        />
        <KpiCard
          label={t("analytics.kpi.refunds")}
          value={`-${fmt(refunds)} TND`}
          sub={`${activeFinancial?.refundsCount ?? 0} ${t("analytics.kpi.refundsCount")} · ${activeFinancial?.pendingRefundsCount ?? 0} ${t("analytics.kpi.claimsOpen")}`}
          icon={<Undo2 className="h-4 w-4 text-rose-500" />}
          color="text-rose-500"
          trend="down"
        />
        <KpiCard
          label={t("analytics.kpi.commissions")}
          value={`-${fmt(commStats.totalDisbursed)} TND`}
          sub={`${fmt(commStats.totalPending)} TND ${t("analytics.kpi.commissionsPending")} · ${activeWithdrawals.filter(w => w.status === "completed").length} ${t("analytics.kpi.paidOut")}`}
          icon={<BadgePercent className="h-4 w-4 text-amber-500" />}
          color="text-amber-400"
          trend="down"
        />
        <KpiCard
          label={t("analytics.kpi.netGain")}
          value={`${platformProfit >= 0 ? "+" : ""}${fmt(platformProfit)} TND`}
          sub={t("analytics.kpi.netGainSub")}
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          color={platformProfit < 0 ? "text-rose-500" : "text-primary"}
          trend={platformProfit >= 0 ? "up" : "down"}
        />
      </div>

      {/* ── Row 2: Operational KPIs ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={14} className="text-blue-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.orders")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : (activeDashMetrics?.totalOrders ?? totalOrders).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.ordersSub")}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-violet-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.avgOrder")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : `${fmt(avgOrderValue)} TND`}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.avgOrderSub")}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-cyan-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.users")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : (activeDashMetrics?.totalUsers ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.usersSub")}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle size={14} className="text-emerald-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.payoutRate")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : pct(commStats.totalDisbursed, gross)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.payoutRateSub")}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle size={14} className="text-rose-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.refundRate")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : pct(refunds, gross)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.refundRateSub")}</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-amber-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">{t("analytics.kpi.pendingPayouts")}</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : `${fmt(commStats.totalPending)} TND`}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.kpi.pendingPayoutsSub")}</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 1: Crypto-Style Trading Curves ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crypto Chart 1: Monthly Sales & Market Flow */}
        <Card className="border border-border/60 bg-gradient-to-b from-card/80 via-card/50 to-card/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <CardTitle className="text-sm font-bold tracking-tight">{t("analytics.chart1.title")}</CardTitle>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
                    {t("analytics.chart1.badge")}
                  </span>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {t("analytics.chart1.desc")}
                </CardDescription>
              </div>

              {/* Curve filter tabs */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRevenueChartMode("all")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    revenueChartMode === "all"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Curves
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueChartMode("gross")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    revenueChartMode === "gross"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Gross
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueChartMode("net")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    revenueChartMode === "net"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Net Only
                </button>
              </div>
            </div>

            {/* Crypto Ticker Bar */}
            <div className="pt-2 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                  {isLoading ? "—" : `${fmt(latestPoint.revenue)} TND`}
                </span>
                <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                  revGrowthPct >= 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}>
                  {revGrowthPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {revGrowthPct >= 0 ? "+" : ""}{revGrowthPct.toFixed(1)}% (30d)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span>{t("analytics.chart1.ath", "ATH")}: <strong className="text-foreground">{fmt(athRevenue)}</strong></span>
                <span>·</span>
                <span>{t("analytics.chart1.atl", "ATL")}: <strong className="text-foreground">{fmt(atlRevenue)}</strong></span>
                <span>·</span>
                <span>{t("analytics.chart1.orders")}: <strong className="text-foreground">{latestPoint.orders}</strong></span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {!isLoading && !hasActivity ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                {language === "fr" ? "Aucune commande enregistrée pour l'instant." : "No orders recorded yet."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={activeMonthly}>
                  <defs>
                    <linearGradient id="cryptoGrossGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="65%" stopColor="#10b981" stopOpacity={0.06} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="cryptoNetPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="70%" stopColor="#a855f7" stopOpacity={0.05} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.07)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(m) => (language === "fr" && MONTH_MAP_FR[m] ? MONTH_MAP_FR[m] : m)} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CryptoChartTooltip unit="TND" />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />

                  {(revenueChartMode === "all" || revenueChartMode === "gross") && (
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#cryptoGrossGreen)"
                      dot={{ r: 2.5, fill: "#10b981", strokeWidth: 1.5, stroke: "#ffffff" }}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                      name={t("analytics.chart1.grossLegend")}
                    />
                  )}

                  {(revenueChartMode === "all" || revenueChartMode === "net") && (
                    <Area
                      type="monotone"
                      dataKey="netRevenue"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      fill="url(#cryptoNetPurple)"
                      dot={{ r: 2, fill: "#a855f7", strokeWidth: 1, stroke: "#ffffff" }}
                      activeDot={{ r: 5, fill: "#a855f7", stroke: "#ffffff", strokeWidth: 2 }}
                      name={t("analytics.chart1.netLegend")}
                    />
                  )}

                  {revenueChartMode === "all" && (
                    <Line
                      type="monotone"
                      dataKey="refunds"
                      stroke="#f43f5e"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 4"
                      name={t("analytics.chart1.refundsLegend")}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Crypto Chart 2: Audience & Creator Adoption Curve */}
        <Card className="border border-border/60 bg-gradient-to-b from-card/80 via-card/50 to-card/30 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  <CardTitle className="text-sm font-bold tracking-tight">{t("analytics.chart2.title")}</CardTitle>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
                    {t("analytics.chart2.badge")}
                  </span>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {t("analytics.chart2.desc")}
                </CardDescription>
              </div>

              {/* Curve filter tabs */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/40 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUserChartMode("both")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    userChartMode === "both"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Both (Curve+Vol)
                </button>
                <button
                  type="button"
                  onClick={() => setUserChartMode("cumulative")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    userChartMode === "cumulative"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Curve
                </button>
                <button
                  type="button"
                  onClick={() => setUserChartMode("inflow")}
                  className={`text-[11px] font-medium px-2 py-1 rounded-lg transition-all ${
                    userChartMode === "inflow"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Inflow Vol
                </button>
              </div>
            </div>

            {/* Crypto Ticker Bar */}
            <div className="pt-2 flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                  {isLoading ? "—" : latestPoint.users.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{t("analytics.chart2.accounts")}</span>
                <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-full ${
                  usersGrowthPct >= 0
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}>
                  <ArrowUpRight size={11} />
                  +{usersGrowthPct.toFixed(1)}% MoM
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                <span>Influx: <strong className="text-cyan-400">+{latestPoint.newUsers} {t("analytics.chart2.inflowSub")}</strong></span>
                <span>·</span>
                <span>{t("analytics.chart2.brands")}: <strong className="text-foreground">{activeDashMetrics?.totalBrands ?? 54}</strong></span>
                <span>·</span>
                <span>{t("analytics.chart2.stylers")}: <strong className="text-foreground">{activeDashMetrics?.totalPosts ?? 412}</strong></span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={activeMonthly}>
                <defs>
                  <linearGradient id="cryptoAdoptionGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cryptoBarVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.07)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(m) => (language === "fr" && MONTH_MAP_FR[m] ? MONTH_MAP_FR[m] : m)} />
                <YAxis
                  yAxisId="users"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  hide
                  domain={[0, (dataMax: number) => Math.max(dataMax * 3.2, 500)]}
                />
                <Tooltip content={<CryptoChartTooltip unit="users" />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />

                {(userChartMode === "both" || userChartMode === "inflow") && (
                  <Bar
                    yAxisId="volume"
                    dataKey="newUsers"
                    fill="url(#cryptoBarVolume)"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    name={t("analytics.chart2.inflowLegend")}
                  />
                )}

                {(userChartMode === "both" || userChartMode === "cumulative") && (
                  <Area
                    yAxisId="users"
                    type="monotone"
                    dataKey="users"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fill="url(#cryptoAdoptionGlow)"
                    dot={{ r: 2.5, fill: "#06b6d4", strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#06b6d4", stroke: "#ffffff", strokeWidth: 2 }}
                    name={t("analytics.chart2.totalLegend")}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Orders Bar & Withdrawal Status Pie ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("analytics.chart3.title")}</CardTitle>
            <CardDescription className="text-xs">{t("analytics.chart3.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading && !hasActivity ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {language === "fr" ? "Aucune commande enregistrée pour l'instant." : "No orders recorded yet."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activeMonthly} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="orders" fill="#3b82f6" name={t("analytics.chart3.legend")} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t("analytics.chart4.title")}</CardTitle>
            <CardDescription className="text-xs">
              {t("analytics.chart4.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isWithdrawalsLoading || statusPie.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {isWithdrawalsLoading ? t("common.loading") : (language === "fr" ? "Aucune demande de virement pour l'instant." : "No withdrawal requests yet.")}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPie.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name as AdminWithdrawal["status"]] ?? "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 text-xs">
                  {statusPie.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: STATUS_COLORS[entry.name as AdminWithdrawal["status"]] ?? "#6b7280" }}
                      />
                      <span className="capitalize text-foreground font-medium">{t(`common.${entry.name}`, entry.name)}</span>
                      <span className="text-muted-foreground ml-auto pl-3 font-semibold">{entry.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border/40 text-muted-foreground">
                    {t("analytics.chart4.total")}: <span className="text-foreground font-bold">{activeWithdrawals.length}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Commission Deep-Dive Section ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header + dropdown selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t("analytics.comm.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("analytics.comm.desc")}
            </p>
          </div>
          <Select
            value={commissionView}
            onValueChange={(v) => setCommissionView(v as CommissionView)}
          >
            <SelectTrigger className="w-[220px] rounded-xl border-border/60 bg-card/60 backdrop-blur text-sm font-medium">
              <BadgePercent size={14} className="mr-1.5 shrink-0 opacity-60" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="user">{t("analytics.comm.selectUser")}</SelectItem>
              <SelectItem value="brand">{t("analytics.comm.selectBrand")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commission KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                {t("analytics.comm.totalDisbursed")}
              </div>
              <div className="text-xl font-black" style={{ color: activeView.accentColor }}>
                {isWithdrawalsLoading ? "—" : `${fmt(activeView.paid)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.paidCount} {t("analytics.comm.completedPayouts")}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                {t("analytics.comm.pendingApproved")}
              </div>
              <div className="text-xl font-black text-amber-400">
                {isWithdrawalsLoading ? "—" : `${fmt(activeView.pending)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.pendingCount} {t("analytics.comm.awaitingRequests")}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                {t("analytics.comm.totalRequests")}
              </div>
              <div className="text-xl font-black text-foreground">
                {isWithdrawalsLoading ? "—" : activeView.totalCount}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.rejectedCount} {t("analytics.comm.rejected")}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                {t("analytics.comm.avgPayout")}
              </div>
              <div className="text-xl font-black text-foreground">
                {isWithdrawalsLoading || activeView.paidCount === 0
                  ? "—"
                  : `${fmt(activeView.paid / activeView.paidCount)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t("analytics.comm.perCompleted")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent withdrawals table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  {language === "fr" ? "Journal Récent" : "Recent"} {activeView.label} — {t("analytics.comm.recentLog")}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {t("analytics.comm.recentDesc")}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: activeView.accentColor, color: activeView.accentColor }}>
                {activeView.totalCount} {t("analytics.chart4.total").toLowerCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isWithdrawalsLoading ? (
              <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">{t("common.loading")}</div>
            ) : (
              <WithdrawalTable rows={activeView.rows} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Platform Profit Waterfall Summary ────────────────────────────── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base font-bold">{t("analytics.waterfall.title")}</CardTitle>
          <CardDescription className="text-xs">
            {t("analytics.waterfall.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { label: t("analytics.waterfall.gross"),             value: gross,                        color: "text-emerald-400", sign: "+" },
              { label: t("analytics.waterfall.refunds"),           value: refunds,                      color: "text-rose-400",    sign: "−" },
              { label: t("analytics.waterfall.userComm"),          value: commStats.userPaid,           color: "text-amber-400",   sign: "−" },
              { label: t("analytics.waterfall.brandComm"),         value: commStats.brandPaid,          color: "text-purple-400",  sign: "−" },
            ].map(({ label, value, color, sign }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-semibold ${color}`}>
                  {sign} {fmt(value)} TND
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 mt-1">
              <span className="font-bold text-base">{t("analytics.waterfall.netProfit")}</span>
              <span className={`text-xl font-black ${platformProfit < 0 ? "text-rose-500" : "text-primary"}`}>
                {platformProfit >= 0 ? "+" : "−"} {fmt(Math.abs(platformProfit))} TND
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

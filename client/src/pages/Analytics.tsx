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
} from "recharts";
import { trpc } from "@/lib/trpc";
import type { AdminWithdrawal } from "@/lib/api/types";
import {
  DollarSign, TrendingUp, TrendingDown, Undo2, BadgePercent, Sparkles,
  Users, ShoppingBag, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2,
  XCircle, AlertCircle, BarChart3, FlaskConical,
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

// ─── demo / preview data ─────────────────────────────────────────────────────
// Injected only when the "Demo Mode" toggle is ON. Toggling it off reverts
// every number and chart back to whatever the live API returned.

const DEMO_FINANCIAL = {
  grossRevenue:         184_320.50,
  totalRefunds:           5_210.75,
  refundsCount:              47,
  pendingRefunds:          890.00,
  pendingRefundsCount:        9,
  commissionsPaid:        22_180.30,
  commissionsPending:      3_410.00,
  netGain:              156_929.45,
};

const DEMO_MONTHLY = [
  { month: "Nov", revenue: 9_800,  refunds: 320,  netRevenue: 9_480,  orders: 74,  users: 810,  newUsers: 62 },
  { month: "Dec", revenue: 14_200, refunds: 510,  netRevenue: 13_690, orders: 109, users: 884,  newUsers: 74 },
  { month: "Jan", revenue: 11_500, refunds: 290,  netRevenue: 11_210, orders: 88,  users: 960,  newUsers: 76 },
  { month: "Feb", revenue: 13_700, refunds: 430,  netRevenue: 13_270, orders: 105, users: 1_038, newUsers: 78 },
  { month: "Mar", revenue: 16_400, refunds: 580,  netRevenue: 15_820, orders: 126, users: 1_120, newUsers: 82 },
  { month: "Apr", revenue: 18_900, refunds: 640,  netRevenue: 18_260, orders: 145, users: 1_213, newUsers: 93 },
  { month: "May", revenue: 15_300, refunds: 410,  netRevenue: 14_890, orders: 117, users: 1_298, newUsers: 85 },
  { month: "Jun", revenue: 19_800, refunds: 720,  netRevenue: 19_080, orders: 152, users: 1_392, newUsers: 94 },
  { month: "Jul", revenue: 22_100, refunds: 810,  netRevenue: 21_290, orders: 170, users: 1_489, newUsers: 97 },
  { month: "Aug", revenue: 20_400, refunds: 690,  netRevenue: 19_710, orders: 157, users: 1_578, newUsers: 89 },
  { month: "Sep", revenue: 17_820, refunds: 490,  netRevenue: 17_330, orders: 137, users: 1_660, newUsers: 82 },
  { month: "Oct", revenue: 24_400, refunds: 920,  netRevenue: 23_480, orders: 188, users: 1_766, newUsers: 106 },
];

const DEMO_METRICS = { totalUsers: 1_766, totalOrders: 1_568, totalPosts: 312, totalBrands: 48, totalRevenue: 184_320.50 };

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
  if (rows.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
        No withdrawal requests found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Requester</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Amount</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Method</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
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
                  {w.status}
                </Badge>
              </td>
              <td className="py-2 px-3 text-muted-foreground">
                {new Date(w.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
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
  const [commissionView, setCommissionView] = useState<CommissionView>("user");
  const [demoMode, setDemoMode] = useState(false);

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
    label:        "Creator (User) Commissions",
    paid:         commStats.userPaid,
    pending:      commStats.userPending,
    totalCount:   commStats.userCount,
    paidCount:    commStats.userPaidCount,
    pendingCount: commStats.userPendingCount,
    rejectedCount:commStats.userRejected,
    rows:         commStats.userRows,
    accentColor:  "#f59e0b",
  } : {
    label:        "Brand Partner Payouts",
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
            <h1 className="text-3xl font-black tracking-tight">Platform Financials &amp; Growth</h1>
            {demoMode && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 text-xs px-2 py-0.5 animate-pulse">
                Demo Preview Mode
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Live financial ledger — gross revenue, refunds, creator commissions, brand payouts, and true platform profit.
          </p>
        </div>
        <div>
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
            {demoMode ? "Exit Demo Data" : "Preview Demo Data"}
          </Button>
        </div>
      </div>

      {/* ── Row 1: Core Financial KPIs ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Gross Order Volume"
          value={`${fmt(gross)} TND`}
          sub="Total incoming transaction value"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          color="text-emerald-400"
          trend="up"
        />
        <KpiCard
          label="Total Money Refunded"
          value={`-${fmt(refunds)} TND`}
          sub={`${activeFinancial?.refundsCount ?? 0} refunds · ${activeFinancial?.pendingRefundsCount ?? 0} open claim(s)`}
          icon={<Undo2 className="h-4 w-4 text-rose-500" />}
          color="text-rose-500"
          trend="down"
        />
        <KpiCard
          label="All Commissions Disbursed"
          value={`-${fmt(commStats.totalDisbursed)} TND`}
          sub={`${fmt(commStats.totalPending)} TND pending · ${activeWithdrawals.filter(w => w.status === "completed").length} paid out`}
          icon={<BadgePercent className="h-4 w-4 text-amber-500" />}
          color="text-amber-400"
          trend="down"
        />
        <KpiCard
          label="Retained Net Gain"
          value={`${platformProfit >= 0 ? "+" : ""}${fmt(platformProfit)} TND`}
          sub="Gross − refunds − creator payouts − brand payouts"
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
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Orders</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : (activeDashMetrics?.totalOrders ?? totalOrders).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">total placed</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={14} className="text-violet-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Avg Order</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : `${fmt(avgOrderValue)} TND`}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">per transaction</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-cyan-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Users</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : (activeDashMetrics?.totalUsers ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">registered accounts</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle size={14} className="text-emerald-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Payout Rate</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : pct(commStats.totalDisbursed, gross)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">of gross to payees</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle size={14} className="text-rose-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Refund Rate</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : pct(refunds, gross)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">of gross refunded</div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-amber-400" />
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Pending Payouts</span>
            </div>
            <div className="text-xl font-black">{isLoading ? "—" : `${fmt(commStats.totalPending)} TND`}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">awaiting approval</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 1: Revenue & User Growth ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Monthly Sales &amp; Net Revenue</CardTitle>
            <CardDescription className="text-xs">
              Gross checkouts vs refunds vs net retained volume (TND) — 12-month rolling
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading && !hasActivity ? (
              <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                No orders recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={activeMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="revenue"    stroke="#10b981" strokeWidth={2.5} dot={false} name="Gross Sales (TND)" />
                  <Line type="monotone" dataKey="refunds"    stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Refunds (TND)"      strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="netRevenue" stroke="#8b5cf6" strokeWidth={2}   dot={false} name="Net Revenue (TND)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Audience &amp; Creator Acquisition</CardTitle>
            <CardDescription className="text-xs">
              Cumulative registered accounts &amp; monthly new registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activeMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="users"    stroke="#8b5cf6" fill="rgba(139,92,246,0.15)"  strokeWidth={2}   name="Total Users" />
                <Area type="monotone" dataKey="newUsers" stroke="#06b6d4" fill="rgba(6,182,212,0.1)"   strokeWidth={1.5} name="New This Month" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2: Orders Bar & Withdrawal Status Pie ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Monthly Order Volume</CardTitle>
            <CardDescription className="text-xs">Number of orders placed per month</CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading && !hasActivity ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                No orders recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={activeMonthly} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold">Withdrawal Request Status</CardTitle>
            <CardDescription className="text-xs">
              All-time breakdown of payout requests by resolution status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isWithdrawalsLoading || statusPie.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
                {isWithdrawalsLoading ? "Loading…" : "No withdrawal requests yet."}
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
                      <span className="capitalize text-foreground font-medium">{entry.name}</span>
                      <span className="text-muted-foreground ml-auto pl-3 font-semibold">{entry.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border/40 text-muted-foreground">
                    Total: <span className="text-foreground font-bold">{activeWithdrawals.length}</span>
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
            <h2 className="text-xl font-bold">Commission Deep-Dive</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detailed breakdown of outgoing payouts by recipient type
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
              <SelectItem value="user">👤 Creator (User) Commissions</SelectItem>
              <SelectItem value="brand">🏷️ Brand Partner Payouts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Commission KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                Total Disbursed
              </div>
              <div className="text-xl font-black" style={{ color: activeView.accentColor }}>
                {isWithdrawalsLoading ? "—" : `${fmt(activeView.paid)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.paidCount} completed payout{activeView.paidCount !== 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                Pending / Approved
              </div>
              <div className="text-xl font-black text-amber-400">
                {isWithdrawalsLoading ? "—" : `${fmt(activeView.pending)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.pendingCount} request{activeView.pendingCount !== 1 ? "s" : ""} awaiting
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                Total Requests
              </div>
              <div className="text-xl font-black text-foreground">
                {isWithdrawalsLoading ? "—" : activeView.totalCount}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {activeView.rejectedCount} rejected
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-2xl">
            <CardContent className="pt-4 pb-3">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">
                Avg Payout
              </div>
              <div className="text-xl font-black text-foreground">
                {isWithdrawalsLoading || activeView.paidCount === 0
                  ? "—"
                  : `${fmt(activeView.paid / activeView.paidCount)} TND`}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">per completed request</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent withdrawals table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  Recent {activeView.label} — Requests Log
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Latest 10 payout requests for this category
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px]" style={{ borderColor: activeView.accentColor, color: activeView.accentColor }}>
                {activeView.totalCount} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isWithdrawalsLoading ? (
              <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">Loading…</div>
            ) : (
              <WithdrawalTable rows={activeView.rows} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Platform Profit Waterfall Summary ────────────────────────────── */}
      <Card className="border-border/50 bg-card/50 backdrop-blur rounded-3xl">
        <CardHeader>
          <CardTitle className="text-base font-bold">Revenue Waterfall</CardTitle>
          <CardDescription className="text-xs">
            Step-by-step breakdown from gross revenue to true platform profit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { label: "Gross Order Volume",             value: gross,                        color: "text-emerald-400", sign: "+" },
              { label: "Customer Refunds",               value: refunds,                      color: "text-rose-400",    sign: "−" },
              { label: "Creator Commissions Paid",       value: commStats.userPaid,           color: "text-amber-400",   sign: "−" },
              { label: "Brand Partner Payouts Paid",     value: commStats.brandPaid,          color: "text-purple-400",  sign: "−" },
            ].map(({ label, value, color, sign }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-semibold ${color}`}>
                  {sign} {fmt(value)} TND
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 mt-1">
              <span className="font-bold text-base">Net Platform Profit</span>
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

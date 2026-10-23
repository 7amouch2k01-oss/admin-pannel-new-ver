import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuditTrailView } from "@/components/AuditTrailView";
import {
  LogOut, Save, ShieldCheck, Mail, Bell, Key, Database, RefreshCw,
  CheckCircle2, Globe, Crown, Lock, Sliders, DollarSign, Cpu, Users,
  AlertTriangle, Sparkles, Check, X, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

// ─── LocalStorage persistent keys ─────────────────────────────────────────────
const STORAGE_ADV_SETTINGS_KEY = "styly_admin_advanced_settings";
const STORAGE_GRANTED_ADMINS_KEY = "styly_granted_advanced_admins";

interface AdvancedSettingsState {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  autoApproveBrands: boolean;
  autoFlagPosts: boolean;
  cancellationWindowHours: number;
  creatorCommissionRate: number;
  brandFeeRate: number;
  minWithdrawalTnd: number;
  payoutMode: "manual" | "auto";
  enforce2FA: boolean;
  maxLoginAttempts: number;
  auditWebhookUrl: string;
  enableVirtualTryOn: boolean;
  enableAutoTagging: boolean;
}

const DEFAULT_ADV_SETTINGS: AdvancedSettingsState = {
  maintenanceMode: false,
  allowRegistrations: true,
  autoApproveBrands: false,
  autoFlagPosts: true,
  cancellationWindowHours: 24,
  creatorCommissionRate: 15.0,
  brandFeeRate: 8.5,
  minWithdrawalTnd: 50.0,
  payoutMode: "manual",
  enforce2FA: true,
  maxLoginAttempts: 5,
  auditWebhookUrl: "https://hooks.slack.com/services/styly/admin/audit-logs",
  enableVirtualTryOn: true,
  enableAutoTagging: true,
};

// Staff team for delegation demo
const DEMO_STAFF_MEMBERS = [
  { id: "staff-1", name: "Amine", email: "amine@styly.tn", role: "admin", isOwner: true, isCoOwner: false },
  { id: "staff-2", name: "Soumaya", email: "soumaya@styly.tn", role: "admin", isOwner: false, isCoOwner: true },
  { id: "staff-3", name: "Yassine Mrad", email: "yassine@styly.tn", role: "admin", isOwner: false, isCoOwner: false },
  { id: "staff-4", name: "Sarra Ben Ali", email: "sarra@styly.tn", role: "admin", isOwner: false, isCoOwner: false },
  { id: "staff-5", name: "Karim Hamdi", email: "karim@styly.tn", role: "admin", isOwner: false, isCoOwner: false },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<"simple" | "advanced">("simple");
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || "Amine");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Simple personal notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Advanced settings state
  const [advSettings, setAdvSettings] = useState<AdvancedSettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADV_SETTINGS_KEY);
      return saved ? { ...DEFAULT_ADV_SETTINGS, ...JSON.parse(saved) } : DEFAULT_ADV_SETTINGS;
    } catch {
      return DEFAULT_ADV_SETTINGS;
    }
  });

  // Granted admin IDs for advanced settings
  const [grantedAdminIds, setGrantedAdminIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GRANTED_ADMINS_KEY);
      return saved ? JSON.parse(saved) : ["staff-1", "staff-2"];
    } catch {
      return ["staff-1", "staff-2"];
    }
  });

  // Security role verification
  const isOwner = user?.isOwner === true || user?.name === "Amine" || (user as any)?.email === "amine@styly.tn";
  const isCoOwner = user?.isCoOwner === true;
  const hasAdvSettingsAccess = isOwner || isCoOwner || user?.permissions?.includes("advanced_settings") || grantedAdminIds.includes(user?.id || "");

  // Update name if user loads
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleLanguageChange = (newLang: "en" | "fr") => {
    setLanguage(newLang);
    toast.success(
      newLang === "fr"
        ? "Langue modifiée en Français 🇫🇷"
        : "Language changed to English 🇬🇧"
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      toast.success(t("settings.toast.saved", "Settings saved successfully ✅"));
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdvancedSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_ADV_SETTINGS_KEY, JSON.stringify(advSettings));
      await new Promise((r) => setTimeout(r, 500));
      toast.success(t("settings.toast.saved", "Platform controls updated successfully ✅"));
    } catch {
      toast.error("Failed to save advanced settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAdminAccess = (staffId: string, staffName: string) => {
    if (staffId === "staff-1") return; // Owner cannot be modified
    let next: string[];
    const isGranted = grantedAdminIds.includes(staffId);
    if (isGranted) {
      next = grantedAdminIds.filter((id) => id !== staffId);
      toast.info(`${t("settings.toast.accessRevoked", "Access revoked from")} ${staffName}`);
    } else {
      next = [...grantedAdminIds, staffId];
      toast.success(`${t("settings.toast.accessGranted", "Access granted to")} ${staffName}`);
    }
    setGrantedAdminIds(next);
    localStorage.setItem(STORAGE_GRANTED_ADMINS_KEY, JSON.stringify(next));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error(t("settings.password.minChars", "At least 6 characters required"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.password.matchError", "Passwords do not match"));
      return;
    }
    toast.success(t("settings.password.success", "Password updated successfully!"));
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">{t("settings.title", "Platform Settings & Security")}</h1>
            {isOwner && (
              <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-xs px-2.5 py-0.5 font-bold gap-1">
                <Crown size={12} className="fill-amber-500" />
                Amine (Owner)
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.subtitle", "Manage administrator credentials, interface language, system automation, and advanced platform parameters.")}
          </p>
        </div>

        {/* Global Save Button */}
        <Button
          onClick={activeTab === "advanced" ? handleSaveAdvancedSettings : handleSaveProfile}
          disabled={isSaving}
          className="rounded-xl text-xs font-bold gap-2 self-start sm:self-auto bg-primary shadow-lg shadow-primary/20"
        >
          <Save size={14} />
          {isSaving ? t("common.saving", "Saving...") : t("common.save", "Save Changes")}
        </Button>
      </div>

      {/* ── Tabs: General vs Advanced ───────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="bg-card/70 border border-border/50 p-1 rounded-2xl h-11">
          <TabsTrigger value="simple" className="rounded-xl text-xs font-bold px-4 gap-2">
            <Sliders size={14} />
            {t("settings.tab.simple", "General Settings")}
          </TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-xl text-xs font-bold px-4 gap-2">
            {hasAdvSettingsAccess ? (
              <Sparkles size={14} className="text-amber-500" />
            ) : (
              <Lock size={13} className="text-muted-foreground" />
            )}
            {hasAdvSettingsAccess
              ? t("settings.tab.advanced", "Advanced Platform Settings")
              : t("settings.tab.advancedRestricted", "Advanced Settings (Restricted)")}
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1: GENERAL SETTINGS (AVAILABLE TO ALL ADMINS)
           ════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="simple" className="space-y-6 m-0">
          {/* Language Changer Banner */}
          <Card className="border border-primary/30 bg-gradient-to-r from-primary/10 via-card/50 to-card/30 backdrop-blur rounded-3xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">{t("settings.language.title", "Console Language")}</h2>
                </div>
                <p className="text-xs text-muted-foreground max-w-xl">
                  {t("settings.language.desc", "Choose your preferred administrative language. The entire dashboard will adapt instantly.")}
                </p>
              </div>

              {/* Language Selection Buttons */}
              <div className="flex items-center gap-2 bg-background/80 p-1.5 rounded-2xl border border-border/60">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    language === "en"
                      ? "bg-primary text-primary-foreground shadow-md font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>English</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange("fr")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    language === "fr"
                      ? "bg-primary text-primary-foreground shadow-md font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-base">🇫🇷</span>
                  <span>Français</span>
                </button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Profile & Password */}
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Card */}
              <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">{t("settings.profile.title", "Admin Profile & Access")}</CardTitle>
                  </div>
                  <CardDescription>
                    {t("settings.profile.desc", "Your authenticated identity and administrative security role")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold">{t("settings.profile.name", "Admin Display Name")}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">{t("settings.profile.email", "Email Address")}</Label>
                      <Input
                        id="email"
                        value={user?.email || "amine@styly.tn"}
                        disabled
                        className="rounded-xl bg-muted/40 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                        <Crown size={14} className="fill-amber-500" />
                        {isOwner
                          ? t("settings.profile.ownerBadge", "PLATFORM OWNER")
                          : isCoOwner
                          ? t("settings.profile.coOwnerBadge", "CO-OWNER")
                          : t("settings.profile.adminBadge", "ADMIN STAFF")}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isOwner
                          ? t("settings.profile.ownerDesc", "Full root access over Users, Brands, Finances, Settings & Security")
                          : t("settings.profile.adminDesc", "Standard operational administrator privileges")}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-black font-black text-[10px] tracking-wider uppercase">
                      ROOT
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">{t("settings.password.title", "Change Password")}</CardTitle>
                  </div>
                  <CardDescription>{t("settings.password.desc", "Update your console account access password")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">{t("settings.password.current", "Current Password")}</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t("settings.password.new", "New Password")}</Label>
                        <Input
                          type="password"
                          placeholder="Min. 6 chars"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="rounded-xl font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">{t("settings.password.confirm", "Confirm New Password")}</Label>
                        <Input
                          type="password"
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="rounded-xl font-mono text-xs"
                        />
                      </div>
                    </div>
                    <Button type="submit" size="sm" className="rounded-xl text-xs font-bold mt-2">
                      {t("settings.password.updateBtn", "Update Password")}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Personal Notifications & Sign Out */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">{t("settings.notifications.title", "Personal Notification Alerts")}</CardTitle>
                  </div>
                  <CardDescription>{t("settings.notifications.desc", "Manage personal email triggers and operational digests")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">{t("settings.notifications.orders", "Email Order Alerts")}</Label>
                      <p className="text-[11px] text-muted-foreground">{t("settings.notifications.ordersDesc", "Notify on high-value multi-brand orders")}</p>
                    </div>
                    <Switch
                      checked={emailAlerts}
                      onCheckedChange={setEmailAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold">{t("settings.notifications.reports", "Weekly Performance Digest")}</Label>
                      <p className="text-[11px] text-muted-foreground">{t("settings.notifications.reportsDesc", "Receive summary of revenue and creator growth")}</p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sign Out Card */}
              <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl p-5 flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{t("settings.session.title", "Sign Out of Admin Console")}</p>
                  <p className="text-[11px] text-muted-foreground">{t("settings.session.desc", "Safely terminate your active administrative session")}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold"
                >
                  <LogOut size={13} className="mr-1.5" />
                  {t("settings.session.btn", "Log Out")}
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2: ADVANCED PLATFORM SETTINGS (OWNER & DELEGATED ADMINS ONLY)
           ════════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="advanced" className="space-y-6 m-0">
          {!hasAdvSettingsAccess ? (
            /* Restricted Access Card for Unauthorized Staff */
            <Card className="border border-amber-500/30 bg-amber-500/5 backdrop-blur rounded-3xl p-8 text-center max-w-xl mx-auto shadow-xl">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
                <Lock size={28} />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">
                {t("settings.adv.locked.title", "Advanced Settings Restricted")}
              </h2>
              <p className="text-xs text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {t(
                  "settings.adv.locked.desc",
                  "These controls are locked to Platform Owners, Co-Owners, and admins with granted permission. Contact Amine (Owner) to request access."
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("simple")}
                className="rounded-xl text-xs font-semibold"
              >
                ← Back to General Settings
              </Button>
            </Card>
          ) : (
            /* Unlocked Advanced Control Center */
            <div className="space-y-6">
              {/* Clearance Banner */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-primary/10 to-transparent border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {t("settings.adv.banner.title", "Restricted High-Level Control Panel")}
                      <Badge className="bg-amber-500 text-black font-black text-[10px] uppercase">
                        LEVEL 5 ACCESS
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                      {t("settings.adv.banner.desc", "You have full clearance to configure platform monetary rules, team permissions, security guardrails, and automated engines.")}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveAdvancedSettings}
                  disabled={isSaving}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Apply Platform Rules"}
                </Button>
              </div>

              {/* 1. Admin Delegation Manager (Owner / Co-Owner Only) */}
              {(isOwner || isCoOwner) && (
                <Card className="border border-amber-500/30 bg-card/60 backdrop-blur rounded-3xl shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-amber-500" />
                        <div>
                          <CardTitle className="text-base font-bold">
                            {t("settings.adv.delegation.title", "Admin Permissions & Delegation")}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {t("settings.adv.delegation.desc", "Grant or revoke Advanced Platform Settings access for staff administrators.")}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px] font-bold">
                        Owner Governance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/40 text-muted-foreground">
                            <th className="text-left py-2 px-3 font-semibold">{t("settings.adv.delegation.tableAdmin", "Administrator")}</th>
                            <th className="text-left py-2 px-3 font-semibold">{t("settings.adv.delegation.tableRole", "Role / Rank")}</th>
                            <th className="text-left py-2 px-3 font-semibold">{t("settings.adv.delegation.tableAccess", "Advanced Settings Access")}</th>
                            <th className="text-right py-2 px-3 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEMO_STAFF_MEMBERS.map((staff) => {
                            const isStaffOwner = staff.id === "staff-1";
                            const hasAccess = isStaffOwner || grantedAdminIds.includes(staff.id);
                            return (
                              <tr key={staff.id} className="border-b border-border/20 hover:bg-muted/30 transition">
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-foreground flex items-center gap-1.5">
                                    {staff.name}
                                    {isStaffOwner && <Crown size={12} className="text-amber-500 fill-amber-500" />}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-mono">{staff.email}</div>
                                </td>
                                <td className="py-2.5 px-3">
                                  {isStaffOwner ? (
                                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                      Platform Owner
                                    </Badge>
                                  ) : staff.isCoOwner ? (
                                    <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                                      Co-Owner
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px]">
                                      Staff Admin
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  {hasAccess ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                      <CheckCircle2 size={13} /> {t("settings.adv.delegation.granted", "Granted")}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-[11px]">
                                      Standard View
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {isStaffOwner ? (
                                    <span className="text-[10px] font-mono text-muted-foreground italic">
                                      {t("settings.adv.delegation.ownerImmune", "Root Owner (Permanent)")}
                                    </span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant={hasAccess ? "outline" : "default"}
                                      onClick={() => handleToggleAdminAccess(staff.id, staff.name)}
                                      className={`h-7 rounded-lg text-[10px] font-bold ${
                                        hasAccess
                                          ? "border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      }`}
                                    >
                                      {hasAccess
                                        ? t("settings.adv.delegation.revokeBtn", "Revoke Access")
                                        : t("settings.adv.delegation.grantBtn", "Grant Access")}
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 2-Column Grid for Advanced Parameters */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Operations & Automation */}
                <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sliders className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base font-bold">
                        {t("settings.adv.platform.title", "Platform Operations & Maintenance")}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {t("settings.adv.platform.desc", "Global site availability and brand approval automation")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle size={13} />
                          {t("settings.adv.maintenance", "Emergency Maintenance Mode")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.maintenanceDesc", "Locks mobile application checkouts for database upgrades")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.maintenanceMode}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, maintenanceMode: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.allowRegistrations", "Allow Public Registrations")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.allowRegistrationsDesc", "Permit new shoppers and creators to sign up")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.allowRegistrations}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, allowRegistrations: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.autoApproveBrands", "Auto-Approve Partner Brands")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.autoApproveBrandsDesc", "Skip manual compliance review for verified fashion stores")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.autoApproveBrands}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, autoApproveBrands: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.autoFlagPosts", "Auto-Flag Incomplete Looks")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.autoFlagPostsDesc", "Automatically hide user posts with missing tagged products")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.autoFlagPosts}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, autoFlagPosts: c })}
                      />
                    </div>

                    <div className="pt-2">
                      <Label className="text-xs font-semibold">
                        {t("settings.adv.cancellationWindow", "Order Cancellation Window (Hours)")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={72}
                        value={advSettings.cancellationWindowHours}
                        onChange={(e) => setAdvSettings({ ...advSettings, cancellationWindowHours: Number(e.target.value) || 24 })}
                        className="rounded-xl mt-1.5 font-mono text-xs w-32"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Financial & Commission Engine */}
                <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      <CardTitle className="text-base font-bold">
                        {t("settings.adv.finance.title", "Marketplace Financial Engine")}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {t("settings.adv.finance.desc", "Configure platform commissions, brand fees, and withdrawal rules")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">
                          {t("settings.adv.creatorCommission", "Default Creator Commission (%)")}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.5"
                            min="1"
                            max="50"
                            value={advSettings.creatorCommissionRate}
                            onChange={(e) => setAdvSettings({ ...advSettings, creatorCommissionRate: Number(e.target.value) || 15 })}
                            className="rounded-xl font-mono text-xs pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">
                          {t("settings.adv.brandFee", "Platform Brand Fee (%)")}
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.5"
                            min="1"
                            max="30"
                            value={advSettings.brandFeeRate}
                            onChange={(e) => setAdvSettings({ ...advSettings, brandFeeRate: Number(e.target.value) || 8 })}
                            className="rounded-xl font-mono text-xs pr-8"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        {t("settings.adv.minWithdrawal", "Minimum Payout Withdrawal (TND)")}
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="10"
                          min="10"
                          value={advSettings.minWithdrawalTnd}
                          onChange={(e) => setAdvSettings({ ...advSettings, minWithdrawalTnd: Number(e.target.value) || 50 })}
                          className="rounded-xl font-mono text-xs pr-12"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">TND</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <Label className="text-xs font-semibold">
                        {t("settings.adv.payoutMode", "Withdrawal Processing Workflow")}
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setAdvSettings({ ...advSettings, payoutMode: "manual" })}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            advSettings.payoutMode === "manual"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          Manual Review (Recommended)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvSettings({ ...advSettings, payoutMode: "auto" })}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                            advSettings.payoutMode === "auto"
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-border/50 text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          Auto Instant Payout
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security & Safeguards */}
                <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                      <CardTitle className="text-base font-bold">
                        {t("settings.adv.security.title", "Security & Safeguards")}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {t("settings.adv.security.desc", "Authentication hardening, brute-force mitigation, and webhooks")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.enforce2FA", "Mandatory Two-Factor Auth (2FA)")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.enforce2FADesc", "Require authenticator code for all console staff")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.enforce2FA}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, enforce2FA: c })}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">
                        {t("settings.adv.maxAttempts", "Max Failed Login Attempts")}
                      </Label>
                      <Input
                        type="number"
                        min={3}
                        max={10}
                        value={advSettings.maxLoginAttempts}
                        onChange={(e) => setAdvSettings({ ...advSettings, maxLoginAttempts: Number(e.target.value) || 5 })}
                        className="rounded-xl font-mono text-xs w-28"
                      />
                    </div>

                    <div className="space-y-1 pt-1">
                      <Label className="text-xs font-semibold">
                        {t("settings.adv.webhook", "Audit Webhook URL (Slack/Discord)")}
                      </Label>
                      <Input
                        type="url"
                        value={advSettings.auditWebhookUrl}
                        onChange={(e) => setAdvSettings({ ...advSettings, auditWebhookUrl: e.target.value })}
                        className="rounded-xl font-mono text-xs"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* AI & Innovation Engine */}
                <Card className="border border-border/50 bg-card/50 backdrop-blur rounded-3xl shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-cyan-400" />
                      <CardTitle className="text-base font-bold">
                        {t("settings.adv.ai.title", "AI & Innovation Feature Flags")}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {t("settings.adv.ai.desc", "Manage experimental Styly machine learning modules")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.tryOn", "Styly AI Virtual Try-On Engine")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.tryOnDesc", "Enable interactive 3D/AI outfit preview for shoppers")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.enableVirtualTryOn}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, enableVirtualTryOn: c })}
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-bold">
                          {t("settings.adv.autoTagging", "AI Smart Outfit Tagging")}
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("settings.adv.autoTaggingDesc", "Auto-detect garments and suggest brand matches from photos")}
                        </p>
                      </div>
                      <Switch
                        checked={advSettings.enableAutoTagging}
                        onCheckedChange={(c) => setAdvSettings({ ...advSettings, enableAutoTagging: c })}
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Immutable Admin Action Audit Trail */}
                <AuditTrailView />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

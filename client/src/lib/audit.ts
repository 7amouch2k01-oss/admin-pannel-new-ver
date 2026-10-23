export interface AuditLogEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  category: "finance" | "security" | "moderation" | "system";
  details: string;
  ipAddress: string;
  timestamp: string;
}

const STORAGE_KEY = "styly_audit_trail_logs";

const DEFAULT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    adminName: "Amine",
    adminEmail: "amine@styly.tn",
    action: "Platform Initialized",
    category: "system",
    details: "Root owner initialized master administration hub with complete clearance.",
    ipAddress: "197.0.24.112 (Tunis)",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "log-2",
    adminName: "Amine",
    adminEmail: "amine@styly.tn",
    action: "Updated Creator Commission",
    category: "finance",
    details: "Adjusted standard creator payout rate to 10.0%.",
    ipAddress: "197.0.24.112 (Tunis)",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "log-3",
    adminName: "Amine",
    adminEmail: "amine@styly.tn",
    action: "Configured Two-Factor Policy",
    category: "security",
    details: "Enforced mandatory 2FA security guardrails for all console staff.",
    ipAddress: "197.0.24.112 (Tunis)",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "log-4",
    adminName: "Amine",
    adminEmail: "amine@styly.tn",
    action: "Verified Partner Store",
    category: "moderation",
    details: "Approved 'Lilas Boutique' store registration for live catalogue sales.",
    ipAddress: "197.0.24.112 (Tunis)",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "log-5",
    adminName: "Amine",
    adminEmail: "amine@styly.tn",
    action: "Carrier Manifest Export",
    category: "finance",
    details: "Generated Tunisian Aramex COD delivery sheet for dispatch.",
    ipAddress: "197.0.24.112 (Tunis)",
    timestamp: new Date().toISOString(),
  },
];

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOGS));
      return DEFAULT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOGS;
  }
}

export function logAdminAction(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  try {
    const logs = getAuditLogs();
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...logs].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

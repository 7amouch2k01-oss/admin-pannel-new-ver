import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuditLogs, AuditLogEntry } from "@/lib/audit";
import { ShieldCheck, Search, Shield, DollarSign, RefreshCw, Lock, Terminal, Clock } from "lucide-react";

const CATEGORY_STYLES: Record<AuditLogEntry["category"], { bg: string; text: string; border: string }> = {
  finance: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  security: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  moderation: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  system: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
};

export function AuditTrailView() {
  const { t, language } = useLanguage();
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => getAuditLogs());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchCat = categoryFilter === "all" || log.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      log.action.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ipAddress.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur rounded-3xl overflow-hidden shadow-xl">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                <Terminal size={14} />
              </div>
              <CardTitle className="text-base font-bold">
                {language === "fr" ? "Journal d'Audit & Sécurité Administrateur" : "Admin Security & Action Audit Trail"}
              </CardTitle>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                Immutable
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              {language === "fr"
                ? "Registre inviolable des modifications critiques (commissions, permissions, statuts et sécurité)."
                : "Tamper-proof ledger of high-impact staff actions, financial edits, and security changes."}
            </CardDescription>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setLogs(getAuditLogs())}
            className="rounded-xl text-xs gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw size={13} />
            <span>{language === "fr" ? "Actualiser" : "Refresh"}</span>
          </Button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "fr"
                  ? "Filtrer par action, administrateur, IP..."
                  : "Filter by action, admin, IP..."
              }
              className="pl-9 h-9 rounded-xl text-xs bg-background/60"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "finance", "security", "moderation", "system"].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? "default" : "outline"}
                onClick={() => setCategoryFilter(cat)}
                className="rounded-xl text-[11px] h-8 capitalize font-bold"
              >
                {cat === "all"
                  ? (language === "fr" ? "Tous" : "All")
                  : cat}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40">
              <TableHead className="w-[170px] text-xs">
                {language === "fr" ? "Date & Heure" : "Timestamp"}
              </TableHead>
              <TableHead className="text-xs">
                {language === "fr" ? "Administrateur" : "Admin"}
              </TableHead>
              <TableHead className="text-xs">
                {language === "fr" ? "Action Effectuée" : "Action"}
              </TableHead>
              <TableHead className="text-xs">
                {language === "fr" ? "Détails de l'Opération" : "Details"}
              </TableHead>
              <TableHead className="text-xs">
                {language === "fr" ? "Adresse IP" : "IP / Origin"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                  {language === "fr" ? "Aucun événement enregistré." : "No audit events found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const style = CATEGORY_STYLES[log.category] || CATEGORY_STYLES.system;
                return (
                  <TableRow key={log.id} className="border-border/30 hover:bg-muted/30 text-xs">
                    <TableCell className="font-mono text-muted-foreground text-[11px]">
                      {new Date(log.timestamp).toLocaleString(language === "fr" ? "fr-FR" : "en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-foreground">{log.adminName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.adminEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-bold capitalize text-[10px] ${style.bg} ${style.text} ${style.border}`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground max-w-sm">
                      <p className="line-clamp-2">{log.details}</p>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

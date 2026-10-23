import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  CornerDownRight,
  User,
  Building2,
} from "lucide-react";

interface Message {
  id: string;
  sender: "admin" | "customer" | "brand";
  senderName: string;
  text: string;
  timestamp: string;
}

interface DisputeResolutionModalProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolveRefund: (orderId: string) => void;
  onRejectRefund: (orderId: string) => void;
}

export function DisputeResolutionModal({
  order,
  open,
  onOpenChange,
  onResolveRefund,
  onRejectRefund,
}: DisputeResolutionModalProps) {
  const { language } = useLanguage();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "customer",
      senderName: order?.customerName || "Client",
      text: order?.refundReason || "Je souhaite retourner cet article car la taille reçue ne correspond pas.",
      timestamp: "Il y a 3 heures",
    },
    {
      id: "m2",
      sender: "brand",
      senderName: "Boutique Partenaire",
      text: "L'article a été expédié selon les mesures du guide des tailles standard. Nous attendons confirmation de retour.",
      timestamp: "Il y a 1 heure",
    },
  ]);

  if (!order) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "admin",
      senderName: "Support Administratif Styly (Amine)",
      text: inputText.trim(),
      timestamp: "À l'instant",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    toast.success(
      language === "fr"
        ? "Message transmis au client et à la marque partenaire !"
        : "Message sent to customer and brand partner!"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 shadow-2xl border-border/60">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {language === "fr" ? "Médiation & Résolution Litige Commande" : "Order Dispute Mediation & Chat"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {language === "fr"
                    ? `Discussion directe entre le client, la marque et l'administration pour la commande #${String(order.id).slice(0, 8)}`
                    : `Direct 3-way dispute channel for order #${String(order.id).slice(0, 8)}`}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10 text-[10px]">
              {language === "fr" ? "En Cours d'Arbitrage" : "Active Mediation"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Claim summary notice */}
        <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-foreground">{order.customerName} ({order.phone || "Tél N/A"})</span>
            <span className="font-mono text-emerald-400 font-bold">{(order.totalAmount || 0).toFixed(2)} TND</span>
          </div>
          <p className="text-muted-foreground text-[11px] line-clamp-2 italic">
            "{order.refundReason || "Motif de retour non spécifié"}"
          </p>
        </div>

        {/* Message timeline thread */}
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 py-1">
          {messages.map((msg) => {
            const isAdmin = msg.sender === "admin";
            const isBrand = msg.sender === "brand";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                  {isAdmin ? <Shield size={11} className="text-primary" /> : isBrand ? <Building2 size={11} className="text-purple-400" /> : <User size={11} className="text-blue-400" />}
                  <span className="font-semibold text-foreground">{msg.senderName}</span>
                  <span>· {msg.timestamp}</span>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    isAdmin
                      ? "bg-primary text-white rounded-tr-none shadow-md"
                      : isBrand
                      ? "bg-purple-500/10 border border-purple-500/20 text-foreground rounded-tl-none"
                      : "bg-muted/70 border border-border/40 text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border/40">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === "fr"
                ? "Écrire une consigne ou une décision d'arbitrage..."
                : "Type admin mediation message or resolution..."
            }
            className="rounded-xl text-xs flex-1 bg-background"
          />
          <Button type="submit" size="sm" className="rounded-xl px-4 gap-1.5 text-xs font-bold">
            <Send size={13} />
            <span>{language === "fr" ? "Envoyer" : "Send"}</span>
          </Button>
        </form>

        {/* Admin Resolution Decision Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground font-medium">
            {language === "fr" ? "Action définitive de l'admin :" : "Final admin resolution:"}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onRejectRefund(order.id);
                onOpenChange(false);
              }}
              className="rounded-xl text-xs border-border/60 text-muted-foreground hover:text-rose-400 hover:border-rose-500/40"
            >
              {language === "fr" ? "Rejeter Réclamation" : "Decline Claim"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onResolveRefund(order.id);
                onOpenChange(false);
              }}
              className="rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {language === "fr" ? "Valider & Rembourser" : "Approve & Refund"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

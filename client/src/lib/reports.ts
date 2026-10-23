import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface CarrierExportRow {
  reference: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  codAmount: number;
  paymentMethod: string;
  itemsCount: number;
  status: string;
  date: string;
}

/**
 * Generates an Excel spreadsheet (.xlsx) ready for local Tunisian couriers (Aramex, etc.)
 */
export function exportOrdersForCarrierExcel(orders: any[], filename = "Styly_Bordereau_Livraisons.xlsx") {
  const rows: CarrierExportRow[] = orders.map((o) => {
    const isCod = o.paymentMethod === "cod";
    return {
      reference: `#${String(o.id).slice(0, 8)}`,
      customerName: o.customerName || "Client",
      phone: o.phone || "N/A",
      city: extractCityFromAddress(o.shippingAddress),
      address: o.shippingAddress || "N/A",
      codAmount: isCod ? Number(o.totalAmount || 0) : 0,
      paymentMethod: isCod ? "Espèces / COD" : "En Ligne / D17",
      itemsCount: Array.isArray(o.items) ? o.items.length : 1,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString("fr-TN"),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [
      "reference",
      "customerName",
      "phone",
      "city",
      "address",
      "codAmount",
      "paymentMethod",
      "itemsCount",
      "status",
      "date",
    ],
  });

  // Set friendly Arabic / French headers for Tunisian courier partners
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [[
      "Réf Commande",
      "Destinataire (Nom)",
      "Numéro Téléphone",
      "Ville / Gouvernorat",
      "Adresse Complète",
      "Montant COD (TND)",
      "Mode Paiement",
      "Nb Articles",
      "Statut",
      "Date",
    ]],
    { origin: "A1" }
  );

  // Set column widths
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 35 },
    { wch: 18 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bordereau Livraisons");
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates an official branded Styly Financial Performance & Ledger PDF
 */
export function generateFinancialReportPDF(params: {
  gross: number;
  refunds: number;
  creatorCommissions: number;
  brandPayouts: number;
  netProfit: number;
  totalOrders: number;
  totalUsers: number;
  periodLabel?: string;
}) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString("fr-TN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Header Brand Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("STYLY", 16, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.text("PLATEFORME OFFICIELLE DE SOCIAL COMMERCE - TUNISIE", 16, 28);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Édité le : ${dateStr}`, 150, 20);
  doc.text(`Période : ${params.periodLabel || "Cumul Annuel 2026"}`, 150, 26);

  // Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("RAPPORT FINANCIER & PERFORMANCE DE LA PLATEFORME", 16, 48);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Relevé officiel des flux financiers, commissions créateurs et marge nette conservée.", 16, 54);

  // Financial Waterfall Summary Table
  const tableData = [
    ["1. Volume Brut des Commandes", `${params.gross.toLocaleString("fr-TN", { minimumFractionDigits: 2 })} TND`, "Total paiements clients reçus"],
    ["2. Remboursements & Retours Clients", `-${params.refunds.toLocaleString("fr-TN", { minimumFractionDigits: 2 })} TND`, "Réclamations traitées et déduites"],
    ["3. Commissions Créateurs & Stylers", `-${params.creatorCommissions.toLocaleString("fr-TN", { minimumFractionDigits: 2 })} TND`, "Rémunération looks & affiliés"],
    ["4. Paiements Boutiques & Marques Partenaires", `-${params.brandPayouts.toLocaleString("fr-TN", { minimumFractionDigits: 2 })} TND`, "Virements ventes reversés aux marques"],
    [
      "BÉNÉFICE NET CONSERVÉ (STYLY)",
      `${params.netProfit >= 0 ? "+" : ""}${params.netProfit.toLocaleString("fr-TN", { minimumFractionDigits: 2 })} TND`,
      "Marge nette réelle restante pour Styly",
    ],
  ];

  autoTable(doc, {
    startY: 62,
    head: [["Rubrique Financière", "Montant (TND)", "Description Opérationnelle"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [239, 68, 68], // Styly primary red/orange
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: "bold" },
      1: { cellWidth: 45, halign: "right", fontStyle: "bold" },
      2: { cellWidth: 75, textColor: [100, 116, 139] },
    },
    styles: { fontSize: 9, cellPadding: 4 },
  });

  // KPI Overview Boxes
  const lastY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("INDICATEURS OPÉRATIONNELS COMPLÉMENTAIRES", 16, lastY);

  autoTable(doc, {
    startY: lastY + 4,
    head: [["Indicateur Clé", "Valeur Enregistrée", "Unité"]],
    body: [
      ["Total des Commandes Passées", params.totalOrders.toLocaleString(), "transactions"],
      ["Nombre de Comptes Utilisateurs", params.totalUsers.toLocaleString(), "shoppers & créateurs"],
      ["Devise Officielle de Facturation", "Dinar Tunisien (TND)", "monnaie légale"],
    ],
    theme: "grid",
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5 },
  });

  // Footer & Signature Block
  const footerY = (doc as any).lastAutoTable.finalY + 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(16, footerY, 194, footerY);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Certifié conforme par la Direction Financière Styly — Document confidentiel.", 16, footerY + 6);
  doc.text("Plateforme Styly TN · contact@styly.tn", 150, footerY + 6);

  doc.save(`Styly_Rapport_Financier_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function extractCityFromAddress(address?: string): string {
  if (!address) return "Tunis";
  const knownCities = ["Tunis", "Ariana", "Ben Arous", "Manouba", "Sousse", "Sfax", "Nabeul", "Bizerte", "Monastir", "Kairouan", "Gabes", "Djerba", "Mahdia"];
  for (const c of knownCities) {
    if (address.toLowerCase().includes(c.toLowerCase())) return c;
  }
  return "Tunis";
}

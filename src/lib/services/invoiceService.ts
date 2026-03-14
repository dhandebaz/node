import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { DBInvoice, DBTenant } from "@/types/database";

export class InvoiceService {
  static async generatePDF(invoice: DBInvoice, tenant: DBTenant): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header - Brand
    doc.setFontSize(24);
    doc.setTextColor(235, 68, 90); // Brand Red
    doc.text("KAISA", margin, margin + 10);

    // Invoice Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice #: ${invoice.id.slice(0, 8).toUpperCase()}`, margin, margin + 25);
    doc.text(`Date: ${format(new Date(invoice.created_at), "PPP")}`, margin, margin + 30);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, margin, margin + 35);

    // Business Details (From)
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text("From:", margin, margin + 50);
    doc.setFontSize(10);
    doc.text("Antigravity Labs Private Limited", margin, margin + 55);
    doc.text("HSR Layout, Bangalore", margin, margin + 60);
    doc.text("Karnataka, India - 560102", margin, margin + 65);

    // Client Details (To)
    doc.setFontSize(12);
    const rightCol = pageWidth - margin - 60;
    doc.text("Bill To:", rightCol, margin + 50);
    doc.setFontSize(10);
    doc.text(tenant.name || "Valued Customer", rightCol, margin + 55);
    doc.text(tenant.business_type?.replace(/_/g, " ") || "Business", rightCol, margin + 60);

    // Table Header
    const tableTop = margin + 80;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, tableTop, pageWidth - (margin * 2), 10, "F");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Description", margin + 5, tableTop + 7);
    doc.text("Amount", pageWidth - margin - 25, tableTop + 7);

    // Table Content
    doc.text(`Description: ${invoice.items?.[0]?.description || "Subscription Plan"}`, margin + 5, tableTop + 20);
    doc.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - margin - 25, tableTop + 20);

    // Total
    const totalTop = tableTop + 40;
    doc.setDrawColor(200);
    doc.line(margin, totalTop - 5, pageWidth - margin, totalTop - 5);
    doc.setFontSize(14);
    doc.text("Total Paid:", margin + 5, totalTop + 5);
    doc.text(`₹${invoice.amount.toFixed(2)}`, pageWidth - margin - 25, totalTop + 5);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const footerText = "Thank you for using Kaisa. For any queries, contact support@nodebase.ai";
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - textWidth) / 2, doc.internal.pageSize.getHeight() - 20);

    return doc.output("blob");
  }

  static downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

import jsPDF from "jspdf";
import { Invoice } from "@/types/billing";

export const invoiceService = {
  generatePDF(invoice: Invoice): Blob {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("INVOICE", 150, 20);
    
    doc.setFontSize(12);
    doc.text("Nodebase AI", 20, 20);
    doc.setFontSize(10);
    doc.text("123 Tech Park, Bangalore", 20, 26);
    doc.text("India - 560001", 20, 32);

    // Details
    doc.setFontSize(10);
    doc.text(`Invoice ID: ${invoice.id}`, 150, 40);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 150, 46);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 150, 52);

    // Bill To
    doc.text("Bill To:", 20, 60);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.billingDetails.name, 20, 66);
    doc.setFont("helvetica", "normal");
    if (invoice.billingDetails.address) {
        doc.text(invoice.billingDetails.address, 20, 72);
    }
    if (invoice.billingDetails.taxId) {
        doc.text(`GSTIN: ${invoice.billingDetails.taxId}`, 20, 78);
    }

    // Items Table
    let y = 100;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, y + 2);
    doc.text("Amount", 160, y + 2);
    
    y += 10;
    doc.setFont("helvetica", "normal");
    
    invoice.items.forEach(item => {
        doc.text(item.description, 25, y + 2);
        doc.text(`${invoice.currency} ${item.amount}`, 160, y + 2);
        y += 10;
    });

    // Total
    y += 10;
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Total", 120, y);
    doc.text(`${invoice.currency} ${invoice.amount}`, 160, y);

    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your business.", 20, 280);
    
    return doc.output("blob");
  }
};

import PDFDocument from "pdfkit";
import { Response } from "express";

export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: Date | string;
  dueDate: Date | string;
  billingPeriodStart?: Date | string | null;
  billingPeriodEnd?: Date | string | null;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  notes?: string | null;
  customer: {
    displayName: string;
    companyName?: string | null;
    customerCode: string;
    email?: string | null;
    phone?: string | null;
  };
  subscription?: {
    subscriptionNumber: string;
  } | null;
  lines: Array<{
    descriptionSnapshot: string;
    quantity: number;
    unitPrice: number;
    taxableAmount?: number;
    taxAmount?: number;
    lineTotal: number;
    taxSnapshot?: any;
  }>;
}

export class InvoicePdfService {
  /**
   * Generates a branded, GST-compliant tax invoice PDF and streams it to the HTTP response
   */
  static generateInvoicePdf(data: InvoicePdfData, res: Response): void {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `Invoice ${data.invoiceNumber}`,
        Author: "Brightloop Subscription System",
        Subject: `Commercial Tax Invoice ${data.invoiceNumber}`,
      },
    });

    // Stream PDF directly to client response
    doc.pipe(res);

    const currencySymbol = data.currency === "INR" ? "INR " : `${data.currency} `;

    // 1. Header Banner
    doc
      .fillColor("#4f46e5") // Indigo-600
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("BRIGHTLOOP", 40, 40);

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font("Helvetica")
      .text("Subscription Billing & Revenue Cloud", 40, 66);

    doc
      .fillColor("#0f172a")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("TAX INVOICE", 400, 40, { align: "right" });

    // Status Pill on top right
    const statusColor =
      data.status === "PAID"
        ? "#059669"
        : data.status === "CONFIRMED"
        ? "#2563eb"
        : data.status === "CANCELLED"
        ? "#dc2626"
        : "#d97706";

    doc
      .fillColor(statusColor)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(`STATUS: ${data.status}`, 400, 62, { align: "right" });

    // Horizontal Divider
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(40, 85)
      .lineTo(555, 85)
      .stroke();

    // 2. Issuer & Customer Two-Column Metadata
    const colY = 98;

    // Left Column: Supplier & Customer Info
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("BILLED BY (SUPPLIER)", 40, colY);

    doc
      .fillColor("#0f172a")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Brightloop Technologies Pvt Ltd", 40, colY + 14);

    doc
      .fillColor("#475569")
      .fontSize(9)
      .font("Helvetica")
      .text("GSTIN: 32AAACB1234F1Z5", 40, colY + 28)
      .text("State: Kerala (Code: 32)", 40, colY + 40)
      .text("Kochi InfoPark, Kochi, Kerala 682042", 40, colY + 52)
      .text("Email: billing@brightloop.io", 40, colY + 64);

    // Right Column: Customer Info & Invoice Parameters
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("BILLED TO (CUSTOMER)", 300, colY);

    doc
      .fillColor("#0f172a")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(data.customer.companyName || data.customer.displayName, 300, colY + 14);

    doc
      .fillColor("#475569")
      .fontSize(9)
      .font("Helvetica")
      .text(`Customer Code: ${data.customer.customerCode}`, 300, colY + 28)
      .text(`Attention: ${data.customer.displayName}`, 300, colY + 40)
      .text(`Email: ${data.customer.email || "N/A"}`, 300, colY + 52)
      .text(`Phone: ${data.customer.phone || "N/A"}`, 300, colY + 64);

    // 3. Invoice Summary Box
    const boxY = 190;
    doc
      .fillColor("#f8fafc")
      .rect(40, boxY, 515, 52)
      .fill();

    doc
      .strokeColor("#cbd5e1")
      .lineWidth(0.5)
      .rect(40, boxY, 515, 52)
      .stroke();

    // Box Columns
    doc.fillColor("#64748b").fontSize(8).font("Helvetica-Bold");
    doc.text("INVOICE NUMBER", 52, boxY + 10);
    doc.text("ISSUE DATE", 175, boxY + 10);
    doc.text("DUE DATE", 280, boxY + 10);
    doc.text("BILLING PERIOD", 385, boxY + 10);

    const fmtDate = (d?: Date | string | null) =>
      d ? new Date(d).toISOString().split("T")[0] : "N/A";

    doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold");
    doc.text(data.invoiceNumber, 52, boxY + 26);
    doc.text(fmtDate(data.issueDate), 175, boxY + 26);
    doc.text(fmtDate(data.dueDate), 280, boxY + 26);

    const periodStr =
      data.billingPeriodStart && data.billingPeriodEnd
        ? `${fmtDate(data.billingPeriodStart)} to ${fmtDate(data.billingPeriodEnd)}`
        : "Standard";
    doc.text(periodStr, 385, boxY + 26);

    // 4. Line Items Table Header
    const tableY = 265;
    doc
      .fillColor("#4f46e5")
      .rect(40, tableY, 515, 22)
      .fill();

    doc
      .fillColor("#ffffff")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("#", 48, tableY + 6)
      .text("DESCRIPTION / SERVICE ITEM", 75, tableY + 6)
      .text("QTY", 300, tableY + 6, { width: 35, align: "center" })
      .text("UNIT PRICE", 345, tableY + 6, { width: 65, align: "right" })
      .text("TAX", 420, tableY + 6, { width: 50, align: "right" })
      .text("AMOUNT", 480, tableY + 6, { width: 65, align: "right" });

    // Line Items Rows
    let rowY = tableY + 26;

    data.lines.forEach((line, index) => {
      // Row alternating highlight
      if (index % 2 === 1) {
        doc.fillColor("#f8fafc").rect(40, rowY - 4, 515, 24).fill();
      }

      const lineTax = Number(line.taxAmount || 0);

      doc
        .fillColor("#475569")
        .fontSize(8)
        .font("Helvetica")
        .text(String(index + 1), 48, rowY)
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .text(line.descriptionSnapshot, 75, rowY, { width: 220 })
        .font("Helvetica")
        .fillColor("#334155")
        .text(String(line.quantity), 300, rowY, { width: 35, align: "center" })
        .text(`${currencySymbol}${Number(line.unitPrice).toFixed(2)}`, 345, rowY, {
          width: 65,
          align: "right",
        })
        .text(`${currencySymbol}${lineTax.toFixed(2)}`, 420, rowY, {
          width: 50,
          align: "right",
        })
        .font("Helvetica-Bold")
        .text(`${currencySymbol}${Number(line.lineTotal).toFixed(2)}`, 480, rowY, {
          width: 65,
          align: "right",
        });

      rowY += 24;
    });

    // Divider after lines
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(0.5)
      .moveTo(40, rowY + 6)
      .lineTo(555, rowY + 6)
      .stroke();

    // 5. Totals & Tax Calculation Breakdown
    const totalsY = rowY + 18;

    // Left box: Bank details & Notes
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text("REMITTANCE & PAYMENT INSTRUCTIONS", 40, totalsY);

    doc
      .fillColor("#475569")
      .fontSize(8)
      .font("Helvetica")
      .text("Online: Customer Self-Service Portal (Razorpay Instant Credit)", 40, totalsY + 14)
      .text("Account Name: Brightloop Technologies Private Limited", 40, totalsY + 26)
      .text("Bank: HDFC Bank, Infopark Branch", 40, totalsY + 38)
      .text("IFSC Code: HDFC0001234 | Account #: 50200088899911", 40, totalsY + 50);

    if (data.notes) {
      doc
        .fillColor("#64748b")
        .font("Helvetica-Bold")
        .text("NOTES", 40, totalsY + 70)
        .font("Helvetica")
        .text(data.notes, 40, totalsY + 82, { width: 240 });
    }

    // Right box: Financial Summary
    const rightX = 340;
    const rightValX = 470;
    let sumY = totalsY;

    const renderTotalRow = (label: string, value: number, isBold = false) => {
      doc
        .fillColor(isBold ? "#0f172a" : "#475569")
        .fontSize(isBold ? 9 : 8)
        .font(isBold ? "Helvetica-Bold" : "Helvetica")
        .text(label, rightX, sumY)
        .text(`${currencySymbol}${value.toFixed(2)}`, rightValX, sumY, {
          width: 75,
          align: "right",
        });
      sumY += 15;
    };

    renderTotalRow("Taxable Subtotal:", data.subtotal);
    if (data.discountTotal > 0) {
      renderTotalRow("Discount Applied:", -data.discountTotal);
    }
    renderTotalRow("Total GST Tax (18%):", data.taxTotal);

    // Thick Divider
    doc
      .strokeColor("#4f46e5")
      .lineWidth(1.5)
      .moveTo(rightX, sumY)
      .lineTo(555, sumY)
      .stroke();

    sumY += 6;
    renderTotalRow("Grand Total (INR):", data.grandTotal, true);

    if (data.paidAmount > 0) {
      renderTotalRow("Amount Paid:", data.paidAmount);
      sumY += 4;
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(rightX, sumY)
        .lineTo(555, sumY)
        .stroke();
      sumY += 6;
      renderTotalRow("Balance Due:", data.outstandingAmount, true);
    }

    // 6. Footer
    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is an electronically generated invoice certified under the Indian Goods and Services Tax Act. No physical signature required.",
        40,
        760,
        { align: "center", width: 515 }
      )
      .text("Brightloop Cloud Billing Engine • Powered by Odoo x Make-A-Ton 9.0 Kochi", 40, 772, {
        align: "center",
        width: 515,
      });

    // Finalize PDF Document
    doc.end();
  }
}


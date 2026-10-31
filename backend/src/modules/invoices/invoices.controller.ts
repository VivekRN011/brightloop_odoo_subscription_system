import { Request, Response } from "express";
import { InvoicesService } from "./invoices.service";
import { InvoicePdfService } from "../../services/invoice-pdf.service";
import { BillingSchedulerService } from "../../services/billing-scheduler.service";
import { sendSuccess, sendError } from "../../utils/api-response";
import { UserRole } from "@prisma/client";

export class InvoicesController {
  static async list(req: Request, res: Response) {
    try {
      const customerScopeId =
        req.user?.role === UserRole.CUSTOMER ? req.user.customerProfileId : undefined;
      const data = await InvoicesService.listInvoices(req.query as any, customerScopeId);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch invoices", 400);
    }
  }

  static async getOverdue(req: Request, res: Response) {
    try {
      const customerScopeId =
        req.user?.role === UserRole.CUSTOMER ? req.user.customerProfileId : undefined;
      const data = await InvoicesService.getOverdueInvoices(customerScopeId);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch overdue invoices", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const customerScopeId =
        req.user?.role === UserRole.CUSTOMER ? req.user.customerProfileId : undefined;
      const data = await InvoicesService.getInvoiceById(req.params.id as string, customerScopeId);
      return sendSuccess(res, data);
    } catch (error: any) {
      const status = error.message?.includes("Access denied") ? 403 : 404;
      return sendError(res, error.message || "Failed to fetch invoice", status);
    }
  }

  static async streamPdf(req: Request, res: Response) {
    try {
      const customerScopeId =
        req.user?.role === UserRole.CUSTOMER ? req.user.customerProfileId : undefined;
      const invoice = await InvoicesService.getInvoiceById(req.params.id as string, customerScopeId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="Invoice-${invoice.invoiceNumber}.pdf"`
      );

      InvoicePdfService.generateInvoicePdf(
        {
          invoiceNumber: invoice.invoiceNumber,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          billingPeriodStart: invoice.billingPeriodStart,
          billingPeriodEnd: invoice.billingPeriodEnd,
          currency: invoice.currency,
          subtotal: Number(invoice.subtotal),
          discountTotal: Number(invoice.discountTotal),
          taxTotal: Number(invoice.taxTotal),
          grandTotal: Number(invoice.grandTotal),
          paidAmount: Number(invoice.paidAmount),
          outstandingAmount: Number(invoice.outstandingAmount),
          status: invoice.status,
          notes: invoice.notes,
          customer: {
            displayName: invoice.customer.displayName,
            companyName: invoice.customer.companyName,
            customerCode: invoice.customer.customerCode,
            email: (invoice.customer as any).user?.email || null,
            phone: invoice.customer.phone,
          },
          subscription: invoice.subscription
            ? { subscriptionNumber: invoice.subscription.subscriptionNumber }
            : null,
          lines: invoice.lines.map((l) => ({
            descriptionSnapshot: l.descriptionSnapshot,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            taxableAmount: Number(l.taxableAmount),
            taxAmount: Number(l.taxAmount),
            lineTotal: Number(l.lineTotal),
            taxSnapshot: l.taxSnapshot,
          })),
        },
        res
      );
    } catch (error: any) {
      const status = error.message?.includes("Access denied") ? 403 : 404;
      return sendError(res, error.message || "Failed to generate invoice PDF", status);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await InvoicesService.createInvoice(req.body, req.user!.id);
      return sendSuccess(res, data, "Invoice created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create invoice", 400);
    }
  }

  static async generateFromSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const data = await InvoicesService.generateFromSubscription(
        subscriptionId as string,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, data, "Invoice generated successfully from subscription", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to generate invoice", 400);
    }
  }

  static async triggerBillingRun(req: Request, res: Response) {
    try {
      const result = await BillingSchedulerService.executeBillingRun(
        "MANUAL_STAFF",
        req.user!.id
      );
      return sendSuccess(res, result, "Automated billing run completed successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to execute billing run", 400);
    }
  }

  static async listBillingRuns(_req: Request, res: Response) {
    try {
      const runs = await BillingSchedulerService.listBillingRuns();
      return sendSuccess(res, runs);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch billing runs", 400);
    }
  }

  static async confirm(req: Request, res: Response) {
    try {
      const data = await InvoicesService.confirmInvoice(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Invoice confirmed successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to confirm invoice", 400);
    }
  }

  static async cancel(req: Request, res: Response) {
    try {
      const data = await InvoicesService.cancelInvoice(
        req.params.id as string,
        req.user!.id,
        req.body?.reason
      );
      return sendSuccess(res, data, "Invoice cancelled successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to cancel invoice", 400);
    }
  }
}

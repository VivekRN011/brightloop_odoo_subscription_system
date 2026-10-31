import { Request, Response } from "express";
import { InvoicesService } from "./invoices.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class InvoicesController {
  static async list(req: Request, res: Response) {
    try {
      const data = await InvoicesService.listInvoices(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch invoices", 400);
    }
  }

  static async getOverdue(_req: Request, res: Response) {
    try {
      const data = await InvoicesService.getOverdueInvoices();
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch overdue invoices", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await InvoicesService.getInvoiceById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch invoice", 404);
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
      const data = await InvoicesService.cancelInvoice(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Invoice cancelled successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to cancel invoice", 400);
    }
  }
}

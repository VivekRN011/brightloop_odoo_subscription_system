import { Request, Response } from "express";
import { QuotationsService } from "./quotations.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class QuotationsController {
  static async list(req: Request, res: Response) {
    try {
      const data = await QuotationsService.listQuotations(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch quotations", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await QuotationsService.getQuotationById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch quotation", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await QuotationsService.createQuotation(req.body, req.user!.id);
      return sendSuccess(res, data, "Quotation created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create quotation", 400);
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const data = await QuotationsService.updateStatus(req.params.id as string, req.body.status, req.user!.id);
      return sendSuccess(res, data, "Quotation status updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update quotation status", 400);
    }
  }

  static async convert(req: Request, res: Response) {
    try {
      const data = await QuotationsService.convertToSubscription(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Quotation converted to subscription successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to convert quotation", 400);
    }
  }

  static async listTemplates(_req: Request, res: Response) {
    try {
      const data = await QuotationsService.listTemplates();
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch templates", 400);
    }
  }

  static async createTemplate(req: Request, res: Response) {
    try {
      const data = await QuotationsService.createTemplate(req.body, req.user!.id);
      return sendSuccess(res, data, "Quotation template created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create template", 400);
    }
  }
}

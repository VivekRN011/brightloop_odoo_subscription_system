import { Request, Response } from "express";
import { TaxesService } from "./taxes.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class TaxesController {
  static async list(_req: Request, res: Response) {
    try {
      const data = await TaxesService.listTaxRules();
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch tax rules", 400);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await TaxesService.createTaxRule(req.body, req.user!.id);
      return sendSuccess(res, data, "Tax rule created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create tax rule", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await TaxesService.updateTaxRule(req.params.id as string, req.body, req.user!.id);
      return sendSuccess(res, data, "Tax rule updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update tax rule", 400);
    }
  }
}

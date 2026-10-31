import { Request, Response } from "express";
import { DiscountsService } from "./discounts.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class DiscountsController {
  static async list(req: Request, res: Response) {
    try {
      const data = await DiscountsService.listDiscounts(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch discounts", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await DiscountsService.getDiscountById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch discount", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await DiscountsService.createDiscount(req.body, req.user!.id);
      return sendSuccess(res, data, "Discount rule created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create discount rule", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await DiscountsService.updateDiscount(req.params.id as string, req.body, req.user!.id);
      return sendSuccess(res, data, "Discount rule updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update discount rule", 400);
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const data = await DiscountsService.toggleDiscountStatus(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Discount rule status updated");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to toggle discount rule status", 400);
    }
  }
}

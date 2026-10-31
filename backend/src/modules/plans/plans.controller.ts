import { Request, Response } from "express";
import { PlansService } from "./plans.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class PlansController {
  static async list(req: Request, res: Response) {
    try {
      const data = await PlansService.listPlans(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch plans", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await PlansService.getPlanById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch plan", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await PlansService.createPlan(req.body, req.user?.id);
      return sendSuccess(res, data, "Subscription plan created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create plan", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await PlansService.updatePlan(req.params.id as string, req.body, req.user?.id);
      return sendSuccess(res, data, "Subscription plan updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update plan", 400);
    }
  }

  static async toggleStatus(req: Request, res: Response) {
    try {
      const data = await PlansService.togglePlanStatus(req.params.id as string, req.user?.id);
      return sendSuccess(res, data, "Plan status updated");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to toggle status", 400);
    }
  }
}

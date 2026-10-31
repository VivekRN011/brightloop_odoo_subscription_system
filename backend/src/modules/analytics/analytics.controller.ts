import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class AnalyticsController {
  static async getDashboard(_req: Request, res: Response) {
    try {
      const data = await AnalyticsService.getDashboardMetrics();
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to load dashboard metrics", 400);
    }
  }

  static async getReports(_req: Request, res: Response) {
    try {
      const data = await AnalyticsService.getReports();
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to load reports", 400);
    }
  }
}


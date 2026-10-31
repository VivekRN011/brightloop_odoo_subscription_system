import { Request, Response } from "express";
import { SubscriptionsService } from "./subscriptions.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class SubscriptionsController {
  static async list(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.listSubscriptions(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch subscriptions", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.getSubscriptionById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch subscription", 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.createSubscription(req.body, req.user!.id);
      return sendSuccess(res, data, "Subscription created successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create subscription", 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.updateSubscription(req.params.id as string, req.body, req.user!.id);
      return sendSuccess(res, data, "Subscription updated successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to update subscription", 400);
    }
  }

  static async pause(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.pauseSubscription(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Subscription paused");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to pause subscription", 400);
    }
  }

  static async resume(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.resumeSubscription(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Subscription activated");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to resume subscription", 400);
    }
  }

  static async close(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.closeSubscription(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Subscription closed");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to close subscription", 400);
    }
  }

  static async generateInvoice(req: Request, res: Response) {
    try {
      const data = await SubscriptionsService.generateInvoice(req.params.id as string, req.user!.id);
      return sendSuccess(res, data, "Invoice generated successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to generate invoice", 400);
    }
  }
}

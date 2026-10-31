import { Request, Response } from "express";
import { PaymentsService } from "./payments.service";
import { sendSuccess, sendError } from "../../utils/api-response";

export class PaymentsController {
  static async list(req: Request, res: Response) {
    try {
      const data = await PaymentsService.listPayments(req.query as any);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch payments", 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await PaymentsService.getPaymentById(req.params.id as string);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to fetch payment", 404);
    }
  }

  static async record(req: Request, res: Response) {
    try {
      const data = await PaymentsService.recordPayment(req.body, req.user!.id);
      return sendSuccess(res, data, "Payment recorded successfully", 201);
    } catch (error: any) {
      return sendError(res, error.message || "Failed to record payment", 400);
    }
  }
}

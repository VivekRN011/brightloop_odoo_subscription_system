import { Request, Response } from "express";
import { PaymentsService } from "./payments.service";
import { RazorpayService } from "./razorpay.service";
import { prisma } from "../../config/prisma";
import { sendSuccess, sendError } from "../../utils/api-response";
import { UserRole } from "@prisma/client";

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

  /**
   * Create Razorpay order for online invoice settlement
   */
  static async createRazorpayOrder(req: Request, res: Response) {
    try {
      const user = req.user!;
      let callerCustomerProfileId: string | undefined = undefined;

      // If user is a CUSTOMER, resolve customer profile ID to restrict payment to own invoice
      if (user.role === UserRole.CUSTOMER) {
        if (user.customerProfileId) {
          callerCustomerProfileId = user.customerProfileId;
        } else {
          const profile = await prisma.customerProfile.findFirst({
            where: { userId: user.id },
          });
          if (profile) callerCustomerProfileId = profile.id;
        }
      }

      const orderData = await RazorpayService.createOrder({
        invoiceId: req.body.invoiceId,
        actorUserId: user.id,
        callerCustomerProfileId,
      });

      return sendSuccess(res, orderData, "Razorpay order created successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Failed to create Razorpay order", 400);
    }
  }

  /**
   * Verify signature and record online payment
   */
  static async verifyRazorpayPayment(req: Request, res: Response) {
    try {
      const user = req.user!;
      let callerCustomerProfileId: string | undefined = undefined;

      if (user.role === UserRole.CUSTOMER) {
        if (user.customerProfileId) {
          callerCustomerProfileId = user.customerProfileId;
        } else {
          const profile = await prisma.customerProfile.findFirst({
            where: { userId: user.id },
          });
          if (profile) callerCustomerProfileId = profile.id;
        }
      }

      const verificationResult = await RazorpayService.verifyPayment({
        invoiceId: req.body.invoiceId,
        razorpayOrderId: req.body.razorpayOrderId,
        razorpayPaymentId: req.body.razorpayPaymentId,
        razorpaySignature: req.body.razorpaySignature,
        actorUserId: user.id,
        callerCustomerProfileId,
      });

      return sendSuccess(res, verificationResult, "Payment verified successfully");
    } catch (error: any) {
      return sendError(res, error.message || "Payment verification failed", 400);
    }
  }

  /**
   * Razorpay Webhook Handler
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      if (!signature) {
        return sendError(res, "Missing Razorpay webhook signature", 400);
      }

      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const result = await RazorpayService.handleWebhook(rawBody, signature);

      return sendSuccess(res, result, "Webhook processed successfully");
    } catch (error: any) {
      console.error("Razorpay webhook error:", error);
      return sendError(res, error.message || "Webhook processing error", 400);
    }
  }
}


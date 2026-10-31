import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  recordPaymentSchema,
  paymentQuerySchema,
  createRazorpayOrderSchema,
  verifyRazorpayPaymentSchema,
} from "./payments.validation";

const router = Router();

// 1. Public Razorpay Webhook (Signature verified using raw body)
router.post("/razorpay/webhook", PaymentsController.handleWebhook);

// 2. Razorpay Checkout Endpoints (Open to authenticated Customers, Staff, and Admins)
router.post(
  "/razorpay/order",
  authenticate,
  validate({ body: createRazorpayOrderSchema }),
  PaymentsController.createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  authenticate,
  validate({ body: verifyRazorpayPaymentSchema }),
  PaymentsController.verifyRazorpayPayment
);

// 3. Admin & Staff Payment Management
router.get(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ query: paymentQuerySchema }),
  PaymentsController.list
);

router.get(
  "/:id",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  PaymentsController.getById
);

router.post(
  "/",
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: recordPaymentSchema }),
  PaymentsController.record
);

export default router;



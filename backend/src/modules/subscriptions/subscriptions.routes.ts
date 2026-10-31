import { Router } from "express";
import { SubscriptionsController } from "./subscriptions.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  subscriptionQuerySchema,
} from "./subscriptions.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: subscriptionQuerySchema }), SubscriptionsController.list);
router.get("/:id", SubscriptionsController.getById);
router.post("/", validate({ body: createSubscriptionSchema }), SubscriptionsController.create);
router.put("/:id", validate({ body: updateSubscriptionSchema }), SubscriptionsController.update);
router.post("/:id/pause", SubscriptionsController.pause);
router.post("/:id/resume", SubscriptionsController.resume);
router.post("/:id/close", SubscriptionsController.close);
router.post("/:id/generate-invoice", SubscriptionsController.generateInvoice);

export default router;


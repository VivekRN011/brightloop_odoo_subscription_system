import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  recordPaymentSchema,
  paymentQuerySchema,
} from "./payments.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: paymentQuerySchema }), PaymentsController.list);
router.get("/:id", PaymentsController.getById);
router.post("/", validate({ body: recordPaymentSchema }), PaymentsController.record);

export default router;


import { Router } from "express";
import { InvoicesController } from "./invoices.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createInvoiceSchema,
  invoiceQuerySchema,
} from "./invoices.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/overdue", InvoicesController.getOverdue);
router.get("/", validate({ query: invoiceQuerySchema }), InvoicesController.list);
router.get("/:id", InvoicesController.getById);
router.post("/", validate({ body: createInvoiceSchema }), InvoicesController.create);
router.post("/:id/confirm", InvoicesController.confirm);
router.post("/:id/cancel", InvoicesController.cancel);

export default router;


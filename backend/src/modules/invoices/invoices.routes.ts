import { Router } from "express";
import { InvoicesController } from "./invoices.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createInvoiceSchema,
  invoiceQuerySchema,
  generateInvoiceSchema,
  cancelInvoiceSchema,
} from "./invoices.validation";

const router = Router();

// All invoice operations require an authenticated session
router.use(authenticate);

// Staff/Admin overdue list
router.get(
  "/overdue",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InvoicesController.getOverdue
);

// Staff/Admin: List past automated billing runs
router.get(
  "/billing-runs",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InvoicesController.listBillingRuns
);

// Staff/Admin: Trigger manual/immediate billing run batch
router.post(
  "/run-billing",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InvoicesController.triggerBillingRun
);

// List invoices (Admin, Staff, or Customer scoped to own invoices)
router.get(
  "/",
  validate({ query: invoiceQuerySchema }),
  InvoicesController.list
);

// Stream branded GST Tax Invoice PDF (Admin, Staff, or owning Customer)
router.get("/:id/pdf", InvoicesController.streamPdf);

// Get single invoice by ID (Admin, Staff, or Customer scoped to own invoices)
router.get("/:id", InvoicesController.getById);

// Staff/Admin: Generate invoice from due subscription
router.post(
  "/generate/:subscriptionId",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: generateInvoiceSchema }),
  InvoicesController.generateFromSubscription
);

// Staff/Admin: Manual invoice creation
router.post(
  "/",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: createInvoiceSchema }),
  InvoicesController.create
);

// Staff/Admin: Confirm draft invoice (PATCH and POST aliases)
router.patch(
  "/:id/confirm",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InvoicesController.confirm
);
router.post(
  "/:id/confirm",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  InvoicesController.confirm
);

// Staff/Admin: Cancel invoice (PATCH and POST aliases)
router.patch(
  "/:id/cancel",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: cancelInvoiceSchema }),
  InvoicesController.cancel
);
router.post(
  "/:id/cancel",
  requireRole(UserRole.ADMIN, UserRole.STAFF),
  validate({ body: cancelInvoiceSchema }),
  InvoicesController.cancel
);

export default router;

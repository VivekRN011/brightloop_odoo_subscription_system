import { Router } from "express";
import { QuotationsController } from "./quotations.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createQuotationSchema,
  quotationQuerySchema,
  updateQuotationStatusSchema,
  createQuotationTemplateSchema,
} from "./quotations.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

// Templates
router.get("/templates", QuotationsController.listTemplates);
router.post("/templates", validate({ body: createQuotationTemplateSchema }), QuotationsController.createTemplate);

// Quotations
router.get("/", validate({ query: quotationQuerySchema }), QuotationsController.list);
router.get("/:id", QuotationsController.getById);
router.post("/", validate({ body: createQuotationSchema }), QuotationsController.create);
router.patch("/:id/status", validate({ body: updateQuotationStatusSchema }), QuotationsController.updateStatus);
router.post("/:id/convert", QuotationsController.convert);

export default router;


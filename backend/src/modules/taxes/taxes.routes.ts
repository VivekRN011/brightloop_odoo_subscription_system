import { Router } from "express";
import { TaxesController } from "./taxes.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import { createTaxRuleSchema, updateTaxRuleSchema } from "./taxes.validation";

const router = Router();

// Staff and Admin can view tax rules; only admin can create/update
router.use(authenticate);

router.get("/", requireRole(UserRole.ADMIN, UserRole.STAFF), TaxesController.list);
router.post("/", requireRole(UserRole.ADMIN), validate({ body: createTaxRuleSchema }), TaxesController.create);
router.put("/:id", requireRole(UserRole.ADMIN), validate({ body: updateTaxRuleSchema }), TaxesController.update);

export default router;


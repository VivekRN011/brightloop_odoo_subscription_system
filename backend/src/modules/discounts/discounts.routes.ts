import { Router } from "express";
import { DiscountsController } from "./discounts.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createDiscountRuleSchema,
  updateDiscountRuleSchema,
  discountQuerySchema,
} from "./discounts.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: discountQuerySchema }), DiscountsController.list);
router.get("/:id", DiscountsController.getById);
router.post("/", validate({ body: createDiscountRuleSchema }), DiscountsController.create);
router.put("/:id", validate({ body: updateDiscountRuleSchema }), DiscountsController.update);
router.patch("/:id/status", DiscountsController.toggleStatus);

export default router;


import { Router } from "express";
import { PlansController } from "./plans.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createPlanSchema,
  updatePlanSchema,
  planQuerySchema,
} from "./plans.validation";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: planQuerySchema }), PlansController.list);
router.get("/:id", PlansController.getById);
router.post("/", validate({ body: createPlanSchema }), PlansController.create);
router.put("/:id", validate({ body: updatePlanSchema }), PlansController.update);
router.patch("/:id/status", PlansController.toggleStatus);

export default router;


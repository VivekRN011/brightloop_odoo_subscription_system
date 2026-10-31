import { Router } from "express";
import { PlansController } from "./plans.controller";
import { authenticate, optionalAuthenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createPlanSchema,
  updatePlanSchema,
  planQuerySchema,
} from "./plans.validation";

const router = Router();

// Publicly accessible for discovery
router.get("/", optionalAuthenticate, validate({ query: planQuerySchema }), PlansController.list);
router.get("/:id", optionalAuthenticate, PlansController.getById);

// Admin-only plan configuration
router.post("/", authenticate, requireRole(UserRole.ADMIN), validate({ body: createPlanSchema }), PlansController.create);
router.put("/:id", authenticate, requireRole(UserRole.ADMIN), validate({ body: updatePlanSchema }), PlansController.update);
router.patch("/:id/status", authenticate, requireRole(UserRole.ADMIN), PlansController.toggleStatus);

export default router;


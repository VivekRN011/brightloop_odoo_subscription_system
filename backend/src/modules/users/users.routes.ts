import { Router } from "express";
import { UsersController } from "./users.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import { updateUserStatusSchema, userQuerySchema } from "./users.validation";

const router = Router();

// Staff management is admin-only per source requirements
router.use(authenticate, requireRole(UserRole.ADMIN));

router.get("/staff", validate({ query: userQuerySchema }), UsersController.listStaff);
router.patch("/:id/status", validate({ body: updateUserStatusSchema }), UsersController.updateStatus);

export default router;


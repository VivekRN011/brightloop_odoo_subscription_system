import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createStaffSchema,
} from "./auth.validation";

const router = Router();

// Public routes
router.post("/register", validate({ body: registerSchema }), AuthController.register);
router.post("/login", validate({ body: loginSchema }), AuthController.login);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), AuthController.forgotPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), AuthController.resetPassword);

// Authenticated routes
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", AuthController.logout);

// Admin-only route: create staff member (SOURCE constraint: Only admin can add staff)
router.post(
  "/staff",
  authenticate,
  requireRole(UserRole.ADMIN),
  validate({ body: createStaffSchema }),
  AuthController.createStaff
);

export default router;


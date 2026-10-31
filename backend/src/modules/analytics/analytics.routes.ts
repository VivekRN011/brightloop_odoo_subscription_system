import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/dashboard", AnalyticsController.getDashboard);
router.get("/reports", AnalyticsController.getReports);

export default router;


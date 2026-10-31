import { Router } from "express";
import { PortalController } from "./portal.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// Any authenticated user (including CUSTOMER) can access their portal
router.use(authenticate);

router.get("/summary", PortalController.getSummary);
router.post("/subscriptions", PortalController.createSubscription);

export default router;


import { Router } from "express";
import { CustomersController } from "./customers.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from "./customers.validation";

const router = Router();

// Staff and Admin can view and manage customers
router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: customerQuerySchema }), CustomersController.list);
router.get("/:id", CustomersController.getById);
router.post("/", validate({ body: createCustomerSchema }), CustomersController.create);
router.put("/:id", validate({ body: updateCustomerSchema }), CustomersController.update);
router.delete("/:id", CustomersController.archive);

export default router;


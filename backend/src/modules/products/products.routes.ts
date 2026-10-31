import { Router } from "express";
import { ProductsController } from "./products.controller";
import { authenticate, optionalAuthenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { UserRole } from "@prisma/client";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  createVariantSchema,
} from "./products.validation";

const router = Router();

// Publicly accessible for discovery (filtered for customer view in controller)
router.get("/", optionalAuthenticate, validate({ query: productQuerySchema }), ProductsController.list);
router.get("/:id", optionalAuthenticate, ProductsController.getById);

// Staff and Admin only for product & variant management
router.post("/", authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF), validate({ body: createProductSchema }), ProductsController.create);
router.put("/:id", authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF), validate({ body: updateProductSchema }), ProductsController.update);
router.patch("/:id/status", authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF), ProductsController.toggleStatus);

// Variants
router.post("/:id/variants", authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF), validate({ body: createVariantSchema }), ProductsController.addVariant);
router.delete("/:id/variants/:variantId", authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF), ProductsController.deleteVariant);

export default router;


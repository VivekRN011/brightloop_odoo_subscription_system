import { Router } from "express";
import { ProductsController } from "./products.controller";
import { authenticate } from "../../middlewares/auth.middleware";
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

router.use(authenticate, requireRole(UserRole.ADMIN, UserRole.STAFF));

router.get("/", validate({ query: productQuerySchema }), ProductsController.list);
router.get("/:id", ProductsController.getById);
router.post("/", validate({ body: createProductSchema }), ProductsController.create);
router.put("/:id", validate({ body: updateProductSchema }), ProductsController.update);
router.patch("/:id/status", ProductsController.toggleStatus);

// Variants
router.post("/:id/variants", validate({ body: createVariantSchema }), ProductsController.addVariant);
router.delete("/:id/variants/:variantId", ProductsController.deleteVariant);

export default router;


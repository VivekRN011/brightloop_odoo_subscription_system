import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().max(80).optional(),
  name: z.string().min(2, "Product name must be at least 2 characters").max(180),
  productType: z.string().max(60).default("SERVICE"),
  description: z.string().optional(),
  salesPrice: z.coerce.number().min(0, "Sales price cannot be negative"),
  costPrice: z.coerce.number().min(0).optional(),
  currency: z.string().length(3).default("INR"),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
  productType: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createVariantSchema = z.object({
  name: z.string().min(1).max(120),
  value: z.string().min(1).max(120),
  priceAdjustment: z.coerce.number().default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;


import { z } from "zod";
import { DiscountType, DiscountScope } from "@prisma/client";

export const createDiscountRuleSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(60).optional().nullable(),
  discountType: z.nativeEnum(DiscountType),
  scope: z.nativeEnum(DiscountScope).default(DiscountScope.BOTH),
  fixedAmount: z.coerce.number().min(0).optional().nullable(),
  percentageValue: z.coerce.number().min(0).max(100).optional().nullable(),
  minimumPurchase: z.coerce.number().min(0).optional().nullable(),
  minimumQuantity: z.coerce.number().min(0).optional().nullable(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional().nullable(),
  usageLimit: z.coerce.number().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateDiscountRuleSchema = createDiscountRuleSchema.partial();

export const discountQuerySchema = z.object({
  search: z.string().optional(),
  discountType: z.nativeEnum(DiscountType).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateDiscountRuleInput = z.infer<typeof createDiscountRuleSchema>;
export type UpdateDiscountRuleInput = z.infer<typeof updateDiscountRuleSchema>;
export type DiscountQueryInput = z.infer<typeof discountQuerySchema>;


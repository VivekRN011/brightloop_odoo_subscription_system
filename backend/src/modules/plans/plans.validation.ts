import { z } from "zod";
import { BillingFrequency } from "@prisma/client";

export const createPlanSchema = z.object({
  code: z.string().min(2).max(60),
  name: z.string().min(2).max(180),
  description: z.string().optional(),
  billingFrequency: z.nativeEnum(BillingFrequency),
  intervalCount: z.coerce.number().min(1).default(1),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().length(3).default("INR"),
  minimumQuantity: z.coerce.number().min(1).default(1),
  availableFrom: z.string().datetime().optional().nullable(),
  availableUntil: z.string().datetime().optional().nullable(),
  autoCloseAtEnd: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenewal: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial();

export const planQuerySchema = z.object({
  search: z.string().optional(),
  billingFrequency: z.nativeEnum(BillingFrequency).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanQueryInput = z.infer<typeof planQuerySchema>;


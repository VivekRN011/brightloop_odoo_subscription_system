import { z } from "zod";
import { BillingFrequency, SubscriptionStatus } from "@prisma/client";

export const subscriptionLineSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  planId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(300),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  variantSnapshot: z.any().optional(),
});

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  planId: z.string().uuid().optional().nullable(),
  quotationId: z.string().uuid().optional().nullable(),
  startAt: z.string().datetime().optional(),
  billingFrequency: z.nativeEnum(BillingFrequency),
  intervalCount: z.coerce.number().min(1).default(1),
  quantity: z.coerce.number().min(1).default(1),
  currency: z.string().length(3).default("INR"),
  paymentTermsDays: z.coerce.number().min(0).default(15),
  autoCloseAtEnd: z.boolean().default(false),
  allowEarlyClose: z.boolean().default(true),
  allowPause: z.boolean().default(true),
  allowRenewal: z.boolean().default(true),
  lines: z.array(subscriptionLineSchema).min(1, "Subscription must have at least one product or plan line"),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional().nullable(),
  endAt: z.string().datetime().optional().nullable(),
  nextBillingAt: z.string().datetime().optional().nullable(),
  paymentTermsDays: z.coerce.number().min(0).optional(),
  autoCloseAtEnd: z.boolean().optional(),
  allowEarlyClose: z.boolean().optional(),
  allowPause: z.boolean().optional(),
  allowRenewal: z.boolean().optional(),
});

export const subscriptionQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(SubscriptionStatus).optional(),
  planId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;


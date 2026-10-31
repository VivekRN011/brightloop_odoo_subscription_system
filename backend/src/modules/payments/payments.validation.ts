import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const paymentAllocationSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().min(0.01),
});

export const recordPaymentSchema = z.object({
  customerId: z.string().uuid(),
  method: z.nativeEnum(PaymentMethod),
  amount: z.coerce.number().min(0.01, "Payment amount must be greater than 0"),
  currency: z.string().length(3).default("INR"),
  paidAt: z.string().datetime().optional(),
  reference: z.string().max(120).optional(),
  note: z.string().optional(),
  allocations: z.array(paymentAllocationSchema).optional().default([]),
});

export const paymentQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;


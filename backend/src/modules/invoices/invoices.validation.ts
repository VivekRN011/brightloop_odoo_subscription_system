import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

export const invoiceLineSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(300),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional().nullable(),
  issueDate: z.string().datetime().optional(),
  dueDate: z.string().datetime(),
  billingPeriodStart: z.string().datetime().optional().nullable(),
  billingPeriodEnd: z.string().datetime().optional().nullable(),
  currency: z.string().length(3).default("INR"),
  discountTotal: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "Invoice must contain at least one line item"),
});

export const invoiceQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  subscriptionId: z.string().uuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;


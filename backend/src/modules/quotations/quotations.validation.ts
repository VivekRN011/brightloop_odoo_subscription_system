import { z } from "zod";
import { QuotationStatus } from "@prisma/client";

export const quotationLineSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  planId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(300),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  variantSnapshot: z.any().optional(),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const createQuotationSchema = z.object({
  customerId: z.string().uuid(),
  templateId: z.string().uuid().optional().nullable(),
  validUntil: z.string().datetime(),
  currency: z.string().length(3).default("INR"),
  discountTotal: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  lines: z.array(quotationLineSchema).min(1, "Quotation must have at least one line item"),
});

export const quotationQuerySchema = z.object({
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  status: z.nativeEnum(QuotationStatus).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const updateQuotationStatusSchema = z.object({
  status: z.nativeEnum(QuotationStatus),
});

export const createQuotationTemplateSchema = z.object({
  name: z.string().min(2).max(180),
  description: z.string().optional(),
  validityDays: z.coerce.number().min(1).default(30),
  isActive: z.boolean().default(true),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type QuotationQueryInput = z.infer<typeof quotationQuerySchema>;
export type CreateQuotationTemplateInput = z.infer<typeof createQuotationTemplateSchema>;


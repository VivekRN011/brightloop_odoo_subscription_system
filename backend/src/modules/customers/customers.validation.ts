import { z } from "zod";

export const createCustomerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(180),
  companyName: z.string().max(180).optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().max(30).optional(),
  billingAddressLine1: z.string().max(200).optional(),
  billingAddressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  taxIdentifier: z.string().max(80).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;


import { z } from "zod";

export const createTaxRuleSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(40),
  rate: z.coerce.number().min(0).max(100),
  isActive: z.boolean().default(true),
});

export const updateTaxRuleSchema = createTaxRuleSchema.partial();

export type CreateTaxRuleInput = z.infer<typeof createTaxRuleSchema>;
export type UpdateTaxRuleInput = z.infer<typeof updateTaxRuleSchema>;


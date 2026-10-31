import { prisma } from "../../config/prisma";
import { CreateTaxRuleInput, UpdateTaxRuleInput } from "./taxes.validation";

export class TaxesService {
  static async listTaxRules() {
    return await prisma.taxRule.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTaxRule(input: CreateTaxRuleInput, actorUserId: string) {
    const existing = await prisma.taxRule.findUnique({ where: { code: input.code } });
    if (existing) {
      throw new Error(`Tax rule with code "${input.code}" already exists.`);
    }

    return await prisma.$transaction(async (tx) => {
      const tax = await tx.taxRule.create({
        data: {
          name: input.name,
          code: input.code,
          rate: input.rate,
          isActive: input.isActive,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CREATE_TAX_RULE",
          entityType: "TaxRule",
          entityId: tax.id,
          summary: `Created tax rule ${tax.name} (${tax.rate}%)`,
        },
      });

      return tax;
    });
  }

  static async updateTaxRule(id: string, input: UpdateTaxRuleInput, actorUserId: string) {
    const existing = await prisma.taxRule.findUnique({ where: { id } });
    if (!existing) throw new Error("Tax rule not found");

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.taxRule.update({
        where: { id },
        data: input,
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "UPDATE_TAX_RULE",
          entityType: "TaxRule",
          entityId: id,
          summary: `Updated tax rule ${updated.name}`,
        },
      });

      return updated;
    });
  }
}


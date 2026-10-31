import { prisma } from "../../config/prisma";
import {
  CreateDiscountRuleInput,
  UpdateDiscountRuleInput,
  DiscountQueryInput,
} from "./discounts.validation";
import { Prisma } from "@prisma/client";

export class DiscountsService {
  static async listDiscounts(query: DiscountQueryInput) {
    const { search, discountType, isActive, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DiscountRuleWhereInput = {
      ...(discountType && { discountType }),
      ...(isActive !== undefined && { isActive: isActive === "true" }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.discountRule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: { id: true, email: true },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.discountRule.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDiscountById(id: string) {
    const discount = await prisma.discountRule.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, email: true },
        },
        applications: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            quotation: {
              select: { id: true, quotationNumber: true },
            },
            invoice: {
              select: { id: true, invoiceNumber: true },
            },
          },
        },
      },
    });

    if (!discount) {
      throw new Error("Discount rule not found");
    }

    return discount;
  }

  static async createDiscount(input: CreateDiscountRuleInput, actorUserId: string) {
    return await prisma.$transaction(async (tx) => {
      const discount = await tx.discountRule.create({
        data: {
          name: input.name,
          code: input.code || null,
          discountType: input.discountType,
          scope: input.scope,
          fixedAmount: input.fixedAmount || null,
          percentageValue: input.percentageValue || null,
          minimumPurchase: input.minimumPurchase || null,
          minimumQuantity: input.minimumQuantity || null,
          startsAt: input.startsAt ? new Date(input.startsAt) : new Date(),
          endsAt: input.endsAt ? new Date(input.endsAt) : null,
          usageLimit: input.usageLimit || null,
          isActive: input.isActive,
          createdById: actorUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CREATE_DISCOUNT_RULE",
          entityType: "DiscountRule",
          entityId: discount.id,
          summary: `Created discount rule ${discount.name} (${discount.code || "No code"})`,
        },
      });

      return discount;
    });
  }

  static async updateDiscount(id: string, input: UpdateDiscountRuleInput, actorUserId: string) {
    const existing = await prisma.discountRule.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Discount rule not found");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.discountRule.update({
        where: { id },
        data: {
          ...input,
          startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
          endsAt: input.endsAt !== undefined ? (input.endsAt ? new Date(input.endsAt) : null) : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "UPDATE_DISCOUNT_RULE",
          entityType: "DiscountRule",
          entityId: id,
          summary: `Updated discount rule ${updated.name}`,
        },
      });

      return updated;
    });
  }

  static async toggleDiscountStatus(id: string, actorUserId: string) {
    const existing = await prisma.discountRule.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Discount rule not found");
    }

    const newStatus = !existing.isActive;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.discountRule.update({
        where: { id },
        data: { isActive: newStatus },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "TOGGLE_DISCOUNT_STATUS",
          entityType: "DiscountRule",
          entityId: id,
          summary: `${newStatus ? "Activated" : "Deactivated"} discount rule ${existing.name}`,
        },
      });

      return updated;
    });
  }
}


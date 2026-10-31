import { prisma } from "../../config/prisma";
import {
  CreatePlanInput,
  UpdatePlanInput,
  PlanQueryInput,
} from "./plans.validation";
import { Prisma } from "@prisma/client";

export class PlansService {
  static async listPlans(query: PlanQueryInput) {
    const { search, billingFrequency, isActive, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionPlanWhereInput = {
      archivedAt: null,
      ...(billingFrequency && { billingFrequency }),
      ...(isActive !== undefined && { isActive: isActive === "true" }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ billingFrequency: "asc" }, { price: "asc" }],
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
      }),
      prisma.subscriptionPlan.count({ where }),
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

  static async getPlanById(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!plan || plan.archivedAt) {
      throw new Error("Plan not found");
    }

    return plan;
  }

  static async createPlan(input: CreatePlanInput, actorUserId?: string) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { code: input.code },
    });
    if (existing) {
      throw new Error(`A plan with code "${input.code}" already exists.`);
    }

    return await prisma.$transaction(async (tx) => {
      const plan = await tx.subscriptionPlan.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          billingFrequency: input.billingFrequency,
          intervalCount: input.intervalCount,
          price: input.price,
          currency: input.currency,
          minimumQuantity: input.minimumQuantity,
          availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
          availableUntil: input.availableUntil ? new Date(input.availableUntil) : null,
          autoCloseAtEnd: input.autoCloseAtEnd,
          allowEarlyClose: input.allowEarlyClose,
          allowPause: input.allowPause,
          allowRenewal: input.allowRenewal,
          isActive: input.isActive,
        },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "CREATE_PLAN",
            entityType: "SubscriptionPlan",
            entityId: plan.id,
            summary: `Created subscription plan ${plan.name} (${plan.code})`,
          },
        });
      }

      return plan;
    });
  }

  static async updatePlan(id: string, input: UpdatePlanInput, actorUserId?: string) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Plan not found");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscriptionPlan.update({
        where: { id },
        data: {
          ...input,
          availableFrom:
            input.availableFrom !== undefined
              ? input.availableFrom
                ? new Date(input.availableFrom)
                : null
              : undefined,
          availableUntil:
            input.availableUntil !== undefined
              ? input.availableUntil
                ? new Date(input.availableUntil)
                : null
              : undefined,
        },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "UPDATE_PLAN",
            entityType: "SubscriptionPlan",
            entityId: id,
            summary: `Updated subscription plan ${updated.name}`,
          },
        });
      }

      return updated;
    });
  }

  static async togglePlanStatus(id: string, actorUserId?: string) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing || existing.archivedAt) {
      throw new Error("Plan not found");
    }

    const newStatus = !existing.isActive;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscriptionPlan.update({
        where: { id },
        data: { isActive: newStatus },
      });

      if (actorUserId) {
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: "TOGGLE_PLAN_STATUS",
            entityType: "SubscriptionPlan",
            entityId: id,
            summary: `${newStatus ? "Activated" : "Deactivated"} plan ${existing.name}`,
          },
        });
      }

      return updated;
    });
  }
}


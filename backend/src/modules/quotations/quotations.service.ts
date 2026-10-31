import { prisma } from "../../config/prisma";
import { generateQuotationNumber, generateSubscriptionNumber } from "../../utils/code-generator";
import {
  CreateQuotationInput,
  QuotationQueryInput,
  CreateQuotationTemplateInput,
} from "./quotations.validation";
import { Prisma, QuotationStatus, SubscriptionStatus, BillingFrequency } from "@prisma/client";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

export class QuotationsService {
  static async listQuotations(query: QuotationQueryInput) {
    const { search, customerId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { quotationNumber: { contains: search, mode: "insensitive" } },
          { customer: { displayName: { contains: search, mode: "insensitive" } } },
          { customer: { companyName: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              displayName: true,
              companyName: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: { lines: true },
          },
        },
      }),
      prisma.quotation.count({ where }),
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

  static async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        template: true,
        createdBy: {
          select: { id: true, email: true },
        },
        lines: {
          include: {
            product: true,
            plan: true,
          },
        },
        convertedSubscription: {
          select: {
            id: true,
            subscriptionNumber: true,
            status: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    return quotation;
  }

  static async createQuotation(input: CreateQuotationInput, actorUserId: string) {
    const quotationNumber = generateQuotationNumber();

    // Calculate line subtotals, tax, grand total
    let subtotal = 0;
    let taxTotal = 0;

    const processedLines = input.lines.map((line) => {
      const lineSubtotal = Number(line.quantity) * Number(line.unitPrice);
      const lineTax = (lineSubtotal * Number(line.taxRate || 0)) / 100;
      subtotal += lineSubtotal;
      taxTotal += lineTax;

      return {
        productId: line.productId || null,
        planId: line.planId || null,
        descriptionSnapshot: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        variantSnapshot: line.variantSnapshot || Prisma.JsonNull,
        taxSnapshot: line.taxRate ? { rate: line.taxRate } : Prisma.JsonNull,
        lineSubtotal,
      };
    });

    const discountTotal = Number(input.discountTotal || 0);
    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);

    return await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId: input.customerId,
          templateId: input.templateId || null,
          status: QuotationStatus.DRAFT,
          validUntil: new Date(input.validUntil),
          currency: input.currency,
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
          notes: input.notes,
          createdById: actorUserId,
          lines: {
            create: processedLines,
          },
        },
        include: {
          lines: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CREATE_QUOTATION",
          entityType: "Quotation",
          entityId: quotation.id,
          summary: `Created quotation ${quotation.quotationNumber} for customer ${quotation.customerId}`,
        },
      });

      return quotation;
    });
  }

  static async updateStatus(id: string, status: QuotationStatus, actorUserId: string) {
    const existing = await prisma.quotation.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Quotation not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.update({
        where: { id },
        data: {
          status,
          ...(status === QuotationStatus.SENT && !existing.issuedAt ? { issuedAt: new Date() } : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "UPDATE_QUOTATION_STATUS",
          entityType: "Quotation",
          entityId: id,
          summary: `Changed quotation ${existing.quotationNumber} status to ${status}`,
        },
      });

      return q;
    });

    return updated;
  }

  static async convertToSubscription(id: string, actorUserId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        lines: {
          include: { plan: true },
        },
      },
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Idempotent guard: if already converted, return the existing subscription safely
    if (quotation.status === QuotationStatus.CONVERTED && quotation.convertedSubscriptionId) {
      const existingSub = await prisma.subscription.findUnique({
        where: { id: quotation.convertedSubscriptionId },
        include: { lines: true },
      });
      if (existingSub) {
        return existingSub;
      }
    }

    // Find any line with a subscription plan
    const planLine = quotation.lines.find((l) => l.planId);
    let planId: string | null = planLine?.planId || null;
    let frequency: BillingFrequency = planLine?.plan?.billingFrequency || BillingFrequency.MONTHLY;

    const subscriptionNumber = generateSubscriptionNumber();
    const now = new Date();
    // Calculate calendar-accurate next billing date
    const nextBilling = SubscriptionsService.calculateNextBillingDate(now, frequency, 1);

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: quotation.customerId,
          planId,
          quotationId: quotation.id,
          status: SubscriptionStatus.CONFIRMED,
          startAt: now,
          nextBillingAt: nextBilling,
          billingFrequency: frequency,
          intervalCount: 1,
          currency: quotation.currency,
          createdById: actorUserId,
          lines: {
            create: quotation.lines.map((ql) => ({
              productId: ql.productId,
              planId: ql.planId,
              descriptionSnapshot: ql.descriptionSnapshot,
              quantity: ql.quantity,
              unitPrice: ql.unitPrice,
              variantSnapshot: ql.variantSnapshot ?? Prisma.JsonNull,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.quotation.update({
        where: { id },
        data: {
          status: QuotationStatus.CONVERTED,
          convertedSubscriptionId: subscription.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CONVERT_QUOTATION_TO_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: subscription.id,
          summary: `Converted quotation ${quotation.quotationNumber} to subscription ${subscription.subscriptionNumber}`,
        },
      });

      return subscription;
    });
  }

  // Template methods
  static async listTemplates() {
    return await prisma.quotationTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTemplate(input: CreateQuotationTemplateInput, actorUserId: string) {
    return await prisma.quotationTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        validityDays: input.validityDays,
        isActive: input.isActive,
        createdById: actorUserId,
      },
    });
  }
}


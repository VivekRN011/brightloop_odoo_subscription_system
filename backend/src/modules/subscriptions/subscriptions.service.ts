import { prisma } from "../../config/prisma";
import { generateSubscriptionNumber, generateInvoiceNumber } from "../../utils/code-generator";
import { BillingCalculationService } from "../../services/billing-calculation.service";
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionQueryInput,
} from "./subscriptions.validation";
import {
  Prisma,
  SubscriptionStatus,
  InvoiceStatus,
  BillingFrequency,
  BillingAttemptStatus,
} from "@prisma/client";

export class SubscriptionsService {
  /**
   * Calendar-aware next billing date calculation that preserves month-end boundaries
   */
  static calculateNextBillingDate(baseDate: Date, frequency: BillingFrequency, intervalCount: number = 1): Date {
    const next = new Date(baseDate);
    if (frequency === BillingFrequency.DAILY) {
      next.setDate(next.getDate() + intervalCount);
    } else if (frequency === BillingFrequency.WEEKLY) {
      next.setDate(next.getDate() + 7 * intervalCount);
    } else if (frequency === BillingFrequency.MONTHLY) {
      const originalDay = baseDate.getDate();
      next.setMonth(next.getMonth() + intervalCount);
      // If month wrapped (e.g. Jan 31 -> Feb 28), set to last day of target month
      if (next.getDate() !== originalDay) {
        next.setDate(0);
      }
    } else if (frequency === BillingFrequency.YEARLY) {
      const originalMonth = baseDate.getMonth();
      next.setFullYear(next.getFullYear() + intervalCount);
      if (next.getMonth() !== originalMonth) {
        next.setDate(0);
      }
    }
    return next;
  }

  static async listSubscriptions(query: SubscriptionQueryInput) {
    const { search, customerId, status, planId, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(planId && { planId }),
      ...(search && {
        OR: [
          { subscriptionNumber: { contains: search, mode: "insensitive" } },
          { customer: { displayName: { contains: search, mode: "insensitive" } } },
          { customer: { companyName: { contains: search, mode: "insensitive" } } },
          { plan: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.subscription.findMany({
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
          plan: {
            select: {
              id: true,
              code: true,
              name: true,
              price: true,
              billingFrequency: true,
            },
          },
          _count: {
            select: {
              invoices: true,
              lines: true,
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
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

  static async getSubscriptionById(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        quotation: true,
        createdBy: {
          select: { id: true, email: true },
        },
        lines: {
          include: {
            product: true,
            plan: true,
          },
        },
        invoices: {
          orderBy: { issueDate: "desc" },
          include: {
            allocations: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return subscription;
  }

  static async createSubscription(input: CreateSubscriptionInput, actorUserId: string) {
    const startAt = input.startAt ? new Date(input.startAt) : new Date();

    // 1. Validate Customer
    const customer = await prisma.customerProfile.findUnique({
      where: { id: input.customerId },
    });
    if (!customer || customer.archivedAt) {
      throw new Error("Customer profile does not exist or has been archived.");
    }

    // 2. Validate Plan if provided
    let plan = null;
    if (input.planId) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: input.planId },
      });
      if (!plan || !plan.isActive || plan.archivedAt) {
        throw new Error("Selected subscription plan is inactive or unavailable.");
      }
      if (plan.availableFrom && startAt < plan.availableFrom) {
        throw new Error("Selected plan is not yet available on the subscription start date.");
      }
      if (plan.availableUntil && startAt > plan.availableUntil) {
        throw new Error("Selected plan has expired and is not available on the subscription start date.");
      }
      if (Number(input.quantity) < Number(plan.minimumQuantity)) {
        throw new Error(`Quantity (${input.quantity}) must be at least the plan minimum (${plan.minimumQuantity}).`);
      }
    }

    // 3. Validate Products in lines
    for (const line of input.lines) {
      if (line.productId) {
        const prod = await prisma.product.findUnique({
          where: { id: line.productId },
        });
        if (!prod || !prod.isActive || prod.archivedAt) {
          throw new Error(`Product ${line.description} is inactive or has been archived.`);
        }
      }
    }

    const subscriptionNumber = generateSubscriptionNumber();
    const nextBillingAt = this.calculateNextBillingDate(startAt, input.billingFrequency, input.intervalCount);

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber,
          customerId: input.customerId,
          planId: input.planId || null,
          quotationId: input.quotationId || null,
          status: SubscriptionStatus.ACTIVE,
          startAt,
          nextBillingAt,
          billingFrequency: input.billingFrequency,
          intervalCount: input.intervalCount,
          quantity: input.quantity,
          currency: input.currency,
          paymentTermsDays: input.paymentTermsDays,
          autoCloseAtEnd: plan?.autoCloseAtEnd ?? input.autoCloseAtEnd,
          allowEarlyClose: plan?.allowEarlyClose ?? input.allowEarlyClose,
          allowPause: plan?.allowPause ?? input.allowPause,
          allowRenewal: plan?.allowRenewal ?? input.allowRenewal,
          createdById: actorUserId,
          lines: {
            create: input.lines.map((line) => ({
              productId: line.productId || null,
              planId: line.planId || null,
              descriptionSnapshot: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              variantSnapshot: line.variantSnapshot ?? Prisma.JsonNull,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CREATE_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: subscription.id,
          summary: `Created active subscription ${subscription.subscriptionNumber}`,
        },
      });

      return subscription;
    });
  }

  static async updateSubscription(id: string, input: UpdateSubscriptionInput, actorUserId: string) {
    const existing = await prisma.subscription.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("Subscription not found");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          planId: input.planId,
          endAt: input.endAt !== undefined ? (input.endAt ? new Date(input.endAt) : null) : undefined,
          nextBillingAt:
            input.nextBillingAt !== undefined
              ? input.nextBillingAt
                ? new Date(input.nextBillingAt)
                : null
              : undefined,
          paymentTermsDays: input.paymentTermsDays,
          autoCloseAtEnd: input.autoCloseAtEnd,
          allowEarlyClose: input.allowEarlyClose,
          allowPause: input.allowPause,
          allowRenewal: input.allowRenewal,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "UPDATE_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: id,
          summary: `Updated subscription ${existing.subscriptionNumber}`,
        },
      });

      return updated;
    });
  }

  static async pauseSubscription(id: string, actorUserId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error("Subscription not found");
    if (!sub.allowPause) throw new Error("This subscription does not allow pausing.");
    if (sub.status !== SubscriptionStatus.ACTIVE) {
      throw new Error(`Only active subscriptions can be paused (current: ${sub.status})`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.PAUSED,
          pausedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "PAUSE_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: id,
          summary: `Paused subscription ${sub.subscriptionNumber}`,
        },
      });

      return updated;
    });
  }

  static async resumeSubscription(id: string, actorUserId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error("Subscription not found");
    if (sub.status !== SubscriptionStatus.PAUSED && sub.status !== SubscriptionStatus.CONFIRMED && sub.status !== SubscriptionStatus.DRAFT) {
      throw new Error(`Cannot activate subscription in status ${sub.status}`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          pausedAt: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "RESUME_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: id,
          summary: `Activated subscription ${sub.subscriptionNumber}`,
        },
      });

      return updated;
    });
  }

  static async closeSubscription(id: string, actorUserId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error("Subscription not found");
    if (sub.status === SubscriptionStatus.CLOSED) {
      throw new Error("Subscription is already closed.");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CLOSED,
          closedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CLOSE_SUBSCRIPTION",
          entityType: "Subscription",
          entityId: id,
          summary: `Closed subscription ${sub.subscriptionNumber}`,
        },
      });

      return updated;
    });
  }

  /**
   * Idempotent invoice generation for a subscription billing period.
   * Enforces duplicate billing prevention via BillingAttempt idempotencyKey.
   * Authoritatively computes dual GST (18%) and snapshots all lines.
   */
  static async generateInvoice(id: string, actorUserId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: {
        lines: true,
        customer: true,
      },
    });

    if (!sub) throw new Error("Subscription not found");
    if (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.CONFIRMED) {
      throw new Error(`Cannot generate invoice for subscription in status: ${sub.status}`);
    }

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + (sub.paymentTermsDays || 15));

    const periodStart = sub.lastBilledAt || sub.startAt;
    const periodEnd = sub.nextBillingAt || issueDate;

    // Idempotency guard: format deterministic key
    const idempotencyKey = `sub_${sub.id}_${periodStart.toISOString().slice(0, 10)}_${periodEnd.toISOString().slice(0, 10)}`;

    // Check if an attempt for this period already succeeded
    const existingAttempt = await prisma.billingAttempt.findUnique({
      where: { idempotencyKey },
      include: {
        invoice: {
          include: { lines: true, allocations: true },
        },
      },
    });

    if (existingAttempt && existingAttempt.status === BillingAttemptStatus.SUCCEEDED && existingAttempt.invoice) {
      // Duplicate invoice prevented!
      return existingAttempt.invoice;
    }

    // Prepare lines for BillingCalculationService
    const calcLines = sub.lines.map((sl) => ({
      productId: sl.productId,
      planId: sl.planId,
      description: sl.descriptionSnapshot,
      quantity: Number(sl.quantity),
      unitPrice: Number(sl.unitPrice),
      variantSnapshot: sl.variantSnapshot,
    }));

    const calcResult = await BillingCalculationService.calculateDocument({
      lines: calcLines,
      customerState: sub.customer?.state,
    });

    const invoiceNumber = generateInvoiceNumber();
    const nextBillingAt = this.calculateNextBillingDate(periodEnd, sub.billingFrequency, sub.intervalCount);

    return await prisma.$transaction(async (tx) => {
      // Find or create an open BillingRun
      let billingRun = await tx.billingRun.findFirst({
        where: { status: "RUNNING" },
      });
      if (!billingRun) {
        billingRun = await tx.billingRun.create({
          data: {
            runKey: `MANUAL_RUN_${Date.now()}`,
            triggeredBy: "USER_ACTION",
            status: "RUNNING",
          },
        });
      }

      // Create the Invoice with dual GST snapshots
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          status: InvoiceStatus.CONFIRMED,
          issueDate,
          dueDate,
          billingPeriodStart: periodStart,
          billingPeriodEnd: periodEnd,
          currency: sub.currency,
          subtotal: calcResult.subtotal,
          discountTotal: calcResult.discountTotal,
          taxTotal: calcResult.taxTotal,
          grandTotal: calcResult.grandTotal,
          confirmedAt: issueDate,
          lines: {
            create: calcResult.lines.map((cl, idx) => ({
              productId: cl.productId,
              subscriptionLineId: sub.lines[idx]?.id || null,
              descriptionSnapshot: cl.descriptionSnapshot,
              quantity: cl.quantity,
              unitPrice: cl.unitPrice,
              taxableAmount: cl.taxableAmount,
              taxAmount: cl.taxAmount,
              discountAmount: cl.discountAmount,
              lineTotal: cl.lineTotal,
              taxSnapshot: cl.taxSnapshot,
              variantSnapshot: cl.variantSnapshot,
            })),
          },
        },
        include: { lines: true },
      });

      // Persist or update BillingAttempt to prevent duplicate billing
      await tx.billingAttempt.upsert({
        where: { idempotencyKey },
        create: {
          billingRunId: billingRun.id,
          subscriptionId: sub.id,
          invoiceId: invoice.id,
          idempotencyKey,
          periodStart,
          periodEnd,
          status: BillingAttemptStatus.SUCCEEDED,
          finishedAt: new Date(),
        },
        update: {
          invoiceId: invoice.id,
          status: BillingAttemptStatus.SUCCEEDED,
          finishedAt: new Date(),
        },
      });

      // Advance schedule
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          lastBilledAt: issueDate,
          nextBillingAt,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "GENERATE_SUBSCRIPTION_INVOICE",
          entityType: "Invoice",
          entityId: invoice.id,
          summary: `Generated invoice ${invoice.invoiceNumber} for subscription ${sub.subscriptionNumber} (${calcResult.grandTotal} INR)`,
        },
      });

      return invoice;
    });
  }
}



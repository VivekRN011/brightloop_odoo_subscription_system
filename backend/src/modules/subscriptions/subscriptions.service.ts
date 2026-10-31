import { prisma } from "../../config/prisma";
import { generateSubscriptionNumber, generateInvoiceNumber } from "../../utils/code-generator";
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
} from "@prisma/client";

export class SubscriptionsService {
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
    const subscriptionNumber = generateSubscriptionNumber();
    const startAt = input.startAt ? new Date(input.startAt) : new Date();

    // Calculate next billing date based on frequency
    const nextBillingAt = new Date(startAt);
    if (input.billingFrequency === BillingFrequency.DAILY) {
      nextBillingAt.setDate(nextBillingAt.getDate() + input.intervalCount);
    } else if (input.billingFrequency === BillingFrequency.WEEKLY) {
      nextBillingAt.setDate(nextBillingAt.getDate() + 7 * input.intervalCount);
    } else if (input.billingFrequency === BillingFrequency.MONTHLY) {
      nextBillingAt.setMonth(nextBillingAt.getMonth() + input.intervalCount);
    } else if (input.billingFrequency === BillingFrequency.YEARLY) {
      nextBillingAt.setFullYear(nextBillingAt.getFullYear() + input.intervalCount);
    }

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
          autoCloseAtEnd: input.autoCloseAtEnd,
          allowEarlyClose: input.allowEarlyClose,
          allowPause: input.allowPause,
          allowRenewal: input.allowRenewal,
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

    const invoiceNumber = generateInvoiceNumber();
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + (sub.paymentTermsDays || 15));

    // Calculate totals from subscription lines
    let subtotal = 0;
    const invoiceLinesData = sub.lines.map((sl) => {
      const lineSub = Number(sl.quantity) * Number(sl.unitPrice);
      subtotal += lineSub;
      return {
        productId: sl.productId,
        subscriptionLineId: sl.id,
        descriptionSnapshot: sl.descriptionSnapshot,
        quantity: sl.quantity,
        unitPrice: sl.unitPrice,
        taxableAmount: lineSub,
        taxAmount: 0,
        lineTotal: lineSub,
      };
    });

    const grandTotal = subtotal;

    // Advance next billing date
    const nextBillingAt = sub.nextBillingAt ? new Date(sub.nextBillingAt) : new Date();
    if (sub.billingFrequency === BillingFrequency.DAILY) {
      nextBillingAt.setDate(nextBillingAt.getDate() + sub.intervalCount);
    } else if (sub.billingFrequency === BillingFrequency.WEEKLY) {
      nextBillingAt.setDate(nextBillingAt.getDate() + 7 * sub.intervalCount);
    } else if (sub.billingFrequency === BillingFrequency.MONTHLY) {
      nextBillingAt.setMonth(nextBillingAt.getMonth() + sub.intervalCount);
    } else if (sub.billingFrequency === BillingFrequency.YEARLY) {
      nextBillingAt.setFullYear(nextBillingAt.getFullYear() + sub.intervalCount);
    }

    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: sub.customerId,
          subscriptionId: sub.id,
          status: InvoiceStatus.CONFIRMED,
          issueDate,
          dueDate,
          billingPeriodStart: sub.lastBilledAt || sub.startAt,
          billingPeriodEnd: issueDate,
          currency: sub.currency,
          subtotal,
          discountTotal: 0,
          taxTotal: 0,
          grandTotal,
          confirmedAt: issueDate,
          lines: {
            create: invoiceLinesData,
          },
        },
        include: { lines: true },
      });

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
          summary: `Generated invoice ${invoice.invoiceNumber} for subscription ${sub.subscriptionNumber}`,
        },
      });

      return invoice;
    });
  }
}


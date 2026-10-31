import { prisma } from "../../config/prisma";
import { generateInvoiceNumber } from "../../utils/code-generator";
import {
  CreateInvoiceInput,
  InvoiceQueryInput,
  GenerateInvoiceInput,
} from "./invoices.validation";
import {
  Prisma,
  InvoiceStatus,
  BillingFrequency,
  SubscriptionStatus,
} from "@prisma/client";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

export class InvoicesService {
  /**
   * Helper to normalize tax multiplier whether stored as 0.18 or 18.0
   */
  private static getTaxMultiplier(rate: number): number {
    if (rate <= 0) return 0;
    return rate > 1 ? rate / 100 : rate;
  }

  /**
   * List invoices with filtering, pagination, and calculated payment balances.
   * If customerScopeId is provided, restricts results to that customer.
   */
  static async listInvoices(
    query: InvoiceQueryInput,
    customerScopeId?: string
  ) {
    const { search, customerId, subscriptionId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const effectiveCustomerId = customerScopeId || customerId;

    const where: Prisma.InvoiceWhereInput = {
      ...(effectiveCustomerId && { customerId: effectiveCustomerId }),
      ...(subscriptionId && { subscriptionId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: "insensitive" } },
          { customer: { displayName: { contains: search, mode: "insensitive" } } },
          { customer: { companyName: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [rawInvoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issueDate: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              displayName: true,
              companyName: true,
            },
          },
          subscription: {
            select: {
              id: true,
              subscriptionNumber: true,
            },
          },
          allocations: {
            select: {
              allocatedAmount: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    // Compute paid amount and outstanding balance for each invoice
    const items = rawInvoices.map((inv) => {
      const paidAmount = inv.allocations.reduce(
        (sum, a) => sum + Number(a.allocatedAmount),
        0
      );
      const outstandingAmount = Math.max(0, Number(inv.grandTotal) - paidAmount);
      return {
        ...inv,
        paidAmount,
        outstandingAmount,
      };
    });

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

  /**
   * Get overdue invoices with remaining balance.
   */
  static async getOverdueInvoices(customerScopeId?: string) {
    const now = new Date();

    const rawInvoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.CONFIRMED,
        dueDate: { lt: now },
        ...(customerScopeId && { customerId: customerScopeId }),
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            displayName: true,
            companyName: true,
            phone: true,
          },
        },
        allocations: {
          select: {
            allocatedAmount: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return rawInvoices
      .map((inv) => {
        const paidAmount = inv.allocations.reduce(
          (sum, a) => sum + Number(a.allocatedAmount),
          0
        );
        const outstandingAmount = Math.max(0, Number(inv.grandTotal) - paidAmount);
        return {
          ...inv,
          paidAmount,
          outstandingAmount,
        };
      })
      .filter((inv) => inv.outstandingAmount > 0);
  }

  /**
   * Get a single invoice by ID with all lines and allocations.
   */
  static async getInvoiceById(id: string, customerScopeId?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        subscription: true,
        lines: {
          include: {
            product: true,
          },
        },
        allocations: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (customerScopeId && invoice.customerId !== customerScopeId) {
      throw new Error("Access denied: You do not have permission to view this invoice");
    }

    const paidAmount = invoice.allocations.reduce(
      (sum, a) => sum + Number(a.allocatedAmount),
      0
    );
    const outstandingAmount = Math.max(0, Number(invoice.grandTotal) - paidAmount);

    return {
      ...invoice,
      paidAmount,
      outstandingAmount,
    };
  }

  /**
   * Manually create an invoice.
   */
  static async createInvoice(input: CreateInvoiceInput, actorUserId: string) {
    const invoiceNumber = generateInvoiceNumber();
    const issueDate = input.issueDate ? new Date(input.issueDate) : new Date();

    let subtotal = 0;
    let taxTotal = 0;

    const linesData = input.lines.map((l) => {
      const lineSub = Math.round(Number(l.quantity) * Number(l.unitPrice) * 100) / 100;
      const multiplier = InvoicesService.getTaxMultiplier(Number(l.taxRate || 0));
      const lineTax = Math.round(lineSub * multiplier * 100) / 100;
      subtotal += lineSub;
      taxTotal += lineTax;

      return {
        productId: l.productId || null,
        descriptionSnapshot: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxableAmount: lineSub,
        taxAmount: lineTax,
        lineTotal: Math.round((lineSub + lineTax) * 100) / 100,
        taxSnapshot: l.taxRate ? { rate: l.taxRate } : Prisma.JsonNull,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const discountTotal = Number(input.discountTotal || 0);
    const grandTotal = Math.max(0, Math.round((subtotal - discountTotal + taxTotal) * 100) / 100);

    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: input.customerId,
          subscriptionId: input.subscriptionId || null,
          status: InvoiceStatus.DRAFT,
          issueDate,
          dueDate: new Date(input.dueDate),
          billingPeriodStart: input.billingPeriodStart ? new Date(input.billingPeriodStart) : null,
          billingPeriodEnd: input.billingPeriodEnd ? new Date(input.billingPeriodEnd) : null,
          currency: input.currency,
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
          notes: input.notes,
          lines: {
            create: linesData,
          },
        },
        include: { lines: true },
      });

      await tx.auditLog.create({
        data: {
          action: "CREATE_INVOICE",
          entityType: "Invoice",
          entityId: invoice.id,
          summary: `Created draft invoice ${invoice.invoiceNumber}`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            grandTotal,
          },
          ...(actorUserId && {
            actor: { connect: { id: actorUserId } },
          }),
        },
      });

      return invoice;
    });
  }

  /**
   * Generate Invoice from Due Subscription.
   * Core workflow:
   * 1. Validates subscription eligibility (ACTIVE or CONFIRMED, not paused/closed, has lines).
   * 2. Computes billing period (start -> end based on frequency & interval).
   * 3. Idempotency Guard: Verifies no existing non-cancelled invoice exists for this period.
   * 4. Copies subscription lines into immutable InvoiceLine snapshots with active tax snapshot.
   * 5. Atomically creates invoice in DRAFT, advances subscription schedule, and logs audit.
   */
  static async generateFromSubscription(
    subscriptionId: string,
    actorUserId: string,
    options?: GenerateInvoiceInput
  ) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
        plan: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (
      subscription.status !== SubscriptionStatus.ACTIVE &&
      subscription.status !== SubscriptionStatus.CONFIRMED
    ) {
      throw new Error(
        `Subscription is not eligible for billing. Current status is ${subscription.status} (expected ACTIVE or CONFIRMED).`
      );
    }

    if (subscription.pausedAt) {
      throw new Error("Cannot bill a paused subscription");
    }

    if (subscription.closedAt) {
      throw new Error("Cannot bill a closed subscription");
    }

    if (subscription.customer.archivedAt) {
      throw new Error("Cannot bill subscription for an archived customer profile");
    }

    if (!subscription.lines || subscription.lines.length === 0) {
      throw new Error(
        `Subscription ${subscription.subscriptionNumber} has no product lines configured to bill.`
      );
    }

    // Determine billing period start
    const billingPeriodStart = subscription.lastBilledAt
      ? new Date(subscription.lastBilledAt)
      : new Date(subscription.startAt);

    // Calculate billing period end based on frequency and interval count
    const intervalCount = subscription.intervalCount > 0 ? subscription.intervalCount : 1;
    let billingPeriodEnd: Date;

    switch (subscription.billingFrequency) {
      case BillingFrequency.DAILY:
        billingPeriodEnd = addDays(billingPeriodStart, intervalCount);
        break;
      case BillingFrequency.WEEKLY:
        billingPeriodEnd = addWeeks(billingPeriodStart, intervalCount);
        break;
      case BillingFrequency.MONTHLY:
        billingPeriodEnd = addMonths(billingPeriodStart, intervalCount);
        break;
      case BillingFrequency.YEARLY:
        billingPeriodEnd = addYears(billingPeriodStart, intervalCount);
        break;
      default:
        billingPeriodEnd = addMonths(billingPeriodStart, intervalCount);
    }

    // Subscription expiry check
    if (subscription.endAt) {
      const endAt = new Date(subscription.endAt);
      if (billingPeriodStart >= endAt) {
        throw new Error(
          `Subscription ${subscription.subscriptionNumber} has reached its expiration date (${endAt.toISOString().split("T")[0]}).`
        );
      }
      if (billingPeriodEnd > endAt) {
        billingPeriodEnd = endAt;
      }
    }

    // IDEMPOTENCY GUARD: Check for existing non-cancelled invoice for this exact subscription and period start
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        subscriptionId: subscription.id,
        billingPeriodStart: {
          equals: billingPeriodStart,
        },
        status: {
          not: InvoiceStatus.CANCELLED,
        },
      },
    });

    if (existingInvoice) {
      throw new Error(
        `Invoice already exists for subscription ${subscription.subscriptionNumber} for billing period starting ${billingPeriodStart.toISOString().split("T")[0]} (Invoice: ${existingInvoice.invoiceNumber}, Status: ${existingInvoice.status}). Duplicate billing prevented.`
      );
    }

    // Retrieve active Tax Rule
    const now = new Date();
    const activeTaxRule = await prisma.taxRule.findFirst({
      where: {
        isActive: true,
        OR: [
          { validFrom: null, validUntil: null },
          { validFrom: { lte: now }, validUntil: null },
          { validFrom: null, validUntil: { gte: now } },
          { validFrom: { lte: now }, validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const taxRawRate = activeTaxRule ? Number(activeTaxRule.rate) : 0;
    const taxMultiplier = InvoicesService.getTaxMultiplier(taxRawRate);

    // Snapshot lines and compute totals
    let subtotal = 0;
    let taxTotal = 0;

    const invoiceLinesData = subscription.lines.map((line) => {
      const qty = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);
      const taxableAmount = Math.round(qty * unitPrice * 100) / 100;
      const taxAmount = Math.round(taxableAmount * taxMultiplier * 100) / 100;
      const lineTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

      subtotal += taxableAmount;
      taxTotal += taxAmount;

      return {
        productId: line.productId || null,
        subscriptionLineId: line.id,
        descriptionSnapshot:
          line.descriptionSnapshot ||
          line.product?.name ||
          `Subscription Line (${subscription.subscriptionNumber})`,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: 0,
        taxableAmount,
        taxAmount,
        lineTotal,
        taxSnapshot: activeTaxRule
          ? {
              id: activeTaxRule.id,
              name: activeTaxRule.name,
              code: activeTaxRule.code,
              rate: taxRawRate,
              multiplier: taxMultiplier,
            }
          : Prisma.JsonNull,
        variantSnapshot: line.variantSnapshot ?? Prisma.JsonNull,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const discountTotal = 0;
    const grandTotal = Math.round((subtotal - discountTotal + taxTotal) * 100) / 100;

    // Dates
    const issueDate = options?.issueDate ? new Date(options.issueDate) : new Date();
    const dueDate = options?.dueDate
      ? new Date(options.dueDate)
      : addDays(issueDate, subscription.paymentTermsDays || 15);

    const invoiceNumber = generateInvoiceNumber();

    return await prisma.$transaction(async (tx) => {
      // 1. Create Invoice in DRAFT status
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: subscription.customerId,
          subscriptionId: subscription.id,
          status: InvoiceStatus.DRAFT,
          issueDate,
          dueDate,
          billingPeriodStart,
          billingPeriodEnd,
          currency: subscription.currency,
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
          notes: `Generated recurring invoice for subscription ${subscription.subscriptionNumber}`,
          lines: {
            create: invoiceLinesData,
          },
        },
        include: {
          lines: {
            include: {
              product: true,
            },
          },
          customer: {
            select: {
              id: true,
              customerCode: true,
              displayName: true,
              companyName: true,
            },
          },
          subscription: {
            select: {
              id: true,
              subscriptionNumber: true,
              status: true,
            },
          },
        },
      });

      // 2. Advance subscription schedule & activate if CONFIRMED
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          lastBilledAt: billingPeriodStart,
          nextBillingAt: billingPeriodEnd,
          ...(subscription.status === SubscriptionStatus.CONFIRMED && {
            status: SubscriptionStatus.ACTIVE,
          }),
        },
      });

      // 3. Record Audit Log
      await tx.auditLog.create({
        data: {
          action: "GENERATE_INVOICE",
          entityType: "Invoice",
          entityId: invoice.id,
          summary: `Generated invoice ${invoice.invoiceNumber} for subscription ${subscription.subscriptionNumber} (${billingPeriodStart.toISOString().split("T")[0]} to ${billingPeriodEnd.toISOString().split("T")[0]})`,
          metadata: {
            subscriptionId: subscription.id,
            invoiceNumber: invoice.invoiceNumber,
            grandTotal,
          },
          ...(actorUserId && {
            actor: { connect: { id: actorUserId } },
          }),
        },
      });

      return invoice;
    });
  }

  /**
   * Confirm a draft invoice (DRAFT -> CONFIRMED).
   */
  static async confirmInvoice(id: string, actorUserId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error(`Only draft invoices can be confirmed (current: ${invoice.status})`);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
        include: {
          customer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
          lines: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "CONFIRM_INVOICE",
          entityType: "Invoice",
          entityId: id,
          summary: `Confirmed invoice ${invoice.invoiceNumber}`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
          },
          ...(actorUserId && {
            actor: { connect: { id: actorUserId } },
          }),
        },
      });

      return updated;
    });
  }

  /**
   * Cancel an invoice (DRAFT / CONFIRMED -> CANCELLED).
   * Disallows cancelling invoices with existing payment allocations.
   */
  static async cancelInvoice(id: string, actorUserId: string, reason?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { allocations: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Invoice is already cancelled");
    }
    if (invoice.allocations.length > 0) {
      throw new Error(
        "Cannot cancel invoice with recorded payment allocations. Reallocate or void payments first."
      );
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.CANCELLED,
          cancelledAt: new Date(),
          notes: reason
            ? `${invoice.notes ? invoice.notes + " | " : ""}Cancelled: ${reason}`
            : invoice.notes,
        },
        include: {
          customer: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
          lines: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "CANCEL_INVOICE",
          entityType: "Invoice",
          entityId: id,
          summary: `Cancelled invoice ${invoice.invoiceNumber}${reason ? ` (Reason: ${reason})` : ""}`,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            reason: reason || null,
          },
          ...(actorUserId && {
            actor: { connect: { id: actorUserId } },
          }),
        },
      });

      return updated;
    });
  }
}

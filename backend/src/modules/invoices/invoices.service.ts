import { prisma } from "../../config/prisma";
import { generateInvoiceNumber } from "../../utils/code-generator";
import {
  CreateInvoiceInput,
  InvoiceQueryInput,
} from "./invoices.validation";
import { Prisma, InvoiceStatus } from "@prisma/client";

export class InvoicesService {
  static async listInvoices(query: InvoiceQueryInput) {
    const { search, customerId, subscriptionId, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      ...(customerId && { customerId }),
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

  static async getOverdueInvoices() {
    const now = new Date();

    const rawInvoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.CONFIRMED,
        dueDate: { lt: now },
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

    // Filter to only those where outstandingAmount > 0
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

  static async getInvoiceById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim());
    const invoice = isUuid
      ? await prisma.invoice.findUnique({
          where: { id },
          include: {
            customer: true,
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
        })
      : await prisma.invoice.findFirst({
          where: { invoiceNumber: id },
          include: {
            customer: true,
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

  static async createInvoice(input: CreateInvoiceInput, actorUserId: string) {
    const invoiceNumber = generateInvoiceNumber();
    const issueDate = input.issueDate ? new Date(input.issueDate) : new Date();

    let subtotal = 0;
    let taxTotal = 0;

    const linesData = input.lines.map((l) => {
      const lineSub = Number(l.quantity) * Number(l.unitPrice);
      const lineTax = (lineSub * Number(l.taxRate || 0)) / 100;
      subtotal += lineSub;
      taxTotal += lineTax;

      return {
        productId: l.productId || null,
        descriptionSnapshot: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxableAmount: lineSub,
        taxAmount: lineTax,
        lineTotal: lineSub + lineTax,
        taxSnapshot: l.taxRate ? { rate: l.taxRate } : Prisma.JsonNull,
      };
    });

    const discountTotal = Number(input.discountTotal || 0);
    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);

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
          actorUserId,
          action: "CREATE_INVOICE",
          entityType: "Invoice",
          entityId: invoice.id,
          summary: `Created draft invoice ${invoice.invoiceNumber}`,
        },
      });

      return invoice;
    });
  }

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
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CONFIRM_INVOICE",
          entityType: "Invoice",
          entityId: id,
          summary: `Confirmed invoice ${invoice.invoiceNumber}`,
        },
      });

      return updated;
    });
  }

  static async cancelInvoice(id: string, actorUserId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { allocations: true },
    });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Invoice is already cancelled");
    }
    if (invoice.allocations.length > 0) {
      throw new Error("Cannot cancel invoice with recorded payment allocations. Reallocate or void payments first.");
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "CANCEL_INVOICE",
          entityType: "Invoice",
          entityId: id,
          summary: `Cancelled invoice ${invoice.invoiceNumber}`,
        },
      });

      return updated;
    });
  }
}


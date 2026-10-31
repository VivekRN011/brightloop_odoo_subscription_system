import { prisma } from "../../config/prisma";
import { generatePaymentNumber } from "../../utils/code-generator";
import {
  RecordPaymentInput,
  PaymentQueryInput,
} from "./payments.validation";
import { Prisma, InvoiceStatus } from "@prisma/client";

export class PaymentsService {
  static async listPayments(query: PaymentQueryInput) {
    const { search, customerId, method, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(customerId && { customerId }),
      ...(method && { method }),
      ...(search && {
        OR: [
          { paymentNumber: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
          { customer: { displayName: { contains: search, mode: "insensitive" } } },
          { customer: { companyName: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              displayName: true,
              companyName: true,
            },
          },
          recordedBy: {
            select: {
              id: true,
              email: true,
            },
          },
          allocations: {
            include: {
              invoice: {
                select: {
                  id: true,
                  invoiceNumber: true,
                  grandTotal: true,
                  status: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
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

  static async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        recordedBy: {
          select: { id: true, email: true },
        },
        allocations: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }

  static async recordPayment(input: RecordPaymentInput, actorUserId: string) {
    const paymentNumber = generatePaymentNumber();
    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();

    // Verify sum of allocations <= payment amount
    const totalAllocated = input.allocations.reduce((sum, a) => sum + Number(a.amount), 0);
    if (totalAllocated > Number(input.amount)) {
      throw new Error(
        `Total allocated amount (${totalAllocated}) cannot exceed the payment amount (${input.amount})`
      );
    }

    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          customerId: input.customerId,
          method: input.method,
          amount: input.amount,
          currency: input.currency,
          paidAt,
          reference: input.reference,
          note: input.note,
          recordedById: actorUserId,
          allocations: {
            create: input.allocations.map((a) => ({
              invoiceId: a.invoiceId,
              allocatedAmount: a.amount,
            })),
          },
        },
        include: {
          allocations: true,
        },
      });

      // Check each allocated invoice: if total allocations >= grandTotal, mark PAID
      for (const alloc of input.allocations) {
        const inv = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { allocations: true },
        });

        if (inv) {
          const totalPaidForInv = inv.allocations.reduce(
            (sum, a) => sum + Number(a.allocatedAmount),
            0
          );
          if (totalPaidForInv >= Number(inv.grandTotal) && inv.status !== InvoiceStatus.PAID) {
            await tx.invoice.update({
              where: { id: inv.id },
              data: {
                status: InvoiceStatus.PAID,
                paidAt: paidAt,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "RECORD_PAYMENT",
          entityType: "Payment",
          entityId: payment.id,
          summary: `Recorded payment ${payment.paymentNumber} of ${payment.currency} ${payment.amount} for customer ${payment.customerId}`,
        },
      });

      return payment;
    });
  }
}


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

    if (Number(input.amount) <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    const allocations = input.allocations || [];
    const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.amount), 0);
    if (totalAllocated > Number(input.amount) + 0.001) {
      throw new Error(
        `Total allocated amount (${totalAllocated}) cannot exceed the payment amount (${input.amount})`
      );
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Validate customer existence and active status
      const customer = await tx.customerProfile.findUnique({
        where: { id: input.customerId },
      });
      if (!customer) {
        throw new Error("Customer profile not found");
      }

      // 2. Validate all invoice allocations upfront
      for (const alloc of allocations) {
        if (Number(alloc.amount) <= 0) {
          throw new Error("Allocation amount must be positive");
        }

        const inv = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { allocations: true },
        });

        if (!inv) {
          throw new Error(`Invoice with ID ${alloc.invoiceId} does not exist`);
        }

        if (inv.customerId !== input.customerId) {
          throw new Error(
            `Invoice ${inv.invoiceNumber} does not belong to customer ${customer.displayName}`
          );
        }

        if (inv.currency !== input.currency) {
          throw new Error(
            `Currency mismatch: Invoice ${inv.invoiceNumber} is in ${inv.currency}, but payment is in ${input.currency}`
          );
        }

        if (inv.status !== InvoiceStatus.CONFIRMED && inv.status !== InvoiceStatus.PAID) {
          throw new Error(
            `Invoice ${inv.invoiceNumber} is in ${inv.status} status and cannot receive allocations`
          );
        }

        const alreadyAllocated = inv.allocations.reduce(
          (sum, a) => sum + Number(a.allocatedAmount),
          0
        );
        const remainingBalance = Math.round((Number(inv.grandTotal) - alreadyAllocated) * 100) / 100;

        if (Number(alloc.amount) > remainingBalance + 0.001) {
          throw new Error(
            `Allocation amount (${alloc.amount}) exceeds remaining balance (${remainingBalance}) for invoice ${inv.invoiceNumber}`
          );
        }
      }

      // 3. Create the payment record with allocations
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
            create: allocations.map((a) => ({
              invoiceId: a.invoiceId,
              allocatedAmount: a.amount,
            })),
          },
        },
        include: {
          allocations: true,
        },
      });

      // 4. Update status of each allocated invoice if fully settled
      for (const alloc of allocations) {
        const inv = await tx.invoice.findUnique({
          where: { id: alloc.invoiceId },
          include: { allocations: true },
        });

        if (inv) {
          const totalPaidForInv = inv.allocations.reduce(
            (sum, a) => sum + Number(a.allocatedAmount),
            0
          );
          if (
            totalPaidForInv >= Number(inv.grandTotal) - 0.001 &&
            inv.status !== InvoiceStatus.PAID
          ) {
            await tx.invoice.update({
              where: { id: inv.id },
              data: {
                status: InvoiceStatus.PAID,
                paidAt,
              },
            });
          }
        }
      }

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "RECORD_PAYMENT",
          entityType: "Payment",
          entityId: payment.id,
          summary: `Recorded payment ${payment.paymentNumber} of ${payment.currency} ${payment.amount} for customer ${customer.displayName}`,
        },
      });

      return payment;
    });
  }
}


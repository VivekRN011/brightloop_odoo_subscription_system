import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { generatePaymentNumber } from "../../utils/code-generator";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_TuRyvEsUuxvjrd",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "sdNIcpQVmi2AeDnhTxBGefos",
});

export interface CreateOrderParams {
  invoiceId: string;
  actorUserId: string;
  callerCustomerProfileId?: string;
}

export interface VerifyPaymentParams {
  invoiceId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  actorUserId: string;
  callerCustomerProfileId?: string;
}

export class RazorpayService {
  /**
   * Create Razorpay Order server-side for an invoice's exact outstanding amount
   */
  static async createOrder(params: CreateOrderParams) {
    const { invoiceId, callerCustomerProfileId } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          include: {
            user: { select: { email: true } },
          },
        },
        allocations: true,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Ownership check: If called by customer, must own the invoice
    if (callerCustomerProfileId && invoice.customerId !== callerCustomerProfileId) {
      throw new Error("Access denied: You do not have permission to pay this invoice");
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("This invoice is already fully paid");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Cannot make payment on a cancelled invoice");
    }

    if (invoice.currency !== "INR") {
      throw new Error(`Razorpay checkout currently only supports INR invoices. Invoice is in ${invoice.currency}`);
    }

    // Calculate current outstanding amount
    const totalPaid = invoice.allocations.reduce(
      (sum, a) => sum + Number(a.allocatedAmount),
      0
    );
    const outstanding = Math.max(0, Math.round((Number(invoice.grandTotal) - totalPaid) * 100) / 100);

    if (outstanding <= 0) {
      throw new Error("Invoice has zero outstanding balance");
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(outstanding * 100);

    // Call Razorpay API to generate order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: invoice.invoiceNumber.slice(0, 40),
      notes: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount, // in paise
      amountInRupees: outstanding,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TuRyvEsUuxvjrd",
      customer: {
        name: invoice.customer.displayName,
        email: invoice.customer.user?.email || "",
        phone: invoice.customer.phone || "",
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        outstanding,
      },
    };
  }

  /**
   * Cryptographically verify Razorpay payment signature and record payment atomically
   */
  static async verifyPayment(params: VerifyPaymentParams) {
    const {
      invoiceId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      actorUserId,
      callerCustomerProfileId,
    } = params;

    const secret = process.env.RAZORPAY_KEY_SECRET || "sdNIcpQVmi2AeDnhTxBGefos";

    // 1. Constant-time HMAC SHA-256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const receivedBuffer = Buffer.from(razorpaySignature, "utf-8");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      throw new Error("Cryptographic payment signature verification failed");
    }

    // 2. Fetch invoice and verify state
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true, allocations: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (callerCustomerProfileId && invoice.customerId !== callerCustomerProfileId) {
      throw new Error("Access denied: You do not have permission to settle this invoice");
    }

    // 3. Check idempotency: check if this gateway payment ID has already been recorded
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { gatewayPaymentId: razorpayPaymentId },
          { gatewayOrderId: razorpayOrderId },
        ],
      },
      include: { allocations: true },
    });

    if (existingPayment) {
      return {
        success: true,
        message: "Payment has already been safely processed and recorded",
        payment: existingPayment,
      };
    }

    // 4. Inspect details from Razorpay SDK to determine actual amount and payment method
    let paymentDetails: any = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (err) {
      console.warn("Could not fetch remote payment details from Razorpay, proceeding with order values", err);
    }

    const currentPaid = invoice.allocations.reduce(
      (sum, a) => sum + Number(a.allocatedAmount),
      0
    );
    const outstanding = Math.max(0, Math.round((Number(invoice.grandTotal) - currentPaid) * 100) / 100);

    const paidAmount = paymentDetails
      ? Math.round((paymentDetails.amount / 100) * 100) / 100
      : outstanding;

    let method: PaymentMethod = PaymentMethod.CARD;
    if (paymentDetails?.method === "upi") {
      method = PaymentMethod.UPI;
    } else if (paymentDetails?.method === "netbanking") {
      method = PaymentMethod.BANK_TRANSFER;
    } else if (paymentDetails?.method === "card") {
      method = PaymentMethod.CARD;
    } else {
      method = PaymentMethod.OTHER;
    }

    const paymentNumber = generatePaymentNumber();
    const paidAt = new Date();

    // 5. Execute atomic database transaction
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          customerId: invoice.customerId,
          method,
          amount: paidAmount,
          currency: invoice.currency,
          paidAt,
          reference: razorpayPaymentId,
          note: `Razorpay Online Checkout (Order: ${razorpayOrderId})`,
          gatewayProvider: "RAZORPAY",
          gatewayOrderId: razorpayOrderId,
          gatewayPaymentId: razorpayPaymentId,
          gatewaySignatureVerifiedAt: new Date(),
          recordedById: actorUserId,
          allocations: {
            create: {
              invoiceId: invoice.id,
              allocatedAmount: Math.min(paidAmount, outstanding),
            },
          },
        },
        include: {
          allocations: true,
        },
      });

      // Update invoice if outstanding is now 0
      if (currentPaid + paidAmount >= Number(invoice.grandTotal) - 0.001) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.PAID,
            paidAt,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: "RAZORPAY_PAYMENT_SUCCESS",
          entityType: "Payment",
          entityId: payment.id,
          summary: `Razorpay payment of INR ${paidAmount} verified and allocated to invoice ${invoice.invoiceNumber}`,
        },
      });

      return {
        success: true,
        message: "Razorpay payment verified and allocated successfully",
        payment,
      };
    });
  }

  /**
   * Handle incoming Razorpay Webhook with raw body verification and event deduplication
   */
  static async handleWebhook(rawBody: Buffer | string, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret";

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const receivedBuf = Buffer.from(signature, "utf-8");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString());
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}_${Math.random()}`;

    // Deduplicate event using PaymentGatewayEvent
    try {
      await prisma.paymentGatewayEvent.create({
        data: {
          eventId,
          provider: "RAZORPAY",
          eventType: payload.event || "unknown",
          payload,
        },
      });
    } catch (err: any) {
      // Event already recorded and processed
      return { received: true, deduplicated: true };
    }

    // Process event if it's payment.captured or order.paid
    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || orderEntity?.notes;
      const invoiceId = notes?.invoiceId;

      if (invoiceId && orderId && paymentId) {
        const existingPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { gatewayPaymentId: paymentId },
              { gatewayOrderId: orderId },
            ],
          },
        });

        if (!existingPayment) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { allocations: true },
          });

          if (invoice && invoice.status !== InvoiceStatus.PAID) {
            const currentPaid = invoice.allocations.reduce(
              (sum, a) => sum + Number(a.allocatedAmount),
              0
            );
            const outstanding = Math.max(0, Math.round((Number(invoice.grandTotal) - currentPaid) * 100) / 100);
            const amountInRupees = paymentEntity?.amount
              ? Math.round((paymentEntity.amount / 100) * 100) / 100
              : outstanding;

            const paymentNumber = generatePaymentNumber();
            const paidAt = new Date();

            await prisma.$transaction(async (tx) => {
              await tx.payment.create({
                data: {
                  paymentNumber,
                  customerId: invoice.customerId,
                  method: PaymentMethod.OTHER,
                  amount: amountInRupees,
                  currency: invoice.currency,
                  paidAt,
                  reference: paymentId,
                  note: `Razorpay Webhook Auto-Reconciliation (${payload.event})`,
                  gatewayProvider: "RAZORPAY",
                  gatewayOrderId: orderId,
                  gatewayPaymentId: paymentId,
                  gatewaySignatureVerifiedAt: new Date(),
                  recordedById: invoice.customerId, // System recorded for customer
                  allocations: {
                    create: {
                      invoiceId: invoice.id,
                      allocatedAmount: Math.min(amountInRupees, outstanding),
                    },
                  },
                },
              });

              if (currentPaid + amountInRupees >= Number(invoice.grandTotal) - 0.001) {
                await tx.invoice.update({
                  where: { id: invoice.id },
                  data: {
                    status: InvoiceStatus.PAID,
                    paidAt,
                  },
                });
              }
            });
          }
        }
      }
    }

    return { received: true, deduplicated: false };
  }
}

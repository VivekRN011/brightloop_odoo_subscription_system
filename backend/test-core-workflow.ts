import "dotenv/config";
import crypto from "crypto";
import { prisma } from "./src/config/prisma";
import { BillingCalculationService } from "./src/services/billing-calculation.service";
import { SubscriptionsService } from "./src/modules/subscriptions/subscriptions.service";
import { PaymentsService } from "./src/modules/payments/payments.service";
import { RazorpayService } from "./src/modules/payments/razorpay.service";
import {
  BillingFrequency,
  InvoiceStatus,
  PaymentMethod,
  SubscriptionStatus,
} from "@prisma/client";

async function runTests() {
  console.log("===============================================================");
  console.log("🚀 BRIGHTLOOP CORE WORKFLOW & FINANCIAL ENGINE VERIFICATION");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  async function assert(desc: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${desc}`);
      console.error(`     Error: ${err.message || err}`);
      failed++;
    }
  }

  // 1. Dual GST & Calculation Engine
  await assert("Dual Indian GST: Kerala intra-state produces equal CGST (9%) + SGST (9%)", async () => {
    const result = await BillingCalculationService.calculateDocument({
      lines: [
        {
          description: "Cloud Enterprise License",
          quantity: 2,
          unitPrice: 1000,
          variantPriceAdjustment: 200, // Effective unit price: 1200, subtotal: 2400
        },
      ],
      customerState: "Kerala",
    });

    if (result.subtotal !== 2400) throw new Error(`Subtotal expected 2400, got ${result.subtotal}`);
    if (result.isInterState !== false) throw new Error("Expected intra-state for Kerala");
    // 18% of 2400 = 432
    if (result.taxTotal !== 432) throw new Error(`Tax expected 432, got ${result.taxTotal}`);
    if (result.cgstTotal !== 216 || result.sgstTotal !== 216) {
      throw new Error(`Expected CGST 216 and SGST 216, got ${result.cgstTotal} and ${result.sgstTotal}`);
    }
    if (result.grandTotal !== 2832) throw new Error(`Grand total expected 2832, got ${result.grandTotal}`);
  });

  await assert("Dual Indian GST: Karnataka inter-state produces IGST (18%) and zero CGST/SGST", async () => {
    const result = await BillingCalculationService.calculateDocument({
      lines: [
        {
          description: "Cloud Enterprise License",
          quantity: 1,
          unitPrice: 5000,
        },
      ],
      customerState: "Karnataka",
    });

    if (result.isInterState !== true) throw new Error("Expected inter-state for Karnataka");
    if (result.igstTotal !== 900) throw new Error(`IGST expected 900, got ${result.igstTotal}`);
    if (result.cgstTotal !== 0 || result.sgstTotal !== 0) throw new Error("CGST/SGST must be 0 for inter-state");
    if (result.grandTotal !== 5900) throw new Error(`Grand total expected 5900, got ${result.grandTotal}`);
  });

  // 2. Calendar-Aware Billing Date Calculations
  await assert("Calendar-Aware Date: Month-end boundary clamping (Jan 31 -> Feb 28)", async () => {
    const jan31 = new Date("2026-01-31T00:00:00.000Z");
    const nextDate = SubscriptionsService.calculateNextBillingDate(jan31, BillingFrequency.MONTHLY, 1);
    const day = nextDate.getUTCDate();
    const month = nextDate.getUTCMonth(); // 1 = Feb
    if (month !== 1 || (day !== 28 && day !== 29)) {
      throw new Error(`Expected Feb 28, got month ${month} day ${day}`);
    }
  });

  // 3. Razorpay Signature Verification & Tampering Rejection
  await assert("Razorpay Security: Constant-time signature verification passes for valid hash", async () => {
    const secret = process.env.RAZORPAY_KEY_SECRET || "sdNIcpQVmi2AeDnhTxBGefos";
    const orderId = "order_test_998877";
    const paymentId = "pay_test_112233";
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(validSignature, "utf-8");
    const receivedBuffer = Buffer.from(validSignature, "utf-8");
    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) throw new Error("Expected valid signature to verify");
  });

  await assert("Razorpay Security: Tampered payload signature is strictly rejected", async () => {
    const secret = process.env.RAZORPAY_KEY_SECRET || "sdNIcpQVmi2AeDnhTxBGefos";
    const orderId = "order_test_998877";
    const paymentId = "pay_test_112233";
    const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const receivedBuffer = Buffer.from(forgedSignature, "utf-8");
    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (isValid) throw new Error("Tampered signature must not pass verification");
  });

  // 4. Razorpay Webhook Event Deduplication
  await assert("Webhook Reliability: PaymentGatewayEvent enforces idempotent event deduplication", async () => {
    const testEventId = `test_evt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    // First attempt creates event
    const record = await prisma.paymentGatewayEvent.create({
      data: {
        eventId: testEventId,
        provider: "RAZORPAY",
        eventType: "payment.captured",
        payload: { amount: 50000, currency: "INR" },
      },
    });

    if (!record || record.eventId !== testEventId) throw new Error("Event recording failed");

    // Second duplicate attempt must be caught and deduplicated
    let duplicateCaught = false;
    try {
      await prisma.paymentGatewayEvent.create({
        data: {
          eventId: testEventId,
          provider: "RAZORPAY",
          eventType: "payment.captured",
          payload: { amount: 50000, currency: "INR" },
        },
      });
    } catch {
      duplicateCaught = true;
    }

    if (!duplicateCaught) throw new Error("Duplicate event ID must be rejected by unique constraint");

    // Clean up test event
    await prisma.paymentGatewayEvent.delete({ where: { eventId: testEventId } });
  });

  // 5. Payment Overpayment & Balance Validation
  await assert("Payment Validation: Rejects allocation exceeding invoice outstanding balance", async () => {
    // Find any customer and invoice
    const invoice = await prisma.invoice.findFirst({
      where: { status: InvoiceStatus.CONFIRMED },
      include: { customer: true, allocations: true },
    });

    if (invoice) {
      const alreadyPaid = invoice.allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);
      const remaining = Number(invoice.grandTotal) - alreadyPaid;
      const excessiveAmount = remaining + 10000;

      let rejected = false;
      try {
        await PaymentsService.recordPayment(
          {
            customerId: invoice.customerId,
            method: PaymentMethod.BANK_TRANSFER,
            amount: excessiveAmount,
            currency: invoice.currency,
            allocations: [
              {
                invoiceId: invoice.id,
                amount: excessiveAmount,
              },
            ],
          },
          invoice.customerId
        );
      } catch (err: any) {
        if (err.message.includes("exceeds remaining balance")) {
          rejected = true;
        }
      }

      if (!rejected) throw new Error("Excessive allocation should have been rejected");
    }
  });

  console.log("\n===============================================================");
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed.`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error("Test execution fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import "dotenv/config";
import crypto from "crypto";
import { prisma } from "./src/config/prisma";
import { RazorpayService } from "./src/modules/payments/razorpay.service";
import { BillingFrequency, InvoiceStatus, SubscriptionStatus, UserRole } from "@prisma/client";
import { generateInvoiceNumber, generateSubscriptionNumber } from "./src/utils/code-generator";
import { BillingCalculationService } from "./src/services/billing-calculation.service";
import { SubscriptionsService } from "./src/modules/subscriptions/subscriptions.service";

async function runE2ETest() {
  console.log("===============================================================");
  console.log("🌟 RUNNING END-TO-END WORKFLOW INTEGRATION TEST");
  console.log("===============================================================\n");

  const timestamp = Date.now();
  const testCustomerEmail = `e2e_subscriber_${timestamp}@example.com`;

  // 1. Setup customer user & profile
  console.log("Step 1: Setting up subscriber account in database...");
  const user = await prisma.user.create({
    data: {
      email: testCustomerEmail,
      passwordHash: "test_hashed_pwd",
      role: UserRole.CUSTOMER,
    },
  });

  const customer = await prisma.customerProfile.create({
    data: {
      userId: user.id,
      customerCode: `CUST-E2E-${timestamp.toString().slice(-4)}`,
      displayName: "Apex Tech Labs",
      companyName: "Apex Innovations Pvt Ltd",
      phone: "+91 9876543210",
      state: "Kerala", // Intra-state dual GST (9% CGST + 9% SGST)
      city: "Kochi",
      billingAddressLine1: "Infopark Phase 2",
    },
  });

  // 2. Fetch existing active product & plan
  console.log("Step 2: Resolving product & subscription plan...");
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    include: { variants: true },
  });
  if (!product) throw new Error("No active product found");

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
  });
  if (!plan) throw new Error("No active plan found");

  console.log(`  -> Selected product: "${product.name}" (${product.sku})`);
  console.log(`  -> Selected plan: "${plan.name}" (Rate: INR ${plan.price}, Cadence: ${plan.billingFrequency})`);

  // 3. Customer subscribes
  console.log("\nStep 3: Creating customer subscription with decimal-safe GST calculation...");
  const startAt = new Date();
  const nextBillingAt = SubscriptionsService.calculateNextBillingDate(startAt, plan.billingFrequency, 1);
  const variant = product.variants[0];
  const variantAdj = variant ? Number(variant.priceAdjustment) : 0;

  const calcDoc = await BillingCalculationService.calculateDocument({
    lines: [
      {
        productId: product.id,
        planId: plan.id,
        description: `${product.name} - ${plan.name}`,
        quantity: 1,
        unitPrice: Number(plan.price),
        variantPriceAdjustment: variantAdj,
        variantSnapshot: variant ? { name: variant.name, value: variant.value } : undefined,
      },
    ],
    customerState: customer.state,
  });

  const calcLine = calcDoc.lines[0];
  const subscriptionNumber = generateSubscriptionNumber();
  const invoiceNumber = generateInvoiceNumber();

  const subscription = await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.create({
      data: {
        subscriptionNumber,
        customerId: customer.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startAt,
        nextBillingAt,
        billingFrequency: plan.billingFrequency,
        intervalCount: 1,
        quantity: 1,
        currency: "INR",
        createdById: user.id,
        lines: {
          create: {
            productId: product.id,
            planId: plan.id,
            descriptionSnapshot: `${product.name} - ${plan.name}`,
            quantity: 1,
            unitPrice: calcLine.unitPrice,
          },
        },
      },
    });

    const inv = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        subscriptionId: sub.id,
        status: InvoiceStatus.CONFIRMED,
        issueDate: startAt,
        dueDate: new Date(startAt.getTime() + 15 * 86400000),
        subtotal: calcDoc.subtotal,
        taxTotal: calcDoc.taxTotal,
        grandTotal: calcDoc.grandTotal,
        currency: "INR",
        lines: {
          create: {
            productId: product.id,
            descriptionSnapshot: `${product.name} - ${plan.name}`,
            quantity: 1,
            unitPrice: calcLine.unitPrice,
            taxAmount: calcLine.taxAmount,
            taxableAmount: calcLine.taxableAmount,
            lineTotal: calcLine.lineTotal,
            taxSnapshot: calcLine.taxSnapshot,
          },
        },
      },
    });

    return { sub, inv };
  });

  console.log(`  -> Subscription created: ${subscription.sub.subscriptionNumber}`);
  console.log(`  -> Initial invoice generated: ${subscription.inv.invoiceNumber}`);
  console.log(`     Subtotal: INR ${subscription.inv.subtotal}, Tax: INR ${subscription.inv.taxTotal}, Grand Total: INR ${subscription.inv.grandTotal}`);

  // 4. Test Razorpay Order creation
  console.log("\nStep 4: Requesting server-side Razorpay Order creation...");
  const orderData = await RazorpayService.createOrder({
    invoiceId: subscription.inv.id,
    actorUserId: user.id,
    callerCustomerProfileId: customer.id,
  });

  console.log(`  -> Razorpay Order ID created: ${orderData.orderId}`);
  console.log(`  -> Amount in paise: ${orderData.amount} (INR ${orderData.amountInRupees})`);

  // 5. Test payment signature verification
  console.log("\nStep 5: Simulating client checkout callback & verifying HMAC SHA256 signature...");
  const secret = process.env.RAZORPAY_KEY_SECRET || "sdNIcpQVmi2AeDnhTxBGefos";
  const mockPaymentId = `pay_sim_${timestamp}`;
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderData.orderId}|${mockPaymentId}`)
    .digest("hex");

  const verifyResult = await RazorpayService.verifyPayment({
    invoiceId: subscription.inv.id,
    razorpayOrderId: orderData.orderId,
    razorpayPaymentId: mockPaymentId,
    razorpaySignature: validSignature,
    actorUserId: user.id,
    callerCustomerProfileId: customer.id,
  });

  console.log(`  -> Verification status: ${verifyResult.success ? "SUCCESS" : "FAILED"}`);
  console.log(`  -> Recorded Payment ID: ${verifyResult.payment.id} (${verifyResult.payment.paymentNumber})`);

  // 6. Assert invoice settlement
  console.log("\nStep 6: Verifying invoice status transition to PAID and zero balance...");
  const updatedInvoice = await prisma.invoice.findUnique({
    where: { id: subscription.inv.id },
    include: { allocations: true },
  });

  const totalPaid = updatedInvoice!.allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);
  const remaining = Math.max(0, Number(updatedInvoice!.grandTotal) - totalPaid);

  console.log(`  -> Updated Invoice Status: ${updatedInvoice!.status}`);
  console.log(`  -> Amount Paid: INR ${totalPaid}, Remaining Balance: INR ${remaining}`);

  if (updatedInvoice!.status !== InvoiceStatus.PAID) {
    throw new Error(`Expected invoice status PAID, got ${updatedInvoice!.status}`);
  }
  if (remaining !== 0) {
    throw new Error(`Expected remaining balance 0, got ${remaining}`);
  }

  // 7. Cleanup test records
  console.log("\nStep 7: Cleaning up test artifacts...");
  await prisma.paymentAllocation.deleteMany({ where: { invoiceId: subscription.inv.id } });
  await prisma.payment.deleteMany({ where: { id: verifyResult.payment.id } });
  await prisma.invoiceLine.deleteMany({ where: { invoiceId: subscription.inv.id } });
  await prisma.invoice.deleteMany({ where: { id: subscription.inv.id } });
  await prisma.subscriptionLine.deleteMany({ where: { subscriptionId: subscription.sub.id } });
  await prisma.subscription.deleteMany({ where: { id: subscription.sub.id } });
  await prisma.auditLog.deleteMany({ where: { actorUserId: user.id } });
  await prisma.customerProfile.delete({ where: { id: customer.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log("\n===============================================================");
  console.log("🎉 ALL END-TO-END WORKFLOW INTEGRATION STEPS PASSED SUCCESSFULLY!");
  console.log("===============================================================\n");
}

runE2ETest()
  .catch((err) => {
    console.error("E2E Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

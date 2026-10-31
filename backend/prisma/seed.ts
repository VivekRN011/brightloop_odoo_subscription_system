import {
  BillingAttemptStatus,
  BillingFrequency,
  BillingRunStatus,
  DiscountScope,
  DiscountType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  QuotationStatus,
  SubscriptionStatus,
  UserRole,
  UserStatus,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured in .env");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Starting Brightloop database seeding...");

  // 1. Clean existing records in reverse dependency order for clean idempotent seeding
  console.log("Cleaning existing records...");
  await prisma.auditLog.deleteMany();
  await prisma.billingAttempt.deleteMany();
  await prisma.billingRun.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.discountApplication.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users (Admin, Staff, Customers)
  console.log("Seeding users...");
  const salt = bcrypt.genSaltSync(10);
  const defaultPassword = bcrypt.hashSync("Brightloop@2026", salt);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@brightloop.io",
      passwordHash: defaultPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@brightloop.io",
      passwordHash: defaultPassword,
      role: UserRole.STAFF,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const customerUser1 = await prisma.user.create({
    data: {
      email: "sarah.chen@acme.inc",
      passwordHash: defaultPassword,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: "david.ross@apexcloud.co",
      passwordHash: defaultPassword,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  // 3. Customer Profiles
  console.log("Seeding customer profiles...");
  const customer1 = await prisma.customerProfile.create({
    data: {
      userId: customerUser1.id,
      customerCode: "CUST-0001",
      displayName: "Sarah Chen",
      companyName: "Acme Enterprises Inc.",
      phone: "+91 98765 43210",
      billingAddressLine1: "Tower B, Level 4, Infopark",
      billingAddressLine2: "Kakkanad",
      city: "Kochi",
      state: "Kerala",
      postalCode: "682042",
      country: "India",
      taxIdentifier: "32ABCDE1234F1Z5",
    },
  });

  const customer2 = await prisma.customerProfile.create({
    data: {
      userId: customerUser2.id,
      customerCode: "CUST-0002",
      displayName: "David Ross",
      companyName: "Apex Cloud Services",
      phone: "+91 91234 56789",
      billingAddressLine1: "12 Marine Drive",
      city: "Kochi",
      state: "Kerala",
      postalCode: "682031",
      country: "India",
      taxIdentifier: "32FGHIJ5678K1Z2",
    },
  });

  // 4. Products and Variants
  console.log("Seeding products & variants...");
  const prodSubscriptionEngine = await prisma.product.create({
    data: {
      sku: "PROD-SUB-ENG",
      name: "Brightloop Core Billing Engine",
      productType: "SOFTWARE_SERVICE",
      description: "Automated recurring subscription and invoice billing engine license",
      salesPrice: new Prisma.Decimal("12000.00"),
      costPrice: new Prisma.Decimal("3000.00"),
      currency: "INR",
      isActive: true,
    },
  });

  const prodAddonAnalytics = await prisma.product.create({
    data: {
      sku: "PROD-ADDON-BI",
      name: "Advanced Analytics & Forecasting Add-on",
      productType: "ADDON",
      description: "MRR, churn analysis, and financial reporting dashboard",
      salesPrice: new Prisma.Decimal("4500.00"),
      costPrice: new Prisma.Decimal("1000.00"),
      currency: "INR",
      isActive: true,
    },
  });

  // Product with variants
  const prodSupportTier = await prisma.product.create({
    data: {
      sku: "PROD-SUP-SLA",
      name: "Technical Support SLA Package",
      productType: "SUPPORT_SERVICE",
      description: "Dedicated account management and SLA tier",
      salesPrice: new Prisma.Decimal("5000.00"),
      currency: "INR",
      isActive: true,
      variants: {
        create: [
          {
            name: "Tier",
            value: "Standard (8x5)",
            priceAdjustment: new Prisma.Decimal("0.00"),
          },
          {
            name: "Tier",
            value: "Premium (24x7)",
            priceAdjustment: new Prisma.Decimal("5000.00"),
          },
        ],
      },
    },
  });

  // 5. Subscription Plans
  console.log("Seeding subscription plans...");
  const planMonthly = await prisma.subscriptionPlan.create({
    data: {
      code: "PLAN-BIZ-M",
      name: "Business Pro - Monthly",
      description: "Complete recurring billing platform for growing companies billed monthly",
      billingFrequency: BillingFrequency.MONTHLY,
      intervalCount: 1,
      price: new Prisma.Decimal("15000.00"),
      currency: "INR",
      minimumQuantity: new Prisma.Decimal("1"),
      autoCloseAtEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      isActive: true,
    },
  });

  const planYearly = await prisma.subscriptionPlan.create({
    data: {
      code: "PLAN-ENT-Y",
      name: "Enterprise Annual",
      description: "Full enterprise subscription with dedicated SLA and custom workflows billed annually",
      billingFrequency: BillingFrequency.YEARLY,
      intervalCount: 1,
      price: new Prisma.Decimal("150000.00"),
      currency: "INR",
      minimumQuantity: new Prisma.Decimal("1"),
      autoCloseAtEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      isActive: true,
    },
  });

  // 6. Tax Rules
  console.log("Seeding tax rules...");
  const gstTax = await prisma.taxRule.create({
    data: {
      name: "GST 18%",
      code: "GST-18",
      rate: new Prisma.Decimal("0.1800"),
      isActive: true,
      validFrom: new Date("2026-01-01"),
    },
  });

  // 7. Discount Rules
  console.log("Seeding discount rules...");
  const discountEarlyBird = await prisma.discountRule.create({
    data: {
      name: "Early Adopter 10%",
      code: "EARLY10",
      discountType: DiscountType.PERCENTAGE,
      scope: DiscountScope.SUBSCRIPTION,
      percentageValue: new Prisma.Decimal("0.1000"),
      minimumPurchase: new Prisma.Decimal("10000.00"),
      startsAt: new Date("2026-01-01"),
      usageLimit: 50,
      usageCount: 1,
      isActive: true,
      createdById: adminUser.id,
    },
  });

  // 8. Quotation Template
  console.log("Seeding quotation template...");
  const quoteTemplate = await prisma.quotationTemplate.create({
    data: {
      name: "Standard SaaS Onboarding Template",
      description: "Default commercial quotation for new enterprise customers",
      validityDays: 30,
      isActive: true,
      createdById: adminUser.id,
    },
  });

  // 9. Quotations
  console.log("Seeding quotations...");
  const quote1 = await prisma.quotation.create({
    data: {
      quotationNumber: "QUO-2026-0001",
      customerId: customer1.id,
      templateId: quoteTemplate.id,
      status: QuotationStatus.ACCEPTED,
      issuedAt: new Date("2026-10-01"),
      validUntil: new Date("2026-11-01"),
      currency: "INR",
      subtotal: new Prisma.Decimal("15000.00"),
      discountTotal: new Prisma.Decimal("1500.00"),
      taxTotal: new Prisma.Decimal("2430.00"),
      grandTotal: new Prisma.Decimal("15930.00"),
      notes: "Agreed terms for Acme Enterprises with 10% early adopter discount",
      createdById: staffUser.id,
      lines: {
        create: [
          {
            planId: planMonthly.id,
            descriptionSnapshot: "Business Pro - Monthly Subscription Agreement",
            quantity: new Prisma.Decimal("1.000"),
            unitPrice: new Prisma.Decimal("15000.00"),
            lineSubtotal: new Prisma.Decimal("15000.00"),
          },
        ],
      },
      discountApplications: {
        create: [
          {
            discountRuleId: discountEarlyBird.id,
            discountNameSnapshot: "Early Adopter 10%",
            discountTypeSnapshot: DiscountType.PERCENTAGE,
            valueSnapshot: new Prisma.Decimal("0.1000"),
            appliedAmount: new Prisma.Decimal("1500.00"),
          },
        ],
      },
    },
  });

  // 10. Subscriptions
  console.log("Seeding subscriptions...");
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0001",
      customerId: customer1.id,
      planId: planMonthly.id,
      quotationId: quote1.id,
      status: SubscriptionStatus.ACTIVE,
      startAt: new Date("2026-10-01T00:00:00Z"),
      nextBillingAt: new Date("2026-11-01T00:00:00Z"),
      lastBilledAt: new Date("2026-10-01T00:00:00Z"),
      billingFrequency: BillingFrequency.MONTHLY,
      intervalCount: 1,
      quantity: new Prisma.Decimal("1.000"),
      currency: "INR",
      paymentTermsDays: 15,
      autoCloseAtEnd: false,
      allowEarlyClose: true,
      allowPause: true,
      allowRenewal: true,
      createdById: staffUser.id,
      lines: {
        create: [
          {
            planId: planMonthly.id,
            descriptionSnapshot: "Business Pro - Monthly Subscription",
            quantity: new Prisma.Decimal("1.000"),
            unitPrice: new Prisma.Decimal("15000.00"),
          },
        ],
      },
    },
  });

  // Link converted subscription
  await prisma.quotation.update({
    where: { id: quote1.id },
    data: {
      status: QuotationStatus.CONVERTED,
      convertedSubscriptionId: sub1.id,
    },
  });

  const subLine1 = await prisma.subscriptionLine.findFirst({
    where: { subscriptionId: sub1.id },
  });

  // 11. Invoices
  console.log("Seeding invoices...");
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      customerId: customer1.id,
      subscriptionId: sub1.id,
      status: InvoiceStatus.PAID,
      issueDate: new Date("2026-10-01T00:00:00Z"),
      dueDate: new Date("2026-10-15T00:00:00Z"),
      billingPeriodStart: new Date("2026-10-01T00:00:00Z"),
      billingPeriodEnd: new Date("2026-10-31T23:59:59Z"),
      currency: "INR",
      subtotal: new Prisma.Decimal("15000.00"),
      discountTotal: new Prisma.Decimal("1500.00"),
      taxTotal: new Prisma.Decimal("2430.00"),
      grandTotal: new Prisma.Decimal("15930.00"),
      confirmedAt: new Date("2026-10-01T00:05:00Z"),
      paidAt: new Date("2026-10-05T14:30:00Z"),
      lines: {
        create: [
          {
            subscriptionLineId: subLine1?.id,
            descriptionSnapshot: "Business Pro - Monthly (October 2026)",
            quantity: new Prisma.Decimal("1.000"),
            unitPrice: new Prisma.Decimal("15000.00"),
            discountAmount: new Prisma.Decimal("1500.00"),
            taxableAmount: new Prisma.Decimal("13500.00"),
            taxAmount: new Prisma.Decimal("2430.00"),
            lineTotal: new Prisma.Decimal("15930.00"),
            taxSnapshot: {
              code: gstTax.code,
              name: gstTax.name,
              rate: 0.18,
            },
          },
        ],
      },
    },
  });

  // 12. Payments & Allocations
  console.log("Seeding payments & allocations...");
  const payment1 = await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2026-0001",
      customerId: customer1.id,
      method: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.RECORDED,
      amount: new Prisma.Decimal("15930.00"),
      currency: "INR",
      paidAt: new Date("2026-10-05T14:30:00Z"),
      reference: "HDFC-NEFT-984729184",
      note: "Full settlement for October billing invoice INV-2026-0001",
      recordedById: staffUser.id,
      allocations: {
        create: [
          {
            invoiceId: inv1.id,
            allocatedAmount: new Prisma.Decimal("15930.00"),
          },
        ],
      },
    },
  });

  // 13. Billing Runs & Attempts (Idempotency demonstration)
  console.log("Seeding billing run history...");
  const billingRun = await prisma.billingRun.create({
    data: {
      runKey: "RUN-2026-10-01-SCHEDULED",
      status: BillingRunStatus.COMPLETED,
      startedAt: new Date("2026-10-01T00:00:00Z"),
      finishedAt: new Date("2026-10-01T00:00:05Z"),
      totalCandidates: 1,
      succeededCount: 1,
      skippedCount: 0,
      failedCount: 0,
      triggeredBy: "SCHEDULER",
      summary: { message: "Monthly batch billing executed successfully" },
      attempts: {
        create: [
          {
            subscriptionId: sub1.id,
            invoiceId: inv1.id,
            idempotencyKey: `subscription:${sub1.id}:period:2026-10-01:2026-10-31`,
            periodStart: new Date("2026-10-01T00:00:00Z"),
            periodEnd: new Date("2026-10-31T23:59:59Z"),
            status: BillingAttemptStatus.SUCCEEDED,
            attemptCount: 1,
            startedAt: new Date("2026-10-01T00:00:01Z"),
            finishedAt: new Date("2026-10-01T00:00:04Z"),
          },
        ],
      },
    },
  });

  // 14. Audit Log
  console.log("Seeding audit log...");
  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "SUBSCRIPTION_ACTIVATED",
      entityType: "Subscription",
      entityId: sub1.id,
      summary: `Subscription ${sub1.subscriptionNumber} was activated for customer ${customer1.displayName}`,
      metadata: { planCode: planMonthly.code, grandTotal: 15930.0 },
    },
  });

  console.log("✅ Brightloop database seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


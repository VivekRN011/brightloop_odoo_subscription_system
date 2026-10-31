import {
  BillingAttemptStatus,
  BillingFrequency,
  BillingRunStatus,
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
import "dotenv/config";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured in .env");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function runIntegrityTests() {
  console.log("🧪 Running Brightloop Database Integrity & Constraints Verification...\n");
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (error: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${error.message || error}`);
      failed++;
    }
  }

  // 1. Uniqueness test: User email
  await test("User email unique constraint rejects duplicates", async () => {
    try {
      await prisma.user.create({
        data: {
          email: "admin@brightloop.io", // already exists
          passwordHash: "hash123",
          role: UserRole.STAFF,
        },
      });
      throw new Error("Duplicate user email was accepted!");
    } catch (e: any) {
      if (e.code === "P2002" || e.message?.includes("Unique constraint")) {
        // Expected
        return;
      }
      throw e;
    }
  });

  // 2. Uniqueness test: Customer code
  await test("Customer profile customerCode unique constraint rejects duplicates", async () => {
    try {
      await prisma.customerProfile.create({
        data: {
          customerCode: "CUST-0001", // already exists
          displayName: "Duplicate Code Customer",
        },
      });
      throw new Error("Duplicate customer code was accepted!");
    } catch (e: any) {
      if (e.code === "P2002" || e.message?.includes("Unique constraint")) {
        return;
      }
      throw e;
    }
  });

  // 3. Uniqueness test: Product SKU
  await test("Product SKU unique constraint rejects duplicates", async () => {
    try {
      await prisma.product.create({
        data: {
          sku: "PROD-SUB-ENG", // already exists
          name: "Duplicate SKU Product",
          salesPrice: new Prisma.Decimal("100.00"),
        },
      });
      throw new Error("Duplicate product SKU was accepted!");
    } catch (e: any) {
      if (e.code === "P2002" || e.message?.includes("Unique constraint")) {
        return;
      }
      throw e;
    }
  });

  // 4. Decimal precision test: Verify exact calculation preservation
  await test("Decimal precision preservation on invoices and line items", async () => {
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: "INV-2026-0001" },
      include: { lines: true, allocations: true },
    });
    if (!invoice) throw new Error("Seed invoice INV-2026-0001 not found");

    const grandTotal = new Prisma.Decimal(invoice.grandTotal);
    const expected = new Prisma.Decimal("15930.00");
    if (!grandTotal.equals(expected)) {
      throw new Error(`Grand total mismatch: got ${grandTotal.toString()}, expected ${expected.toString()}`);
    }

    // Verify allocated amount matches
    const totalAllocated = invoice.allocations.reduce(
      (acc, alloc) => acc.plus(new Prisma.Decimal(alloc.allocatedAmount)),
      new Prisma.Decimal(0)
    );
    if (!totalAllocated.equals(grandTotal)) {
      throw new Error(`Allocations do not equal grand total: ${totalAllocated.toString()} vs ${grandTotal.toString()}`);
    }
  });

  // 5. Billing Idempotency constraint test: Duplicate attempt key rejection
  await test("Recurring billing idempotency key constraint rejects duplicate period processing", async () => {
    const existingAttempt = await prisma.billingAttempt.findFirst();
    if (!existingAttempt) throw new Error("No existing billing attempt found in seed");

    try {
      await prisma.billingAttempt.create({
        data: {
          billingRunId: existingAttempt.billingRunId,
          subscriptionId: existingAttempt.subscriptionId,
          idempotencyKey: existingAttempt.idempotencyKey, // Duplicate key!
          periodStart: existingAttempt.periodStart,
          periodEnd: existingAttempt.periodEnd,
          status: BillingAttemptStatus.PROCESSING,
        },
      });
      throw new Error("Duplicate idempotency key was allowed!");
    } catch (e: any) {
      if (e.code === "P2002" || e.message?.includes("Unique constraint")) {
        return;
      }
      throw e;
    }
  });

  // 6. Relationship integrity: Foreign key constraint enforcement
  await test("Foreign key constraint prevents orphan customer profile userId", async () => {
    try {
      await prisma.customerProfile.create({
        data: {
          userId: "00000000-0000-0000-0000-000000000000", // Non-existent user UUID
          customerCode: "CUST-ORPHAN-TEST",
          displayName: "Orphan Profile",
        },
      });
      throw new Error("Orphan foreign key was accepted!");
    } catch (e: any) {
      if (e.code === "P2003" || e.message?.includes("Foreign key constraint")) {
        return;
      }
      throw e;
    }
  });

  // 7. Health query check
  await test("Health query raw roundtrip", async () => {
    const result: any = await prisma.$queryRaw`SELECT 1 as alive`;
    if (!result || result.length === 0 || Number(result[0].alive) !== 1) {
      throw new Error("Health check query returned unexpected result");
    }
  });

  console.log(`\nIntegrity Verification Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrityTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


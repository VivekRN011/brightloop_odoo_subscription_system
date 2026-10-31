-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'UPI', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('RECORDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "DiscountScope" AS ENUM ('PRODUCT', 'SUBSCRIPTION', 'BOTH');

-- CreateEnum
CREATE TYPE "BillingRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingAttemptStatus" AS ENUM ('PROCESSING', 'SUCCEEDED', 'SKIPPED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMPTZ(6),
    "lastLoginAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "customerCode" VARCHAR(40) NOT NULL,
    "displayName" VARCHAR(180) NOT NULL,
    "companyName" VARCHAR(180),
    "phone" VARCHAR(30),
    "billingAddressLine1" VARCHAR(200),
    "billingAddressLine2" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "country" VARCHAR(100),
    "taxIdentifier" VARCHAR(80),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(80),
    "name" VARCHAR(180) NOT NULL,
    "productType" VARCHAR(60) NOT NULL DEFAULT 'SERVICE',
    "description" TEXT,
    "salesPrice" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "value" VARCHAR(120) NOT NULL,
    "priceAdjustment" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "billingFrequency" "BillingFrequency" NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "minimumQuantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "availableFrom" TIMESTAMPTZ(6),
    "availableUntil" TIMESTAMPTZ(6),
    "autoCloseAtEnd" BOOLEAN NOT NULL DEFAULT false,
    "allowEarlyClose" BOOLEAN NOT NULL DEFAULT true,
    "allowPause" BOOLEAN NOT NULL DEFAULT true,
    "allowRenewal" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quotation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" UUID NOT NULL,
    "quotationNumber" VARCHAR(50) NOT NULL,
    "customerId" UUID NOT NULL,
    "templateId" UUID,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedAt" TIMESTAMPTZ(6),
    "validUntil" TIMESTAMPTZ(6) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" UUID NOT NULL,
    "convertedSubscriptionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_lines" (
    "id" UUID NOT NULL,
    "quotationId" UUID NOT NULL,
    "productId" UUID,
    "planId" UUID,
    "descriptionSnapshot" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "variantSnapshot" JSONB,
    "taxSnapshot" JSONB,
    "lineSubtotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "subscriptionNumber" VARCHAR(50) NOT NULL,
    "customerId" UUID NOT NULL,
    "planId" UUID,
    "quotationId" UUID,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6),
    "nextBillingAt" TIMESTAMPTZ(6),
    "lastBilledAt" TIMESTAMPTZ(6),
    "billingFrequency" "BillingFrequency" NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 15,
    "autoCloseAtEnd" BOOLEAN NOT NULL DEFAULT false,
    "allowEarlyClose" BOOLEAN NOT NULL DEFAULT true,
    "allowPause" BOOLEAN NOT NULL DEFAULT true,
    "allowRenewal" BOOLEAN NOT NULL DEFAULT true,
    "pausedAt" TIMESTAMPTZ(6),
    "closedAt" TIMESTAMPTZ(6),
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_lines" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "productId" UUID,
    "planId" UUID,
    "descriptionSnapshot" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "variantSnapshot" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "rate" DECIMAL(7,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMPTZ(6),
    "validUntil" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "customerId" UUID NOT NULL,
    "subscriptionId" UUID,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMPTZ(6) NOT NULL,
    "dueDate" TIMESTAMPTZ(6) NOT NULL,
    "billingPeriodStart" TIMESTAMPTZ(6),
    "billingPeriodEnd" TIMESTAMPTZ(6),
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "confirmedAt" TIMESTAMPTZ(6),
    "paidAt" TIMESTAMPTZ(6),
    "cancelledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "productId" UUID,
    "subscriptionLineId" UUID,
    "descriptionSnapshot" VARCHAR(300) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxSnapshot" JSONB,
    "variantSnapshot" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_rules" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(60),
    "discountType" "DiscountType" NOT NULL,
    "scope" "DiscountScope" NOT NULL DEFAULT 'BOTH',
    "fixedAmount" DECIMAL(12,2),
    "percentageValue" DECIMAL(7,4),
    "minimumPurchase" DECIMAL(14,2),
    "minimumQuantity" DECIMAL(10,3),
    "startsAt" TIMESTAMPTZ(6) NOT NULL,
    "endsAt" TIMESTAMPTZ(6),
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_applications" (
    "id" UUID NOT NULL,
    "discountRuleId" UUID NOT NULL,
    "quotationId" UUID,
    "invoiceId" UUID,
    "discountNameSnapshot" VARCHAR(150) NOT NULL,
    "discountTypeSnapshot" "DiscountType" NOT NULL,
    "valueSnapshot" DECIMAL(12,4) NOT NULL,
    "appliedAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "paymentNumber" VARCHAR(50) NOT NULL,
    "customerId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'RECORDED',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "paidAt" TIMESTAMPTZ(6) NOT NULL,
    "reference" VARCHAR(120),
    "note" TEXT,
    "recordedById" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "allocatedAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_runs" (
    "id" UUID NOT NULL,
    "runKey" VARCHAR(100) NOT NULL,
    "status" "BillingRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(6),
    "totalCandidates" INTEGER NOT NULL DEFAULT 0,
    "succeededCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "triggeredBy" VARCHAR(40) NOT NULL DEFAULT 'SCHEDULER',
    "summary" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_attempts" (
    "id" UUID NOT NULL,
    "billingRunId" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "invoiceId" UUID,
    "idempotencyKey" VARCHAR(180) NOT NULL,
    "periodStart" TIMESTAMPTZ(6) NOT NULL,
    "periodEnd" TIMESTAMPTZ(6) NOT NULL,
    "status" "BillingAttemptStatus" NOT NULL DEFAULT 'PROCESSING',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "errorCode" VARCHAR(80),
    "errorMessage" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" UUID,
    "summary" TEXT,
    "metadata" JSONB,
    "requestId" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_expiresAt_idx" ON "password_reset_tokens"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_customerCode_key" ON "customer_profiles"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_name_value_key" ON "product_variants"("productId", "name", "value");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE INDEX "quotation_templates_isActive_idx" ON "quotation_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotationNumber_key" ON "quotations"("quotationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_convertedSubscriptionId_key" ON "quotations"("convertedSubscriptionId");

-- CreateIndex
CREATE INDEX "quotations_customerId_status_idx" ON "quotations"("customerId", "status");

-- CreateIndex
CREATE INDEX "quotations_validUntil_idx" ON "quotations"("validUntil");

-- CreateIndex
CREATE INDEX "quotation_lines_quotationId_idx" ON "quotation_lines"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscriptionNumber_key" ON "subscriptions"("subscriptionNumber");

-- CreateIndex
CREATE INDEX "subscriptions_status_nextBillingAt_idx" ON "subscriptions"("status", "nextBillingAt");

-- CreateIndex
CREATE INDEX "subscriptions_customerId_status_idx" ON "subscriptions"("customerId", "status");

-- CreateIndex
CREATE INDEX "subscription_lines_subscriptionId_idx" ON "subscription_lines"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rules_code_key" ON "tax_rules"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_customerId_status_idx" ON "invoices"("customerId", "status");

-- CreateIndex
CREATE INDEX "invoices_status_dueDate_idx" ON "invoices"("status", "dueDate");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_billingPeriodStart_billingPeriodEnd_idx" ON "invoices"("subscriptionId", "billingPeriodStart", "billingPeriodEnd");

-- CreateIndex
CREATE INDEX "invoice_lines_invoiceId_idx" ON "invoice_lines"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "discount_rules_code_key" ON "discount_rules"("code");

-- CreateIndex
CREATE INDEX "discount_rules_isActive_startsAt_endsAt_idx" ON "discount_rules"("isActive", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "discount_applications_quotationId_idx" ON "discount_applications"("quotationId");

-- CreateIndex
CREATE INDEX "discount_applications_invoiceId_idx" ON "discount_applications"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentNumber_key" ON "payments"("paymentNumber");

-- CreateIndex
CREATE INDEX "payments_customerId_paidAt_idx" ON "payments"("customerId", "paidAt");

-- CreateIndex
CREATE INDEX "payment_allocations_invoiceId_idx" ON "payment_allocations"("invoiceId");

-- CreateIndex
CREATE INDEX "payment_allocations_paymentId_idx" ON "payment_allocations"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_runs_runKey_key" ON "billing_runs"("runKey");

-- CreateIndex
CREATE UNIQUE INDEX "billing_attempts_idempotencyKey_key" ON "billing_attempts"("idempotencyKey");

-- CreateIndex
CREATE INDEX "billing_attempts_subscriptionId_periodStart_periodEnd_idx" ON "billing_attempts"("subscriptionId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_createdAt_idx" ON "audit_logs"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_templates" ADD CONSTRAINT "quotation_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "quotation_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_convertedSubscriptionId_fkey" FOREIGN KEY ("convertedSubscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_lines" ADD CONSTRAINT "quotation_lines_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_lines" ADD CONSTRAINT "subscription_lines_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_lines" ADD CONSTRAINT "subscription_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_lines" ADD CONSTRAINT "subscription_lines_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_subscriptionLineId_fkey" FOREIGN KEY ("subscriptionLineId") REFERENCES "subscription_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_rules" ADD CONSTRAINT "discount_rules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_applications" ADD CONSTRAINT "discount_applications_discountRuleId_fkey" FOREIGN KEY ("discountRuleId") REFERENCES "discount_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_applications" ADD CONSTRAINT "discount_applications_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_applications" ADD CONSTRAINT "discount_applications_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_attempts" ADD CONSTRAINT "billing_attempts_billingRunId_fkey" FOREIGN KEY ("billingRunId") REFERENCES "billing_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_attempts" ADD CONSTRAINT "billing_attempts_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_attempts" ADD CONSTRAINT "billing_attempts_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

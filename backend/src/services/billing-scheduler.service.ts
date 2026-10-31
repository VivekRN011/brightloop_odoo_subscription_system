import cron, { ScheduledTask } from "node-cron";
import { prisma } from "../config/prisma";
import { InvoicesService } from "../modules/invoices/invoices.service";
import {
  BillingRunStatus,
  BillingAttemptStatus,
  SubscriptionStatus,
  InvoiceStatus,
  BillingFrequency,
} from "@prisma/client";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

export interface BillingRunResult {
  runId: string;
  runKey: string;
  status: BillingRunStatus;
  totalCandidates: number;
  succeededCount: number;
  skippedCount: number;
  failedCount: number;
  startedAt: Date;
  finishedAt: Date;
  attempts: Array<{
    subscriptionId: string;
    subscriptionNumber: string;
    status: BillingAttemptStatus;
    invoiceNumber?: string;
    errorMessage?: string;
  }>;
}

export class BillingSchedulerService {
  private static scheduledTask: ScheduledTask | null = null;

  /**
   * Execute an automated billing run across all due active subscriptions
   */
  static async executeBillingRun(
    triggeredBy = "SCHEDULER",
    actorUserId?: string
  ): Promise<BillingRunResult> {
    const startedAt = new Date();
    const runKey = `RUN-${startedAt.toISOString().split("T")[0]}-${Date.now().toString().slice(-4)}`;

    console.log(`[BillingScheduler] Starting automated billing run: ${runKey} (Triggered by: ${triggeredBy})`);

    // 1. Identify billable subscription candidates
    // Eligible if: ACTIVE or CONFIRMED, not paused/closed, customer active, lines present, due for billing
    const candidates = await prisma.subscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CONFIRMED] },
        pausedAt: null,
        closedAt: null,
        customer: { archivedAt: null },
        lines: { some: {} },
        OR: [
          { nextBillingAt: { lte: startedAt } },
          { lastBilledAt: null, startAt: { lte: startedAt } },
        ],
      },
      include: {
        customer: true,
        lines: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(`[BillingScheduler] Found ${candidates.length} due subscription candidate(s) for billing.`);

    // 2. Initialize BillingRun record
    const billingRun = await prisma.billingRun.create({
      data: {
        runKey,
        status: BillingRunStatus.RUNNING,
        startedAt,
        totalCandidates: candidates.length,
        triggeredBy,
      },
    });

    let succeededCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const attemptResults: BillingRunResult["attempts"] = [];

    // Fallback user ID for audit log if scheduler triggered
    let effectiveActorUserId = actorUserId;
    if (!effectiveActorUserId) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      effectiveActorUserId = admin?.id || candidates[0]?.createdById;
    }

    // 3. Process each subscription independently with idempotency
    for (const sub of candidates) {
      const attemptStart = new Date();
      const periodStart = sub.lastBilledAt ? new Date(sub.lastBilledAt) : new Date(sub.startAt);
      const interval = sub.intervalCount > 0 ? sub.intervalCount : 1;

      let periodEnd: Date;
      switch (sub.billingFrequency) {
        case BillingFrequency.DAILY:
          periodEnd = addDays(periodStart, interval);
          break;
        case BillingFrequency.WEEKLY:
          periodEnd = addWeeks(periodStart, interval);
          break;
        case BillingFrequency.MONTHLY:
          periodEnd = addMonths(periodStart, interval);
          break;
        case BillingFrequency.YEARLY:
          periodEnd = addYears(periodStart, interval);
          break;
        default:
          periodEnd = addMonths(periodStart, interval);
      }

      if (sub.endAt && periodEnd > new Date(sub.endAt)) {
        periodEnd = new Date(sub.endAt);
      }

      const idempotencyKey = `sub_${sub.id}_${periodStart.toISOString().split("T")[0]}_${periodEnd.toISOString().split("T")[0]}`;

      // Check for existing invoice for this period
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          billingPeriodStart: { equals: periodStart },
          status: { not: InvoiceStatus.CANCELLED },
        },
      });

      if (existingInvoice) {
        // Record skipped attempt
        await prisma.billingAttempt.create({
          data: {
            billingRunId: billingRun.id,
            subscriptionId: sub.id,
            invoiceId: existingInvoice.id,
            idempotencyKey,
            periodStart,
            periodEnd,
            status: BillingAttemptStatus.SKIPPED,
            errorMessage: `Period starting ${periodStart.toISOString().split("T")[0]} already invoiced (${existingInvoice.invoiceNumber})`,
            startedAt: attemptStart,
            finishedAt: new Date(),
          },
        });

        skippedCount++;
        attemptResults.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          status: BillingAttemptStatus.SKIPPED,
          invoiceNumber: existingInvoice.invoiceNumber,
        });
        continue;
      }

      try {
        // Generate recurring invoice
        const invoice = await InvoicesService.generateFromSubscription(
          sub.id,
          effectiveActorUserId || sub.createdById
        );

        // Record successful attempt
        await prisma.billingAttempt.create({
          data: {
            billingRunId: billingRun.id,
            subscriptionId: sub.id,
            invoiceId: invoice.id,
            idempotencyKey,
            periodStart,
            periodEnd,
            status: BillingAttemptStatus.SUCCEEDED,
            startedAt: attemptStart,
            finishedAt: new Date(),
          },
        });

        succeededCount++;
        attemptResults.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          status: BillingAttemptStatus.SUCCEEDED,
          invoiceNumber: invoice.invoiceNumber,
        });
      } catch (err: any) {
        console.error(`[BillingScheduler] Error billing subscription ${sub.subscriptionNumber}:`, err.message);

        // Record failed attempt safely
        await prisma.billingAttempt.create({
          data: {
            billingRunId: billingRun.id,
            subscriptionId: sub.id,
            idempotencyKey,
            periodStart,
            periodEnd,
            status: BillingAttemptStatus.FAILED,
            errorCode: "BILLING_GENERATION_FAILED",
            errorMessage: err.message || "Failed to generate invoice",
            startedAt: attemptStart,
            finishedAt: new Date(),
          },
        });

        failedCount++;
        attemptResults.push({
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          status: BillingAttemptStatus.FAILED,
          errorMessage: err.message,
        });
      }
    }

    const finishedAt = new Date();

    // 4. Update BillingRun status
    const finalStatus =
      failedCount > 0
        ? succeededCount > 0
          ? BillingRunStatus.COMPLETED_WITH_ERRORS
          : BillingRunStatus.FAILED
        : BillingRunStatus.COMPLETED;

    await prisma.billingRun.update({
      where: { id: billingRun.id },
      data: {
        status: finalStatus,
        succeededCount,
        skippedCount,
        failedCount,
        finishedAt,
        summary: {
          totalCandidates: candidates.length,
          succeededCount,
          skippedCount,
          failedCount,
          durationMs: finishedAt.getTime() - startedAt.getTime(),
        },
      },
    });

    console.log(
      `[BillingScheduler] Run ${runKey} finished (${finalStatus}): ${succeededCount} succeeded, ${skippedCount} skipped, ${failedCount} failed.`
    );

    return {
      runId: billingRun.id,
      runKey,
      status: finalStatus,
      totalCandidates: candidates.length,
      succeededCount,
      skippedCount,
      failedCount,
      startedAt,
      finishedAt,
      attempts: attemptResults,
    };
  }

  /**
   * Initialize standing daily automated cron job (runs midnight daily)
   */
  static startScheduler(): void {
    const cronSchedule = process.env.BILLING_CRON_SCHEDULE || "0 0 * * *";

    if (this.scheduledTask) {
      console.log("[BillingScheduler] Scheduler already active.");
      return;
    }

    console.log(`[BillingScheduler] Initializing automated billing scheduler on cron: "${cronSchedule}"`);

    this.scheduledTask = cron.schedule(cronSchedule, async () => {
      try {
        await BillingSchedulerService.executeBillingRun("SCHEDULER");
      } catch (err: any) {
        console.error("[BillingScheduler] Scheduled billing execution uncaught error:", err);
      }
    });
  }

  /**
   * Stop the scheduled task (for graceful shutdown / tests)
   */
  static stopScheduler(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log("[BillingScheduler] Scheduled billing stopped.");
    }
  }

  /**
   * Get past billing runs with statistics
   */
  static async listBillingRuns(limit = 20) {
    return await prisma.billingRun.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    });
  }
}

import { prisma } from "../../config/prisma";
import { SubscriptionStatus, InvoiceStatus } from "@prisma/client";

export class AnalyticsService {
  static async getDashboardMetrics() {
    const now = new Date();

    // 1. Active subscription count
    const [activeSubscriptionsCount, totalCustomersCount] = await Promise.all([
      prisma.subscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
        },
      }),
      prisma.customerProfile.count({
        where: {
          archivedAt: null,
        },
      }),
    ]);

    // 2. Revenue received (from all recorded payments)
    const payments = await prisma.payment.findMany({
      select: { amount: true },
    });
    const totalRevenueReceived = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // 3. Outstanding invoice amount and overdue invoices
    const activeInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.CONFIRMED, InvoiceStatus.DRAFT] },
      },
      include: {
        allocations: {
          select: { allocatedAmount: true },
        },
      },
    });

    let outstandingAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    for (const inv of activeInvoices) {
      const paid = inv.allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);
      const balance = Math.max(0, Number(inv.grandTotal) - paid);

      if (balance > 0) {
        outstandingAmount += balance;
        if (inv.status === InvoiceStatus.CONFIRMED && new Date(inv.dueDate) < now) {
          overdueCount++;
          overdueAmount += balance;
        }
      }
    }

    // 4. Recent activities & records
    const [recentSubscriptions, recentInvoices, recentPayments] = await Promise.all([
      prisma.subscription.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { displayName: true, companyName: true } },
          plan: { select: { name: true, billingFrequency: true } },
        },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { issueDate: "desc" },
        include: {
          customer: { select: { displayName: true, companyName: true } },
        },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { paidAt: "desc" },
        include: {
          customer: { select: { displayName: true, companyName: true } },
        },
      }),
    ]);

    // 5. Subscription breakdown by status
    const statusCounts = await prisma.subscription.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return {
      kpi: {
        activeSubscriptions: activeSubscriptionsCount,
        totalCustomers: totalCustomersCount,
        revenueReceived: totalRevenueReceived,
        outstandingAmount,
        overdueCount,
        overdueAmount,
      },
      subscriptionBreakdown: statusCounts.map((sc) => ({
        status: sc.status,
        count: sc._count.id,
      })),
      recentSubscriptions,
      recentInvoices,
      recentPayments,
    };
  }

  static async getReports() {
    // Monthly revenue trend (last 6 months)
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "asc" },
      select: {
        amount: true,
        paidAt: true,
      },
    });

    const monthlyRevenueMap: Record<string, number> = {};
    for (const p of payments) {
      const monthKey = p.paidAt.toISOString().slice(0, 7); // "YYYY-MM"
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + Number(p.amount);
    }

    const revenueTimeline = Object.entries(monthlyRevenueMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // Subscriptions by plan
    const subscriptionsByPlan = await prisma.subscriptionPlan.findMany({
      where: { archivedAt: null },
      select: {
        id: true,
        name: true,
        code: true,
        price: true,
        billingFrequency: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return {
      revenueTimeline,
      subscriptionsByPlan: subscriptionsByPlan.map((p) => ({
        planId: p.id,
        planName: p.name,
        code: p.code,
        price: p.price,
        billingFrequency: p.billingFrequency,
        subscriptionCount: p._count.subscriptions,
      })),
    };
  }
}


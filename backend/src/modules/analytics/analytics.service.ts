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
          customer: {
            select: {
              displayName: true,
              companyName: true,
              user: { select: { email: true } },
            },
          },
          allocations: {
            select: { allocatedAmount: true },
          },
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

    const totalSubscriptions = statusCounts.reduce((acc, curr) => acc + curr._count.id, 0);

    const subscriptionOverview = [
      {
        status: "active",
        label: "Active",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.ACTIVE)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.ACTIVE)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#16a34a",
      },
      {
        status: "confirmed",
        label: "Confirmed",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.CONFIRMED)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.CONFIRMED)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#4f6ef7",
      },
      {
        status: "quotation",
        label: "Quotation",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.QUOTATION)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.QUOTATION)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#0284c7",
      },
      {
        status: "draft",
        label: "Draft",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.DRAFT)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.DRAFT)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#64748b",
      },
      {
        status: "paused",
        label: "Paused",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.PAUSED)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.PAUSED)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#d97706",
      },
      {
        status: "closed",
        label: "Closed",
        count: statusCounts.find((s) => s.status === SubscriptionStatus.CLOSED)?._count.id || 0,
        percentage: totalSubscriptions > 0
          ? Math.round(((statusCounts.find((s) => s.status === SubscriptionStatus.CLOSED)?._count.id || 0) / totalSubscriptions) * 100)
          : 0,
        color: "#94a3b8",
      },
    ];

    // 6. Monthly revenue trend (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [allPaymentsForTrend, allInvoicesForTrend] = await Promise.all([
      prisma.payment.findMany({
        where: { paidAt: { gte: sixMonthsAgo } },
        select: { amount: true, paidAt: true },
      }),
      prisma.invoice.findMany({
        where: { issueDate: { gte: sixMonthsAgo } },
        select: { grandTotal: true, issueDate: true },
      }),
    ]);

    const trendMonths: { month: string; key: string; revenueReceived: number; invoicedAmount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendMonths.push({ month: label, key, revenueReceived: 0, invoicedAmount: 0 });
    }

    for (const p of allPaymentsForTrend) {
      const key = p.paidAt.toISOString().slice(0, 7);
      const found = trendMonths.find((t) => t.key === key);
      if (found) {
        found.revenueReceived += Number(p.amount);
      }
    }

    for (const inv of allInvoicesForTrend) {
      const key = inv.issueDate.toISOString().slice(0, 7);
      const found = trendMonths.find((t) => t.key === key);
      if (found) {
        found.invoicedAmount += Number(inv.grandTotal);
      }
    }

    const revenueTrend = trendMonths.map(({ month, revenueReceived, invoicedAmount }) => ({
      month,
      revenueReceived,
      invoicedAmount,
    }));

    // 7. Formatted recent invoices
    const formattedRecentInvoices = recentInvoices.map((inv) => {
      const paid = inv.allocations.reduce((sum, a) => sum + Number(a.allocatedAmount), 0);
      const balance = Math.max(0, Number(inv.grandTotal) - paid);
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.displayName || inv.customer.companyName || "Unknown Customer",
        customerEmail: inv.customer.user?.email || "billing@customer.io",
        issueDate: inv.issueDate.toISOString().slice(0, 10),
        dueDate: inv.dueDate.toISOString().slice(0, 10),
        amount: Number(inv.grandTotal),
        paidAmount: paid,
        outstandingAmount: balance,
        status: inv.status.toLowerCase(),
      };
    });

    // 8. Recent activity feed
    const activities: {
      id: string;
      type: "subscription_created" | "subscription_activated" | "invoice_generated" | "payment_recorded" | "subscription_closed";
      title: string;
      description: string;
      timestamp: string;
      amount?: number;
    }[] = [];

    for (const s of recentSubscriptions) {
      activities.push({
        id: `sub-${s.id}`,
        type: s.status === SubscriptionStatus.ACTIVE ? "subscription_activated" : "subscription_created",
        title: s.status === SubscriptionStatus.ACTIVE ? "Subscription Activated" : "Subscription Created",
        description: `${s.customer.displayName || s.customer.companyName} subscribed to ${s.plan?.name || "Custom Plan"} (${s.subscriptionNumber})`,
        timestamp: s.createdAt.toISOString(),
      });
    }

    for (const inv of recentInvoices) {
      activities.push({
        id: `inv-${inv.id}`,
        type: "invoice_generated",
        title: "Invoice Generated",
        description: `Invoice ${inv.invoiceNumber} for ${inv.customer.displayName || inv.customer.companyName}`,
        timestamp: inv.createdAt.toISOString(),
        amount: Number(inv.grandTotal),
      });
    }

    for (const p of recentPayments) {
      activities.push({
        id: `pay-${p.id}`,
        type: "payment_recorded",
        title: "Payment Recorded",
        description: `Payment ${p.paymentNumber} recorded for ${p.customer.displayName || p.customer.companyName}`,
        timestamp: p.paidAt.toISOString(),
        amount: Number(p.amount),
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivities = activities.slice(0, 8);

    const inrFormatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
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
      metrics: {
        activeSubscriptions: {
          id: "active_subscriptions",
          label: "Active Subscriptions",
          value: activeSubscriptionsCount,
          formattedValue: `${activeSubscriptionsCount}`,
          changePct: 0,
          trend: "neutral" as const,
          timeframe: "vs last month",
          series: [{ label: "Active", value: activeSubscriptionsCount }],
          subtext: `Across ${totalCustomersCount} customer accounts`,
          badge: {
            text: "Live",
            variant: "success" as const,
          },
        },
        revenueReceived: {
          id: "revenue_received",
          label: "Revenue Received",
          value: totalRevenueReceived,
          formattedValue: inrFormatter.format(totalRevenueReceived),
          changePct: 0,
          trend: "neutral" as const,
          timeframe: "vs last month",
          series: revenueTrend.map((t) => ({ label: t.month.split(" ")[0], value: t.revenueReceived })),
          subtext: "Verified payment allocations",
          badge: {
            text: "Recorded",
            variant: "info" as const,
          },
        },
        outstandingAmount: {
          id: "outstanding_amount",
          label: "Outstanding Amount",
          value: outstandingAmount,
          formattedValue: inrFormatter.format(outstandingAmount),
          changePct: 0,
          trend: "neutral" as const,
          timeframe: "vs last month",
          series: [{ label: "Due", value: outstandingAmount }],
          subtext: "Invoiced minus recorded collections",
          badge: {
            text: outstandingAmount > 0 ? "Pending" : "Settled",
            variant: outstandingAmount > 0 ? ("warning" as const) : ("success" as const),
          },
        },
        overdueInvoices: {
          id: "overdue_invoices",
          label: "Overdue Invoices",
          value: overdueCount,
          formattedValue: `${overdueCount} Invoices`,
          changePct: 0,
          trend: "neutral" as const,
          timeframe: "vs last month",
          series: [{ label: "Overdue", value: overdueCount }],
          subtext: overdueAmount > 0 ? `Total overdue: ${inrFormatter.format(overdueAmount)}` : "No overdue invoices",
          badge: {
            text: overdueCount > 0 ? "Action required" : "Clear",
            variant: overdueCount > 0 ? ("destructive" as const) : ("success" as const),
          },
        },
      },
      subscriptionOverview,
      revenueTrend,
      recentInvoices: formattedRecentInvoices,
      recentActivities,
      subscriptionBreakdown: statusCounts.map((sc) => ({
        status: sc.status,
        count: sc._count.id,
      })),
      recentSubscriptions,
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


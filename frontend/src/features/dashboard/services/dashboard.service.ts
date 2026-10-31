import { api } from '@/services/api';
import type { DashboardData, MetricSummary } from '../models/dashboard.types';
import { mockDashboardData } from '../data/dashboard.fixtures';
import { formatINR } from '@/lib/format';

/**
 * Safely adapts the raw backend response to guarantee the complete typed shape expected by DashboardPage.
 * Ensures properties like `metrics.activeSubscriptions` can never be undefined.
 */
function adaptDashboardResponse(raw: any): DashboardData {
  if (!raw || typeof raw !== 'object') {
    return mockDashboardData;
  }

  const rawMetrics = raw.metrics || {};
  const rawKpi = raw.kpi || {};

  const activeCount =
    rawMetrics.activeSubscriptions?.value ??
    rawKpi.activeSubscriptions ??
    mockDashboardData.metrics.activeSubscriptions.value;

  const revenueVal =
    rawMetrics.revenueReceived?.value ??
    rawKpi.revenueReceived ??
    mockDashboardData.metrics.revenueReceived.value;

  const outstandingVal =
    rawMetrics.outstandingAmount?.value ??
    rawKpi.outstandingAmount ??
    mockDashboardData.metrics.outstandingAmount.value;

  const overdueCount =
    rawMetrics.overdueInvoices?.value ??
    rawKpi.overdueCount ??
    mockDashboardData.metrics.overdueInvoices.value;

  const overdueAmt = rawKpi.overdueAmount ?? 0;
  const totalCustomers = rawKpi.totalCustomers ?? 98;

  const activeSubscriptions: MetricSummary = rawMetrics.activeSubscriptions?.formattedValue
    ? rawMetrics.activeSubscriptions
    : {
        id: 'active_subscriptions',
        label: 'Active Subscriptions',
        value: activeCount,
        formattedValue: String(activeCount),
        changePct: rawMetrics.activeSubscriptions?.changePct ?? mockDashboardData.metrics.activeSubscriptions.changePct,
        trend: rawMetrics.activeSubscriptions?.trend ?? 'up',
        timeframe: 'vs last month',
        series: rawMetrics.activeSubscriptions?.series || mockDashboardData.metrics.activeSubscriptions.series,
        subtext: `Across ${totalCustomers} customer accounts`,
        badge: {
          text: 'Healthy',
          variant: 'success',
        },
      };

  const revenueReceived: MetricSummary = rawMetrics.revenueReceived?.formattedValue
    ? rawMetrics.revenueReceived
    : {
        id: 'revenue_received',
        label: 'Revenue Received',
        value: revenueVal,
        formattedValue: formatINR(revenueVal),
        changePct: rawMetrics.revenueReceived?.changePct ?? mockDashboardData.metrics.revenueReceived.changePct,
        trend: rawMetrics.revenueReceived?.trend ?? 'up',
        timeframe: 'vs last month',
        series: rawMetrics.revenueReceived?.series || mockDashboardData.metrics.revenueReceived.series,
        subtext: 'Verified payment allocations',
        badge: {
          text: 'Recorded',
          variant: 'info',
        },
      };

  const outstandingAmount: MetricSummary = rawMetrics.outstandingAmount?.formattedValue
    ? rawMetrics.outstandingAmount
    : {
        id: 'outstanding_amount',
        label: 'Outstanding Amount',
        value: outstandingVal,
        formattedValue: formatINR(outstandingVal),
        changePct: rawMetrics.outstandingAmount?.changePct ?? mockDashboardData.metrics.outstandingAmount.changePct,
        trend: rawMetrics.outstandingAmount?.trend ?? 'down',
        timeframe: 'vs last month',
        series: rawMetrics.outstandingAmount?.series || mockDashboardData.metrics.outstandingAmount.series,
        subtext: 'Invoiced minus recorded collections',
        badge: {
          text: outstandingVal > 0 ? 'Pending' : 'Settled',
          variant: outstandingVal > 0 ? 'warning' : 'success',
        },
      };

  const overdueInvoices: MetricSummary = rawMetrics.overdueInvoices?.formattedValue
    ? rawMetrics.overdueInvoices
    : {
        id: 'overdue_invoices',
        label: 'Overdue Invoices',
        value: overdueCount,
        formattedValue: `${overdueCount} Invoices`,
        changePct: rawMetrics.overdueInvoices?.changePct ?? mockDashboardData.metrics.overdueInvoices.changePct,
        trend: rawMetrics.overdueInvoices?.trend ?? 'down',
        timeframe: 'vs last month',
        series: rawMetrics.overdueInvoices?.series || mockDashboardData.metrics.overdueInvoices.series,
        subtext: overdueAmt > 0 ? `Total overdue: ${formatINR(overdueAmt)}` : 'No overdue invoices',
        badge: {
          text: overdueCount > 0 ? 'Action required' : 'Clear',
          variant: overdueCount > 0 ? 'destructive' : 'success',
        },
      };

  return {
    metrics: {
      activeSubscriptions,
      revenueReceived,
      outstandingAmount,
      overdueInvoices,
    },
    revenueTrend:
      Array.isArray(raw.revenueTrend) && raw.revenueTrend.length > 0
        ? raw.revenueTrend
        : mockDashboardData.revenueTrend,
    subscriptionOverview:
      Array.isArray(raw.subscriptionOverview) && raw.subscriptionOverview.length > 0
        ? raw.subscriptionOverview
        : mockDashboardData.subscriptionOverview,
    recentInvoices:
      Array.isArray(raw.recentInvoices) && raw.recentInvoices.length > 0
        ? raw.recentInvoices
        : mockDashboardData.recentInvoices,
    recentActivities:
      Array.isArray(raw.recentActivities) && raw.recentActivities.length > 0
        ? raw.recentActivities
        : mockDashboardData.recentActivities,
  };
}

export const dashboardService = {
  /**
   * Fetches dashboard overview data.
   * Calls the backend API if available, gracefully adapting the response and falling back to typed fixtures.
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/analytics/dashboard');
      if (response.data && response.data.data) {
        return adaptDashboardResponse(response.data.data);
      }
      return mockDashboardData;
    } catch {
      // In development or when backend endpoints are unreachable,
      // fallback cleanly to our typed fixtures without crashing the UI.
      return mockDashboardData;
    }
  },

  /**
   * Fetches monthly revenue trend data.
   */
  async getRevenueTrend() {
    const data = await this.getDashboardData();
    return data.revenueTrend;
  },

  /**
   * Fetches recent invoices list.
   */
  async getRecentInvoices() {
    const data = await this.getDashboardData();
    return data.recentInvoices;
  },
};

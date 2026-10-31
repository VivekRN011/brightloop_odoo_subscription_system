/**
 * Type definitions for Brightloop Admin Dashboard.
 * Strongly typed domain entities aligned with recurring billing & subscription lifecycle.
 */

export type SubscriptionStatus =
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'active'
  | 'paused'
  | 'closed';

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface MetricSummary {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  changePct?: number;
  trend?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  series?: SeriesPoint[];
  subtext?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'destructive' | 'info';
  };
}

export interface DashboardMetrics {
  activeSubscriptions: MetricSummary;
  revenueReceived: MetricSummary;
  outstandingAmount: MetricSummary;
  overdueInvoices: MetricSummary;
}

export interface RevenueMonthlyPoint {
  month: string;
  revenueReceived: number; // Recorded & allocated payments
  invoicedAmount: number;  // Confirmed & issued invoice amounts
}

export interface SubscriptionStatusBreakdown {
  status: SubscriptionStatus;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RecentInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
}

export interface DashboardActivityItem {
  id: string;
  type:
    | 'subscription_created'
    | 'subscription_activated'
    | 'invoice_generated'
    | 'payment_recorded'
    | 'subscription_closed';
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  amount?: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  revenueTrend: RevenueMonthlyPoint[];
  subscriptionOverview: SubscriptionStatusBreakdown[];
  recentInvoices: RecentInvoiceItem[];
  recentActivities: DashboardActivityItem[];
}


import type { SubscriptionStatus, InvoiceStatus } from '@/features/dashboard/models/dashboard.types';

export type { SubscriptionStatus, InvoiceStatus };

export interface CustomerSubscription {
  id: string;
  subscriptionNumber: string;
  planName: string;
  productName: string;
  status: SubscriptionStatus;
  quantity: number;
  billingInterval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  price: number;
  currency: 'INR';
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  isOverdue: boolean;
  planName?: string;
  downloadUrl?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  companyName: string;
  customerCode?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  city?: string;
  state?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface CustomerSummary {
  profile: CustomerProfile;
  activeSubscriptionsCount: number;
  nextRenewalDate: string | null;
  nextRenewalPlan: string | null;
  totalOutstandingAmount: number;
  totalPaidAmount: number;
  paidInvoicesCount: number;
  subscriptions: CustomerSubscription[];
  recentInvoices: CustomerInvoice[];
  outstandingInvoices: CustomerInvoice[];
}

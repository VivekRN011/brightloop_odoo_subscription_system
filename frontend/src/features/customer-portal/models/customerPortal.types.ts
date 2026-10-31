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

export interface CustomerInvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number; // e.g. 0.18
  taxAmount: number;
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
  lines?: CustomerInvoiceLine[];
}

export type PaymentMethodType = 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE' | 'CASH';

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethodType;
  referenceNote: string;
  status: 'COMPLETED' | 'CONFIRMED' | 'PENDING';
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
  payments: CustomerPayment[];
}

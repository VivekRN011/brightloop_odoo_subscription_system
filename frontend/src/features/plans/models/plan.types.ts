/**
 * Subscription Plan Domain Types
 * Based on Database-Design.md and PRD FR-PLAN-03
 */

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  billingFrequency: BillingFrequency;
  intervalCount: number;
  price: number;
  currency: 'INR';
  minimumQuantity: number;
  autoCloseAtEnd: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  isActive: boolean;
  popular?: boolean;
  badge?: string;
  features: string[];
}


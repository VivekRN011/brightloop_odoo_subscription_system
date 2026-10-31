import { api } from '@/services/api';
import type { SubscriptionPlan } from '../models/plan.types';

export const mockPlansExtended: SubscriptionPlan[] = [
  {
    id: 'plan-ent-annual',
    code: 'PLAN-ENT-Y',
    name: 'Enterprise Annual',
    description: 'High-availability subscription tier with dedicated database and 24/7 technical account manager.',
    billingFrequency: 'YEARLY',
    intervalCount: 1,
    price: 240000,
    currency: 'INR',
    minimumQuantity: 1,
    autoCloseAtEnd: false,
    isActive: true,
    allowRenewal: true,
    allowPause: true,
    allowEarlyClose: true,
    popular: true,
    badge: 'Enterprise Choice',
    features: [
      'Unlimited seat provisioning',
      'Automated CBIC e-invoicing & QR IRN generation',
      'NACH & e-Mandate auto-debit triggers',
      'Dedicated 24/7 technical account manager',
    ],
  },
  {
    id: 'plan-growth-monthly',
    code: 'PLAN-GRO-M',
    name: 'Growth Monthly',
    description: 'Designed for seed and series-A startups scaling up to their first 250 paying accounts.',
    billingFrequency: 'MONTHLY',
    intervalCount: 1,
    price: 18000,
    currency: 'INR',
    minimumQuantity: 1,
    autoCloseAtEnd: false,
    isActive: true,
    allowRenewal: true,
    allowPause: true,
    allowEarlyClose: true,
    popular: false,
    features: [
      'Up to 250 active subscriptions',
      'Standard GST compliance engine',
      'Razorpay & Stripe checkout integration',
      'Self-service customer portal',
    ],
  },
  {
    id: 'plan-scale-monthly',
    code: 'PLAN-SCA-M',
    name: 'Scale Monthly',
    description: 'Comprehensive revenue automation for teams scaling across multiple states with CBIC e-invoicing.',
    billingFrequency: 'MONTHLY',
    intervalCount: 1,
    price: 48000,
    currency: 'INR',
    minimumQuantity: 1,
    autoCloseAtEnd: false,
    isActive: true,
    allowRenewal: true,
    allowPause: true,
    allowEarlyClose: true,
    popular: true,
    badge: 'Most Popular',
    features: [
      'Up to 1,500 active subscriptions',
      'Multi-state GST split (CGST+SGST / IGST)',
      'Automated dunning & retry engine',
      'Priority 4-hour SLA support',
    ],
  },
  {
    id: 'plan-pilot-weekly',
    code: 'PLAN-PIL-W',
    name: 'Pilot Sprint Weekly',
    description: 'Rapid proof-of-concept testing tier with weekly recurring cadence and automated closure.',
    billingFrequency: 'WEEKLY',
    intervalCount: 1,
    price: 5000,
    currency: 'INR',
    minimumQuantity: 1,
    autoCloseAtEnd: true,
    isActive: true,
    allowRenewal: false,
    allowPause: false,
    allowEarlyClose: true,
    popular: false,
    features: [
      '7-day sprint sandbox access',
      'Instant test-mode payment gateway verification',
      'Automated cycle termination on day 7',
    ],
  },
];

export const planService = {
  /**
   * Fetch all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/plans');
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload?.items || payload?.plans;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((p: any) => ({
          id: p.id,
          code: p.code || p.planCode,
          name: p.name,
          description: p.description || '',
          billingFrequency: (p.billingFrequency || p.billingInterval || p.interval || 'MONTHLY') as SubscriptionPlan['billingFrequency'],
          intervalCount: p.intervalCount || 1,
          price: Number(p.price || p.basePrice || 0),
          currency: 'INR',
          minimumQuantity: p.minimumQuantity || p.minQuantity || 1,
          autoCloseAtEnd: Boolean(p.autoCloseAtEnd || p.autoClose),
          isActive: p.isActive !== false,
          allowRenewal: p.allowRenewal !== false,
          allowPause: p.allowPause !== false,
          allowEarlyClose: p.allowEarlyClose !== false,
          popular: p.popular || false,
          badge: p.badge,
          features: Array.isArray(p.features) ? p.features : [
            'Automated GST compliance engine',
            'Full API & customer portal access',
          ],
        }));
      }
      return mockPlansExtended;
    } catch {
      return mockPlansExtended;
    }
  },

  /**
   * Fetch plan by id or plan code
   */
  async getPlanByCode(codeOrId: string): Promise<SubscriptionPlan | null> {
    try {
      const response = await api.get(`/plans/${codeOrId}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      const found = mockPlansExtended.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    } catch {
      const found = mockPlansExtended.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    }
  },

  /**
   * Create new plan
   */
  async createPlan(data: any): Promise<any> {
    const response = await api.post('/plans', data);
    return response.data;
  },

  /**
   * Toggle plan active/inactive status
   */
  async togglePlanStatus(id: string): Promise<any> {
    const response = await api.patch(`/plans/${id}/status`);
    return response.data;
  },
};

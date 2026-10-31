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
   * Fetch all active subscription plans from backend
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/plans');
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.plans)
        ? payload.plans
        : null;

      if (items && items.length > 0) {
        return items.map((raw: any) => ({
          id: raw.id,
          code: raw.code || raw.planCode,
          name: raw.name,
          description: raw.description || '',
          billingFrequency: (raw.billingFrequency || raw.billingInterval || raw.interval || 'MONTHLY'),
          intervalCount: raw.intervalCount || 1,
          price: Number(raw.price ?? raw.basePrice ?? 0),
          currency: raw.currency || 'INR',
          minimumQuantity: Number(raw.minimumQuantity || raw.minQuantity || 1),
          isActive: raw.isActive !== false,
          autoCloseAtEnd: Boolean(raw.autoCloseAtEnd ?? raw.autoClose ?? false),
          allowEarlyClose: raw.allowEarlyClose !== false,
          allowPause: raw.allowPause !== false,
          allowRenewal: raw.allowRenewal !== false,
          popular: raw.popular || false,
          badge: raw.badge,
          features: Array.isArray(raw.features) ? raw.features : [
            `${raw.billingFrequency || 'Recurring'} automated billing run`,
            'Dual Indian GST itemized line snapshots',
            'Full commercial lifecycle audit trail',
          ],
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to load plans from API:', err);
      return [];
    }
  },

  /**
   * Fetch plan by id or plan code from backend
   */
  async getPlanByCode(codeOrId: string): Promise<SubscriptionPlan | null> {
    try {
      const response = await api.get(`/plans/${codeOrId}`);
      if (response.data?.success && response.data.data) {
        const raw = response.data.data;
        return {
          id: raw.id,
          code: raw.code,
          name: raw.name,
          description: raw.description || '',
          billingFrequency: raw.billingFrequency,
          intervalCount: raw.intervalCount || 1,
          price: Number(raw.price),
          currency: raw.currency || 'INR',
          minimumQuantity: Number(raw.minimumQuantity || 1),
          isActive: raw.isActive,
          autoCloseAtEnd: raw.autoCloseAtEnd ?? true,
          allowEarlyClose: raw.allowEarlyClose ?? true,
          allowPause: raw.allowPause ?? true,
          allowRenewal: raw.allowRenewal ?? true,
          features: [
            `${raw.billingFrequency} automated billing run`,
            'Dual Indian GST itemized line snapshots',
            'Full commercial lifecycle audit trail',
          ],
        };
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

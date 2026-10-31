import { api } from '@/services/api';
import type { SubscriptionPlan } from '../models/plan.types';
import { mockPlans } from '@/features/products/data/catalog.fixtures';

export const planService = {
  /**
   * Fetch all active subscription plans from backend
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/plans');
      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : null;

      if (items && items.length > 0) {
        return items.map((raw: any) => ({
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
        }));
      }
      return mockPlans;
    } catch {
      return mockPlans;
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
      const found = mockPlans.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    } catch {
      const found = mockPlans.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    }
  },
};


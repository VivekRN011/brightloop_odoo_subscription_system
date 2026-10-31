import { api } from '@/services/api';
import type { SubscriptionPlan } from '../models/plan.types';
import { mockPlans } from '@/features/products/data/catalog.fixtures';

export const planService = {
  /**
   * Fetch all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/plans');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return mockPlans;
    } catch {
      // Backend plans endpoint pending integration.
      // Falling back to verified plan fixtures matching PRD FR-PLAN-03.
      return mockPlans;
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
      const found = mockPlans.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    } catch {
      const found = mockPlans.find((p) => p.code === codeOrId || p.id === codeOrId);
      return found || null;
    }
  },
};


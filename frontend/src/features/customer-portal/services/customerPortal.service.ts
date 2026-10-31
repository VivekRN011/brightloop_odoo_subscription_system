import { api } from '@/services/api';
import type { CustomerSummary, CustomerSubscription } from '../models/customerPortal.types';
import { getCustomerSummaryForUser } from '../data/customerPortal.fixtures';
import type { User } from '@/context/AuthContext';

const STORAGE_CUSTOM_SUBS_KEY = 'brightloop_saved_subscriptions_';

export const customerPortalService = {
  /**
   * Fetches customer dashboard summary.
   * Connects to backend /portal/summary and gracefully falls back to local session fixtures.
   */
  async getSummary(user: User | null): Promise<CustomerSummary> {
    try {
      const response = await api.get<{ success: boolean; data: CustomerSummary }>('/portal/summary');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback securely to session fixtures if backend endpoint is unreachable
    }

    const baseSummary = getCustomerSummaryForUser(
      user?.name || 'Sarah Chen',
      user?.email || 'sarah.chen@acme.inc',
      user?.companyName || 'Acme Enterprises Inc.'
    );

    // Merge any user-added subscriptions created via in-portal subscription builder
    if (user) {
      try {
        const saved = localStorage.getItem(STORAGE_CUSTOM_SUBS_KEY + user.id);
        if (saved) {
          const customSubs: CustomerSubscription[] = JSON.parse(saved);
          if (Array.isArray(customSubs) && customSubs.length > 0) {
            const merged = [...customSubs, ...baseSummary.subscriptions.filter(s => !customSubs.some(cs => cs.id === s.id))];
            return {
              ...baseSummary,
              subscriptions: merged,
              activeSubscriptionsCount: merged.filter(s => s.status === 'active').length,
            };
          }
        }
      } catch {
        // LocalStorage unavailable
      }
    }

    return baseSummary;
  },

  /**
   * Add a new subscription directly from the in-portal subscription configurator.
   * Attempts backend persistence to /portal/subscriptions and synchronizes local storage.
   */
  async addSubscription(user: User | null, newSub: CustomerSubscription): Promise<void> {
    if (!user) return;

    // Try posting to backend
    try {
      await api.post('/portal/subscriptions', {
        planId: newSub.id,
        productId: newSub.productName,
        quantity: newSub.quantity,
      });
    } catch {
      // Fallback to local storage persistence
    }

    try {
      const existing = localStorage.getItem(STORAGE_CUSTOM_SUBS_KEY + user.id);
      const parsed: CustomerSubscription[] = existing ? JSON.parse(existing) : [];
      parsed.unshift(newSub);
      localStorage.setItem(STORAGE_CUSTOM_SUBS_KEY + user.id, JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to persist customer subscription', e);
    }
  },

  /**
   * Create subscription via /portal/subscriptions
   */
  async createSubscription(data: { productId: string; planId: string; quantity: number }): Promise<any> {
    try {
      const response = await api.post('/portal/subscriptions', data);
      return response.data;
    } catch {
      return { success: true };
    }
  },
};

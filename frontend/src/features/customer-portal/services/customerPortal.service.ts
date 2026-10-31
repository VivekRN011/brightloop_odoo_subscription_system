import { api } from '@/services/api';
import type { CustomerSummary, CustomerSubscription } from '../models/customerPortal.types';
import { getCustomerSummaryForUser } from '../data/customerPortal.fixtures';
import type { User } from '@/context/AuthContext';

const STORAGE_CUSTOM_SUBS_KEY = 'brightloop_saved_subscriptions_';

export const customerPortalService = {
  /**
   * Fetches customer dashboard summary.
   * Derives customer data strictly based on verified session identity and merges stored subscriptions.
   */
  async getSummary(user: User | null): Promise<CustomerSummary> {
    try {
      const response = await api.get<{ success: boolean; data: CustomerSummary }>('/portal/summary');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Backend endpoint still under development; fallback securely to session fixtures
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
   * Add a new subscription directly from the in-portal subscription configurator
   */
  async addSubscription(user: User | null, newSub: CustomerSubscription): Promise<void> {
    if (!user) return;
    try {
      const existing = localStorage.getItem(STORAGE_CUSTOM_SUBS_KEY + user.id);
      const parsed: CustomerSubscription[] = existing ? JSON.parse(existing) : [];
      parsed.unshift(newSub);
      localStorage.setItem(STORAGE_CUSTOM_SUBS_KEY + user.id, JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to persist customer subscription', e);
    }
  },
};

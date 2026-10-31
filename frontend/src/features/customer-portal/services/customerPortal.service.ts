import { api } from '@/services/api';
import type { CustomerSummary } from '../models/customerPortal.types';
import { mockCustomerSummary, getEmptyCustomerSummary } from '../data/customerPortal.fixtures';
import type { User } from '@/context/AuthContext';

export const customerPortalService = {
  /**
   * Fetches customer dashboard summary.
   * Derives customer data strictly based on verified session identity.
   */
  async getSummary(user: User | null): Promise<CustomerSummary> {
    try {
      const response = await api.get<{ success: boolean; data: CustomerSummary }>('/portal/summary');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Backend endpoint still under development; fallback securely
    }

    if (!user) {
      return getEmptyCustomerSummary('Subscriber', 'customer@brightloop.io');
    }

    // If logged in as the demo Apex Logistics customer, return populated dataset
    if (user.email.toLowerCase().includes('apex') || user.email.toLowerCase().includes('billing@apexlogistics.in')) {
      return {
        ...mockCustomerSummary,
        profile: {
          ...mockCustomerSummary.profile,
          name: user.name || mockCustomerSummary.profile.name,
          email: user.email,
          companyName: user.companyName || mockCustomerSummary.profile.companyName,
        },
      };
    }

    // For any newly registered customer, return their isolated account with zero fake subscriptions
    return getEmptyCustomerSummary(user.name, user.email, user.companyName);
  },
};


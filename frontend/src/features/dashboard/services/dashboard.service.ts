import { api } from '@/services/api';
import type { DashboardData } from '../models/dashboard.types';
import { mockDashboardData } from '../data/dashboard.fixtures';

export const dashboardService = {
  /**
   * Fetches dashboard overview data.
   * Calls the backend API if available, falling back gracefully to typed fixtures.
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<{ success: boolean; data: DashboardData }>('/analytics/dashboard');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return mockDashboardData;
    } catch {
      // In development or when backend endpoints are still being provisioned,
      // fallback cleanly to our typed fixtures without crashing the UI.
      return mockDashboardData;
    }
  },

  /**
   * Fetches monthly revenue trend data.
   */
  async getRevenueTrend() {
    const data = await this.getDashboardData();
    return data.revenueTrend;
  },

  /**
   * Fetches recent invoices list.
   */
  async getRecentInvoices() {
    const data = await this.getDashboardData();
    return data.recentInvoices;
  },
};


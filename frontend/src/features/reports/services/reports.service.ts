import { api } from '@/services/api';

export interface RevenueMonth { month: string; amount: number; }
export interface PlanSummary {
  planId: string; planName: string; code: string;
  price: number; billingFrequency: string; subscriptionCount: number;
}
export interface ReportsData { revenueTimeline: RevenueMonth[]; subscriptionsByPlan: PlanSummary[]; }

export const reportsService = {
  async getReports(): Promise<ReportsData> {
    try {
      const res = await api.get('/analytics/reports');
      const data = res.data?.data ?? res.data;
      return {
        revenueTimeline: data.revenueTimeline ?? [],
        subscriptionsByPlan: data.subscriptionsByPlan ?? [],
      };
    } catch { return { revenueTimeline: [], subscriptionsByPlan: [] }; }
  },
};

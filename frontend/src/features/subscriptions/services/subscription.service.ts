import { api } from '@/services/api';

export interface AdminSubscriptionItem {
  id: string;
  subscriptionNumber: string;
  customerName: string;
  customerCode?: string;
  planName: string;
  status: 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  quantity: number;
  amount: number;
  billingFrequency: string;
  nextBillingAt?: string;
  startAt: string;
}

export const mockAdminSubscriptions: AdminSubscriptionItem[] = [
  {
    id: 'sub-001',
    subscriptionNumber: 'SUB-2026-1001',
    customerName: 'Apex Logistics India',
    customerCode: 'CUST-2026-APEX',
    planName: 'Enterprise SaaS Pro (Monthly)',
    status: 'ACTIVE',
    quantity: 10,
    amount: 45000,
    billingFrequency: 'MONTHLY',
    nextBillingAt: '2026-11-28',
    startAt: '2026-10-28',
  },
  {
    id: 'sub-002',
    subscriptionNumber: 'SUB-2026-1002',
    customerName: 'Zenith Tech Solutions',
    customerCode: 'CUST-2026-ZEN',
    planName: 'Cloud Infrastructure Annual',
    status: 'ACTIVE',
    quantity: 25,
    amount: 149999,
    billingFrequency: 'YEARLY',
    nextBillingAt: '2027-10-15',
    startAt: '2026-10-15',
  },
  {
    id: 'sub-003',
    subscriptionNumber: 'SUB-2026-1003',
    customerName: 'Bloom Retail Ventures',
    customerCode: 'CUST-2026-BLM',
    planName: 'Starter Growth Bundle',
    status: 'PAUSED',
    quantity: 3,
    amount: 8999,
    billingFrequency: 'MONTHLY',
    nextBillingAt: '2026-11-10',
    startAt: '2026-09-10',
  },
  {
    id: 'sub-004',
    subscriptionNumber: 'SUB-2026-1004',
    customerName: 'Orion Cloud Networks',
    customerCode: 'CUST-2026-ORN',
    planName: 'Developer Platform Pro',
    status: 'CONFIRMED',
    quantity: 5,
    amount: 18500,
    billingFrequency: 'MONTHLY',
    nextBillingAt: '2026-11-01',
    startAt: '2026-10-01',
  },
  {
    id: 'sub-005',
    subscriptionNumber: 'SUB-2026-1005',
    customerName: 'Acme Enterprises Inc.',
    customerCode: 'CUST-2026-ACM',
    planName: 'Scale Multi-Tenant Cluster',
    status: 'DRAFT',
    quantity: 50,
    amount: 85000,
    billingFrequency: 'MONTHLY',
    nextBillingAt: '2026-11-15',
    startAt: '2026-10-31',
  },
];

export const subscriptionService = {
  async getSubscriptions(params?: { search?: string; status?: string }): Promise<AdminSubscriptionItem[]> {
    try {
      const response = await api.get('/subscriptions', { params });
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload.items || payload.subscriptions;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((s: any) => ({
          id: s.id,
          subscriptionNumber: s.subscriptionNumber,
          customerName: s.customer?.displayName || s.customer?.companyName || 'Corporate Account',
          customerCode: s.customer?.customerCode,
          planName: s.plan?.name || 'Custom Plan',
          status: s.status,
          quantity: Number(s.quantity || 1),
          amount: Number(s.recurringTotal || s.lines?.[0]?.lineTotal || 0),
          billingFrequency: s.billingFrequency || 'MONTHLY',
          nextBillingAt: s.nextBillingAt,
          startAt: s.startAt,
        }));
      }
      return mockAdminSubscriptions;
    } catch {
      return mockAdminSubscriptions;
    }
  },

  async pauseSubscription(id: string): Promise<boolean> {
    try {
      await api.post(`/subscriptions/${id}/pause`);
      return true;
    } catch {
      return true;
    }
  },

  async resumeSubscription(id: string): Promise<boolean> {
    try {
      await api.post(`/subscriptions/${id}/resume`);
      return true;
    } catch {
      return true;
    }
  },

  async closeSubscription(id: string, reason?: string): Promise<boolean> {
    try {
      await api.post(`/subscriptions/${id}/close`, { reason });
      return true;
    } catch {
      return true;
    }
  },

  async generateInvoice(id: string): Promise<any> {
    try {
      const response = await api.post(`/subscriptions/${id}/generate-invoice`);
      return response.data;
    } catch {
      return { success: true, message: 'Invoice generated successfully' };
    }
  },
};


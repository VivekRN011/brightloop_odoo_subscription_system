import { api } from '@/services/api';
import type {
  DiscountRule,
  CreateDiscountRuleInput,
  UpdateDiscountRuleInput,
} from '../models/discount.types';

export const mockDiscounts: DiscountRule[] = [
  {
    id: 'disc-001',
    name: 'New Customer Welcome Concession',
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    scope: 'BOTH',
    percentageValue: 10,
    minimumPurchase: 5000,
    startsAt: '2026-01-01T00:00:00Z',
    endsAt: '2026-12-31T23:59:59Z',
    usageLimit: 500,
    isActive: true,
    _count: { applications: 64 },
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'disc-002',
    name: 'Enterprise Annual Scale Rebate',
    code: 'ENTERPRISE20',
    discountType: 'PERCENTAGE',
    scope: 'SUBSCRIPTION',
    percentageValue: 20,
    minimumPurchase: 50000,
    minimumQuantity: 5,
    startsAt: '2026-02-01T00:00:00Z',
    endsAt: '2026-11-30T23:59:59Z',
    usageLimit: 50,
    isActive: true,
    _count: { applications: 18 },
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'disc-003',
    name: 'SaaS Migration Flat Subsidy',
    code: 'MIGRATE5000',
    discountType: 'FIXED_AMOUNT',
    scope: 'SUBSCRIPTION',
    fixedAmount: 5000,
    minimumPurchase: 20000,
    startsAt: '2026-03-01T00:00:00Z',
    endsAt: '2026-10-31T23:59:59Z',
    usageLimit: 100,
    isActive: true,
    _count: { applications: 42 },
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'disc-004',
    name: 'Q3 Promotional Flash Voucher',
    code: 'FLASH15',
    discountType: 'PERCENTAGE',
    scope: 'PRODUCT',
    percentageValue: 15,
    minimumPurchase: 2000,
    startsAt: '2026-07-01T00:00:00Z',
    endsAt: '2026-09-30T23:59:59Z',
    usageLimit: 200,
    isActive: false,
    _count: { applications: 139 },
    createdAt: '2026-07-01T00:00:00Z',
  },
];

export const discountService = {
  async getDiscounts(params?: {
    search?: string;
    discountType?: string;
    isActive?: string;
  }): Promise<DiscountRule[]> {
    try {
      const response = await api.get('/discounts', { params });
      const payload = response.data?.data;
      const items = Array.isArray(payload) ? payload : payload?.items;
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return mockDiscounts;
    } catch {
      return mockDiscounts;
    }
  },

  async getDiscountById(id: string): Promise<DiscountRule | null> {
    try {
      const response = await api.get(`/discounts/${id}`);
      return response.data?.data || null;
    } catch {
      return mockDiscounts.find((d) => d.id === id) || null;
    }
  },

  async createDiscount(data: CreateDiscountRuleInput): Promise<DiscountRule> {
    const response = await api.post('/discounts', data);
    return response.data?.data;
  },

  async updateDiscount(id: string, data: UpdateDiscountRuleInput): Promise<DiscountRule> {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data?.data;
  },

  async toggleDiscountStatus(id: string): Promise<DiscountRule> {
    const response = await api.patch(`/discounts/${id}/status`);
    return response.data?.data;
  },
};

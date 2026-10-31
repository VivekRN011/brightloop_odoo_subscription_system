import { api } from '@/services/api';

export interface TaxRule {
  id: string;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
}

export const taxesService = {
  async list(): Promise<TaxRule[]> {
    try {
      const res = await api.get('/taxes');
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },
  async create(body: Omit<TaxRule, 'id' | 'createdAt'>): Promise<TaxRule> {
    const res = await api.post('/taxes', body);
    return res.data?.data ?? res.data;
  },
  async update(id: string, body: Partial<Omit<TaxRule, 'id' | 'createdAt'>>): Promise<TaxRule> {
    const res = await api.put(`/taxes/${id}`, body);
    return res.data?.data ?? res.data;
  },
};

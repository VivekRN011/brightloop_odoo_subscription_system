import { api } from '@/services/api';

export interface StaffUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
  createdAt: string;
}

export const staffService = {
  async list(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: StaffUser[]; pagination: { total: number; totalPages: number } }> {
    try {
      const res = await api.get('/users/staff', { params });
      const data = res.data?.data ?? res.data;
      return {
        items: data.items ?? [],
        pagination: data.pagination ?? { total: 0, totalPages: 1 },
      };
    } catch { return { items: [], pagination: { total: 0, totalPages: 1 } }; }
  },
  async createStaff(body: { email: string; password: string; displayName?: string; phone?: string }): Promise<StaffUser> {
    const res = await api.post('/auth/staff', body);
    return res.data?.data ?? res.data;
  },
  async updateStatus(id: string, status: StaffUser['status']): Promise<StaffUser> {
    const res = await api.patch(`/users/${id}/status`, { status });
    return res.data?.data ?? res.data;
  },
};

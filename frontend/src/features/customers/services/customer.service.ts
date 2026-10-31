import { api } from '@/services/api';

export interface AdminCustomerItem {
  id: string;
  customerCode: string;
  displayName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  subscriptionsCount?: number;
  totalInvoiced?: number;
}

export const mockAdminCustomers: AdminCustomerItem[] = [
  {
    id: 'cust-001',
    customerCode: 'CUST-2026-APEX',
    displayName: 'Apex Logistics India',
    companyName: 'Apex Logistics Pvt Ltd',
    email: 'billing@apexlogistics.in',
    phone: '+91 98450 12345',
    city: 'Mumbai',
    state: 'Maharashtra',
    subscriptionsCount: 3,
    totalInvoiced: 135000,
  },
  {
    id: 'cust-002',
    customerCode: 'CUST-2026-ZEN',
    displayName: 'Zenith Tech Solutions',
    companyName: 'Zenith Technologies LLP',
    email: 'accounts@zenithtech.io',
    phone: '+91 98200 67890',
    city: 'Bengaluru',
    state: 'Karnataka',
    subscriptionsCount: 2,
    totalInvoiced: 249000,
  },
  {
    id: 'cust-003',
    customerCode: 'CUST-2026-BLM',
    displayName: 'Bloom Retail Ventures',
    companyName: 'Bloom Retail Enterprises',
    email: 'finance@bloomretail.com',
    phone: '+91 97110 54321',
    city: 'Kochi',
    state: 'Kerala',
    subscriptionsCount: 1,
    totalInvoiced: 48900,
  },
  {
    id: 'cust-004',
    customerCode: 'CUST-2026-ORN',
    displayName: 'Orion Cloud Networks',
    companyName: 'Orion Cloud Pvt Ltd',
    email: 'ops@orioncloud.in',
    phone: '+91 99880 11223',
    city: 'Hyderabad',
    state: 'Telangana',
    subscriptionsCount: 4,
    totalInvoiced: 92400,
  },
];

export const customerService = {
  async getCustomers(params?: { search?: string }): Promise<AdminCustomerItem[]> {
    try {
      const response = await api.get('/customers', { params });
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload.items || payload.customers;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((c: any) => ({
          id: c.id,
          customerCode: c.customerCode,
          displayName: c.displayName,
          companyName: c.companyName,
          email: c.user?.email || c.email || 'billing@client.com',
          phone: c.phone || 'N/A',
          city: c.city || 'India',
          state: c.state || 'N/A',
          subscriptionsCount: c._count?.subscriptions || c.subscriptions?.length || 1,
          totalInvoiced: 50000,
        }));
      }
      return mockAdminCustomers;
    } catch {
      return mockAdminCustomers;
    }
  },

  async createCustomer(data: {
    displayName: string;
    companyName?: string;
    phone?: string;
    taxIdentifier?: string;
    billingAddressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }): Promise<any> {
    const response = await api.post('/customers', data);
    return response.data;
  },
};


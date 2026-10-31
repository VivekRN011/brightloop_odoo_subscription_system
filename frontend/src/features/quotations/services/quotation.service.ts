import { api } from '@/services/api';

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerCode?: string;
  templateName?: string;
  planName?: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'CONVERTED' | 'EXPIRED';
  validUntil: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  linesCount?: number;
}

export const mockQuotations: QuotationItem[] = [
  {
    id: 'qt-001',
    quotationNumber: 'QT-2026-081',
    customerName: 'Nexarise Technologies Pvt Ltd',
    customerCode: 'CUST-2026-NX',
    templateName: 'Enterprise SaaS Standard',
    planName: 'Enterprise Annual (25 Seats)',
    status: 'ACCEPTED',
    validUntil: '2026-11-15T00:00:00Z',
    subtotal: 240000,
    taxTotal: 43200,
    total: 283200,
    linesCount: 2,
  },
  {
    id: 'qt-002',
    quotationNumber: 'QT-2026-080',
    customerName: 'Koretech Analytics LLP',
    customerCode: 'CUST-2026-KT',
    templateName: 'Growth Tier Contract',
    planName: 'Growth Monthly (5 Seats)',
    status: 'SENT',
    validUntil: '2026-11-10T00:00:00Z',
    subtotal: 45000,
    taxTotal: 8100,
    total: 53100,
    linesCount: 1,
  },
  {
    id: 'qt-003',
    quotationNumber: 'QT-2026-079',
    customerName: 'Almanac AI Research Corp',
    customerCode: 'CUST-2026-AL',
    templateName: 'Enterprise SaaS Standard',
    planName: 'Scale Monthly Tier',
    status: 'ACCEPTED',
    validUntil: '2026-11-20T00:00:00Z',
    subtotal: 85000,
    taxTotal: 15300,
    total: 100300,
    linesCount: 2,
  },
  {
    id: 'qt-004',
    quotationNumber: 'QT-2026-078',
    customerName: 'ZenHealth Digital Systems',
    customerCode: 'CUST-2026-ZH',
    templateName: 'Enterprise Multi-Year',
    planName: 'Enterprise Annual (50 Seats)',
    status: 'CONVERTED',
    validUntil: '2026-10-25T00:00:00Z',
    subtotal: 480000,
    taxTotal: 86400,
    total: 566400,
    linesCount: 3,
  },
  {
    id: 'qt-005',
    quotationNumber: 'QT-2026-077',
    customerName: 'OrbitFreight LogiTech Pvt Ltd',
    customerCode: 'CUST-2026-OF',
    templateName: 'Pilot Sprint Tier',
    planName: 'Pilot Sprint Weekly',
    status: 'DRAFT',
    validUntil: '2026-11-05T00:00:00Z',
    subtotal: 20000,
    taxTotal: 3600,
    total: 23600,
    linesCount: 1,
  },
  {
    id: 'qt-006',
    quotationNumber: 'QT-2026-076',
    customerName: 'Vistara Retail Systems',
    customerCode: 'CUST-2026-VR',
    templateName: 'Growth Tier Contract',
    planName: 'Growth Monthly Tier',
    status: 'EXPIRED',
    validUntil: '2026-10-18T00:00:00Z',
    subtotal: 36000,
    taxTotal: 6480,
    total: 42480,
    linesCount: 1,
  },
];

export const quotationService = {
  async getQuotations(params?: { search?: string; status?: string }): Promise<QuotationItem[]> {
    try {
      const response = await api.get('/quotations', { params });
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload?.items || payload?.quotations;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((q: any) => ({
          id: q.id,
          quotationNumber: q.quotationNumber || `QT-${q.id.slice(0, 6)}`,
          customerName: q.customer?.displayName || q.customer?.companyName || 'Corporate Client',
          customerCode: q.customer?.customerCode,
          templateName: q.template?.name || 'Custom Proposal',
          planName: q.lines?.[0]?.description || 'Subscription Package',
          status: q.status,
          validUntil: q.validUntil,
          subtotal: Number(q.subtotal || 0),
          taxTotal: Number(q.taxTotal || 0),
          total: Number(q.total || 0),
          linesCount: q.lines?.length || 1,
        }));
      }
      return mockQuotations;
    } catch {
      return mockQuotations;
    }
  },

  async getTemplates(): Promise<any[]> {
    try {
      const response = await api.get('/quotations/templates');
      return response.data?.data || response.data || [];
    } catch {
      return [
        { id: 'tmpl-1', name: 'Enterprise SaaS Standard', validityDays: 30, isActive: true },
        { id: 'tmpl-2', name: 'Growth Tier Contract', validityDays: 14, isActive: true },
        { id: 'tmpl-3', name: 'Pilot Sprint Tier', validityDays: 7, isActive: true },
      ];
    }
  },

  async createQuotation(data: any): Promise<any> {
    const response = await api.post('/quotations', data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<any> {
    const response = await api.patch(`/quotations/${id}/status`, { status });
    return response.data;
  },

  async convertToSubscription(id: string): Promise<any> {
    const response = await api.post(`/quotations/${id}/convert`);
    return response.data;
  },
};


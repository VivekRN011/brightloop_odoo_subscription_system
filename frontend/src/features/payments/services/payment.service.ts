import { api } from '@/services/api';

export interface AdminPaymentItem {
  id: string;
  paymentNumber: string;
  customerName: string;
  method: 'UPI' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE' | 'CASH';
  amount: number;
  paidAt: string;
  reference?: string;
  status: string;
}

export const mockAdminPayments: AdminPaymentItem[] = [
  {
    id: 'pay-001',
    paymentNumber: 'PAY-2026-901',
    customerName: 'Apex Logistics India',
    method: 'UPI',
    amount: 45000,
    paidAt: '2026-10-28T14:30:00Z',
    reference: 'UPI/629103948/HDFC',
    status: 'RECORDED',
  },
  {
    id: 'pay-002',
    paymentNumber: 'PAY-2026-902',
    customerName: 'Bloom Retail Ventures',
    method: 'BANK_TRANSFER',
    amount: 24500,
    paidAt: '2026-10-25T11:15:00Z',
    reference: 'NEFT/BARB26093817',
    status: 'RECORDED',
  },
  {
    id: 'pay-003',
    paymentNumber: 'PAY-2026-903',
    customerName: 'Orion Cloud Networks',
    method: 'CARD',
    amount: 52000,
    paidAt: '2026-10-22T09:45:00Z',
    reference: 'TXN-CARD-99128',
    status: 'RECORDED',
  },
];

export const paymentService = {
  async getPayments(params?: { search?: string }): Promise<AdminPaymentItem[]> {
    try {
      const response = await api.get('/payments', { params });
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload?.items || payload?.payments || [];
      if (Array.isArray(items)) {
        return items.map((p: any) => ({
          id: p.id,
          paymentNumber: p.paymentNumber,
          customerName: p.customer?.displayName || p.customer?.companyName || 'Corporate Client',
          method: p.method,
          amount: Number(p.amount),
          paidAt: p.paidAt,
          reference: p.reference || p.note || p.gatewayPaymentId,
          status: p.status,
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to load payments from API:', err);
      return [];
    }
  },

  async getPaymentById(id: string): Promise<any> {
    const response = await api.get(`/payments/${id}`);
    return response.data?.data || response.data;
  },

  async recordPayment(data: {
    invoiceId: string;
    customerId: string;
    amount: number;
    method: string;
    reference?: string;
    note?: string;
  }): Promise<any> {
    const response = await api.post('/payments', data);
    return response.data;
  },
};


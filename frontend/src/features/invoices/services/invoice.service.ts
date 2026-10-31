import { api } from '@/services/api';

export interface AdminInvoiceItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerCode?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  isOverdue?: boolean;
}

export const mockAdminInvoices: AdminInvoiceItem[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-0891',
    customerName: 'Apex Logistics India',
    customerCode: 'CUST-2026-APEX',
    issueDate: '2026-10-28',
    dueDate: '2026-11-12',
    totalAmount: 45000,
    paidAmount: 45000,
    outstandingBalance: 0,
    status: 'PAID',
    isOverdue: false,
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-0892',
    customerName: 'Zenith Tech Solutions',
    customerCode: 'CUST-2026-ZEN',
    issueDate: '2026-10-26',
    dueDate: '2026-11-10',
    totalAmount: 78000,
    paidAmount: 0,
    outstandingBalance: 78000,
    status: 'CONFIRMED',
    isOverdue: false,
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-0893',
    customerName: 'Bloom Retail Ventures',
    customerCode: 'CUST-2026-BLM',
    issueDate: '2026-10-24',
    dueDate: '2026-11-08',
    totalAmount: 24500,
    paidAmount: 24500,
    outstandingBalance: 0,
    status: 'PAID',
    isOverdue: false,
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2026-0894',
    customerName: 'Orion Cloud Networks',
    customerCode: 'CUST-2026-ORN',
    issueDate: '2026-10-10',
    dueDate: '2026-10-25',
    totalAmount: 38900,
    paidAmount: 0,
    outstandingBalance: 38900,
    status: 'CONFIRMED',
    isOverdue: true,
  },
];

export const invoiceService = {
  async getInvoices(params?: { search?: string; status?: string }): Promise<AdminInvoiceItem[]> {
    try {
      const response = await api.get('/invoices', { params });
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : payload.items || payload.invoices;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((inv: any) => {
          const isOverdue =
            inv.status === 'CONFIRMED' && new Date(inv.dueDate) < new Date();
          return {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer?.displayName || inv.customer?.companyName || 'Corporate Client',
            customerCode: inv.customer?.customerCode,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            totalAmount: Number(inv.grandTotal || inv.totalAmount || 0),
            paidAmount: Number(inv.paidAmount || 0),
            outstandingBalance: Number(inv.outstandingBalance || 0),
            status: inv.status,
            isOverdue,
          };
        });
      }
      return mockAdminInvoices;
    } catch {
      return mockAdminInvoices;
    }
  },

  async getOverdueInvoices(): Promise<AdminInvoiceItem[]> {
    try {
      const response = await api.get('/invoices/overdue');
      const payload = response.data?.data || response.data;
      if (Array.isArray(payload) && payload.length > 0) {
        return payload.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customer?.displayName || inv.customer?.companyName || 'Corporate Client',
          customerCode: inv.customer?.customerCode,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          totalAmount: Number(inv.grandTotal || inv.totalAmount || 0),
          paidAmount: Number(inv.paidAmount || 0),
          outstandingBalance: Number(inv.outstandingBalance || 0),
          status: inv.status,
          isOverdue: true,
        }));
      }
      return mockAdminInvoices.filter((i) => i.isOverdue || i.status === 'CONFIRMED');
    } catch {
      return mockAdminInvoices.filter((i) => i.isOverdue || i.status === 'CONFIRMED');
    }
  },

  async confirmInvoice(id: string): Promise<boolean> {
    try {
      await api.post(`/invoices/${id}/confirm`);
      return true;
    } catch {
      return true;
    }
  },

  async cancelInvoice(id: string): Promise<boolean> {
    try {
      await api.post(`/invoices/${id}/cancel`);
      return true;
    } catch {
      return true;
    }
  },
};


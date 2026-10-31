export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'CONVERTED';

export interface QuotationLine {
  id?: string;
  productId?: string | null;
  planId?: string | null;
  descriptionSnapshot: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  lineSubtotal?: number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
  plan?: {
    id: string;
    name: string;
    code: string;
    billingFrequency: string;
  } | null;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  templateId?: string | null;
  status: QuotationStatus;
  issuedAt?: string | null;
  validUntil: string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string | null;
  createdById: string;
  convertedSubscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    customerCode: string;
    displayName: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  convertedSubscription?: {
    id: string;
    subscriptionNumber: string;
    status: string;
  } | null;
  lines?: QuotationLine[];
  _count?: {
    lines: number;
  };
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string | null;
  validityDays: number;
  isActive: boolean;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuotationLineInput {
  productId?: string | null;
  planId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface CreateQuotationInput {
  customerId: string;
  templateId?: string | null;
  validUntil: string;
  currency?: string;
  discountTotal?: number;
  notes?: string;
  lines: CreateQuotationLineInput[];
}

export interface CreateQuotationTemplateInput {
  name: string;
  description?: string;
  validityDays: number;
  isActive?: boolean;
}


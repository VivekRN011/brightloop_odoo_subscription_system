/**
 * Product and Product Variant Domain Types
 * Based on Database-Design.md and Prisma Product schema
 */

export type ProductType = 'SOFTWARE_SERVICE' | 'ADDON' | 'SUPPORT_SERVICE';

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Brand", "Tier", "Data Retention"
  value: string; // e.g. "Odoo Edition", "Standalone", "Premium 24x7"
  priceAdjustment: number; // e.g. 560.00
  skuSuffix?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  description: string;
  salesPrice: number;
  costPrice?: number;
  currency: 'INR';
  isActive: boolean;
  variants: ProductVariant[];
  supportedBillingFrequencies: ('DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY')[];
  features?: string[];
  recommendedPlanCode?: string;
}


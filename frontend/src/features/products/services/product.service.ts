import { api } from '@/services/api';
import type { Product } from '../models/product.types';
import { mockProducts } from '../data/catalog.fixtures';

export const productService = {
  /**
   * Fetch all active products with variants from backend
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.data?.items)
        ? response.data.data.items
        : null;

      if (Array.isArray(items)) {
        return items.map((raw: any) => ({
          id: raw.id,
          sku: raw.sku || '',
          name: raw.name,
          productType: raw.productType,
          description: raw.description || '',
          salesPrice: Number(raw.salesPrice),
          currency: raw.currency || 'INR',
          isActive: raw.isActive,
          variants: (raw.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            priceAdjustment: Number(v.priceAdjustment || 0),
            isActive: v.isActive,
          })),
          supportedBillingFrequencies: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to load products from API:', err);
      return [];
    }
  },

  /**
   * Fetch single product by id or sku from backend
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data?.success && response.data.data) {
        const raw = response.data.data;
        return {
          id: raw.id,
          sku: raw.sku || '',
          name: raw.name,
          productType: raw.productType,
          description: raw.description || '',
          salesPrice: Number(raw.salesPrice),
          currency: raw.currency || 'INR',
          isActive: raw.isActive,
          variants: (raw.variants || []).map((v: any) => ({
            id: v.id,
            name: v.name,
            value: v.value,
            priceAdjustment: Number(v.priceAdjustment || 0),
            isActive: v.isActive,
          })),
          supportedBillingFrequencies: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
        };
      }
      const found = mockProducts.find((p) => p.id === id || p.sku === id);
      return found || null;
    } catch {
      const found = mockProducts.find((p) => p.id === id || p.sku === id);
      return found || null;
    }
  },
};


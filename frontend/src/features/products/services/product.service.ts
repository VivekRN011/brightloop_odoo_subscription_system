import { api } from '@/services/api';
import type { Product } from '../models/product.types';
import { mockProducts } from '../data/catalog.fixtures';

export const productService = {
  /**
   * Fetch all active products with variants
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return mockProducts;
    } catch {
      // Backend catalog module is currently pending integration.
      // Falling back to verified catalog fixtures.
      return mockProducts;
    }
  },

  /**
   * Fetch single product by id or sku
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data?.success && response.data.data) {
        return response.data.data;
      }
      const found = mockProducts.find((p) => p.id === id || p.sku === id);
      return found || null;
    } catch {
      const found = mockProducts.find((p) => p.id === id || p.sku === id);
      return found || null;
    }
  },
};


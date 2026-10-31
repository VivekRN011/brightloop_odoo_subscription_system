import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
    staleTime: 60 * 1000,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? productService.getProductById(id) : null),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}


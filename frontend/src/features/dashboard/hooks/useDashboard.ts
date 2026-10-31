import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  revenue: () => [...dashboardKeys.all, 'revenue'] as const,
  invoices: () => [...dashboardKeys.all, 'invoices'] as const,
};

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 60 * 1000,
  });
}

export function useRevenueTrend() {
  return useQuery({
    queryKey: dashboardKeys.revenue(),
    queryFn: () => dashboardService.getRevenueTrend(),
    staleTime: 60 * 1000,
  });
}

export function useRecentInvoices() {
  return useQuery({
    queryKey: dashboardKeys.invoices(),
    queryFn: () => dashboardService.getRecentInvoices(),
    staleTime: 60 * 1000,
  });
}


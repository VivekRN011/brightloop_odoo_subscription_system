import { useQuery } from '@tanstack/react-query';
import { customerPortalService } from '../services/customerPortal.service';
import { useAuth } from '@/context/AuthContext';

export function useCustomerSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['portal', 'summary', user?.id || 'anonymous'],
    queryFn: () => customerPortalService.getSummary(user),
    staleTime: 30 * 1000,
    enabled: !!user,
  });
}


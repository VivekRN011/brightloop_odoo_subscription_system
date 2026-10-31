import { useQuery } from '@tanstack/react-query';
import { planService } from '../services/plan.service';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getPlans(),
    staleTime: 60 * 1000,
  });
}

export function usePlan(codeOrId?: string) {
  return useQuery({
    queryKey: ['plan', codeOrId],
    queryFn: () => (codeOrId ? planService.getPlanByCode(codeOrId) : null),
    enabled: Boolean(codeOrId),
    staleTime: 60 * 1000,
  });
}


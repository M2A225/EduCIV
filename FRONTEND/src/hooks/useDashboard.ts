import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardData } from '../services/dashboard';
import { extractData } from '../lib/utils';

const defaultData: DashboardData = { stats: {}, recentActivity: [] };

export const useDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardService.getDashboardData();
      return extractData<DashboardData>(res) ?? defaultData;
    },
  });
};

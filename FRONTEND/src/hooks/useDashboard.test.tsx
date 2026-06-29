import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useDashboardData } from './useDashboard';
import { dashboardService } from '../services/dashboard';

vi.mock('../services/dashboard', () => ({
  dashboardService: {
    getDashboardData: vi.fn(),
    getDirectorDashboard: vi.fn(),
    getTeacherDashboard: vi.fn(),
    getParentDashboard: vi.fn(),
    getStudentDashboard: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboardData', () => {
  it('should return dashboard data', async () => {
    (dashboardService.getDashboardData as any).mockResolvedValue({
      data: { data: { stats: {}, recentActivity: [] } },
    });
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ stats: {}, recentActivity: [] });
  });

  it('should handle empty data gracefully', async () => {
    (dashboardService.getDashboardData as any).mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ stats: {}, recentActivity: [] });
  });
});

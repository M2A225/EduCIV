import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSchools, useSchool, useSchoolStats, useCreateSchool, useUpdateSchool, useDeleteSchool } from './useSchools';
import { schoolService } from '../services/schools';

vi.mock('../services/schools', () => ({
  schoolService: {
    getSchools: vi.fn(),
    getSchool: vi.fn(),
    getSchoolStats: vi.fn(),
    createSchool: vi.fn(),
    updateSchool: vi.fn(),
    deleteSchool: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSchools', () => {
  it('should return schools data', async () => {
    (schoolService.getSchools as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useSchools(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useSchool', () => {
  it('should return single school when id provided', async () => {
    (schoolService.getSchool as any).mockResolvedValue({ data: { data: { id: 1 } } });
    const { result } = renderHook(() => useSchool(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should not fetch when id is 0', () => {
    (schoolService.getSchool as any).mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useSchool(0), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useSchoolStats', () => {
  it('should return school stats', async () => {
    (schoolService.getSchoolStats as any).mockResolvedValue({ data: { data: {} } });
    const { result } = renderHook(() => useSchoolStats(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateSchool', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateSchool(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateSchool', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateSchool(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteSchool', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteSchool(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

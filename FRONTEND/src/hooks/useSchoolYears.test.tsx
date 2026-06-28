import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSchoolYears, useCreateSchoolYear, useDeleteSchoolYear } from './useSchoolYears';
import { schoolYearService } from '../services/school-years';

vi.mock('../services/school-years', () => ({
  schoolYearService: {
    getSchoolYears: vi.fn(),
    createSchoolYear: vi.fn(),
    deleteSchoolYear: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSchoolYears', () => {
  it('should return school years', async () => {
    (schoolYearService.getSchoolYears as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useSchoolYears(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateSchoolYear', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateSchoolYear(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteSchoolYear', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteSchoolYear(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePeriods, useCreatePeriod, useUpdatePeriod, useDeletePeriod } from './usePeriods';
import { periodService } from '../services/periods';

vi.mock('../services/periods', () => ({
  periodService: {
    getPeriods: vi.fn(),
    createPeriod: vi.fn(),
    updatePeriod: vi.fn(),
    deletePeriod: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePeriods', () => {
  it('should return periods data', async () => {
    (periodService.getPeriods as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => usePeriods(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreatePeriod', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreatePeriod(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdatePeriod', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdatePeriod(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeletePeriod', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeletePeriod(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

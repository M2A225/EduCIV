import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePayments, useCreatePayment, useCancelPayment, useAuditLogs } from './usePayments';
import { paymentService } from '../services/payments';

vi.mock('../services/payments', () => ({
  paymentService: {
    getPayments: vi.fn(),
    createPayment: vi.fn(),
    cancelPayment: vi.fn(),
    getAuditLogs: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePayments', () => {
  it('should return payments data', async () => {
    (paymentService.getPayments as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.payments).toEqual([{ id: 1 }]);
  });
});

describe('useCreatePayment', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreatePayment(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useCancelPayment', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCancelPayment(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useAuditLogs', () => {
  it('should return audit logs data', async () => {
    (paymentService.getAuditLogs as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

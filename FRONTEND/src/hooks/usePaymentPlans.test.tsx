import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { usePaymentPlans, useCreatePaymentPlan, useDeletePaymentPlan } from './usePaymentPlans';
import { paymentPlanService } from '../services/payment-plans';

vi.mock('../services/payment-plans', () => ({
  paymentPlanService: {
    getPlans: vi.fn(),
    createPlan: vi.fn(),
    deletePlan: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePaymentPlans', () => {
  it('should return payment plans', async () => {
    (paymentPlanService.getPlans as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => usePaymentPlans(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreatePaymentPlan', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreatePaymentPlan(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeletePaymentPlan', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeletePaymentPlan(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

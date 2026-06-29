import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSyncPush, useSyncPull } from './useSync';
import { syncService } from '../services/sync';

vi.mock('../services/sync', () => ({
  syncService: {
    pushData: vi.fn(),
    pullData: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSyncPush', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useSyncPush(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useSyncPull', () => {
  it('should return sync data', async () => {
    (syncService.pullData as any).mockResolvedValue({ data: { data: {} } });
    const { result } = renderHook(() => useSyncPull(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

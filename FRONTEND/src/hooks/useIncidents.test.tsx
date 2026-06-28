import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useIncidents, useCreateIncident, useUpdateIncident, useDeleteIncident } from './useIncidents';
import { incidentService } from '../services/incidents';

vi.mock('../services/incidents', () => ({
  incidentService: {
    getIncidents: vi.fn(),
    createIncident: vi.fn(),
    updateIncident: vi.fn(),
    deleteIncident: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIncidents', () => {
  it('should return incidents data', async () => {
    (incidentService.getIncidents as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useIncidents(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateIncident', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateIncident(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateIncident', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateIncident(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteIncident', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteIncident(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

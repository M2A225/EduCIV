import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from './useClasses';
import { classService } from '../services/classes';

vi.mock('../services/classes', () => ({
  classService: {
    getClasses: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
    deleteClass: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useClasses', () => {
  it('should return classes data', async () => {
    (classService.getClasses as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useClasses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateClass', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateClass(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateClass', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateClass(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteClass', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteClass(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

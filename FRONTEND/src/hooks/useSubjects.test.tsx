import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from './useSubjects';
import { subjectService } from '../services/subjects';

vi.mock('../services/subjects', () => ({
  subjectService: {
    getSubjects: vi.fn(),
    createSubject: vi.fn(),
    updateSubject: vi.fn(),
    deleteSubject: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSubjects', () => {
  it('should return subjects data', async () => {
    (subjectService.getSubjects as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useSubjects(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateSubject', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateSubject(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateSubject', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateSubject(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteSubject', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteSubject(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

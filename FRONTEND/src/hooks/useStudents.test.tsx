import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useStudents, useCreateStudent } from './useStudents';
import { studentService } from '../services/students';

vi.mock('../services/students', () => ({
  studentService: {
    getStudents: vi.fn(),
    createStudent: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useStudents', () => {
  it('should return students data', async () => {
    (studentService.getStudents as any).mockResolvedValue({ data: { data: [{ id: 1, first_name: 'A' }] } });
    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateStudent', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateStudent(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

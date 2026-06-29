import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from './useTeachers';
import { teacherService } from '../services/teachers';

vi.mock('../services/teachers', () => ({
  teacherService: {
    getTeachers: vi.fn(),
    createTeacher: vi.fn(),
    updateTeacher: vi.fn(),
    deleteTeacher: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useTeachers', () => {
  it('should return teachers data', async () => {
    (teacherService.getTeachers as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useTeachers(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useCreateTeacher', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateTeacher(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateTeacher', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateTeacher(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteTeacher', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteTeacher(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

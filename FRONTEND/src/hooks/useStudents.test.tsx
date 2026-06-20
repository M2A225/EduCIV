import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useStudents, useCreateStudent } from './useStudents';
import { studentService } from '../services/students';
import { extractData } from '../lib/utils';

vi.mock('../services/students', () => ({
  studentService: {
    getStudents: vi.fn(),
    createStudent: vi.fn(),
  },
}));

vi.mock('../lib/utils', () => ({
  extractData: vi.fn((res) => res.data.data),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStudents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches students successfully', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', school_id: 1, is_repeater: false, is_internal: true, is_affected: false },
    ];
    vi.mocked(studentService.getStudents).mockResolvedValue({ data: { data: mockStudents } } as never);
    vi.mocked(extractData).mockReturnValue(mockStudents);

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockStudents);
    expect(studentService.getStudents).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error', async () => {
    vi.mocked(studentService.getStudents).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useCreateStudent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a student and invalidates query', async () => {
    vi.mocked(studentService.createStudent).mockResolvedValue({ data: { data: { id: 1 } } } as never);

    const { result } = renderHook(() => useCreateStudent(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: 'Jane Doe' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(studentService.createStudent).toHaveBeenCalledWith({ name: 'Jane Doe' });
  });

  it('handles create error', async () => {
    vi.mocked(studentService.createStudent).mockRejectedValue(new Error('Create failed'));

    const { result } = renderHook(() => useCreateStudent(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: 'Fail Student' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

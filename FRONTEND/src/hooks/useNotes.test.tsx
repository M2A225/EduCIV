import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotes, usePendingNotes, useAddNote, useUpdateNote, useDeleteNote, useValidateNote, useRejectNote } from './useNotes';
import { notesService } from '../services/notes';

vi.mock('../services/notes', () => ({
  notesService: {
    getNotes: vi.fn(),
    getPendingNotes: vi.fn(),
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    validateNote: vi.fn(),
    rejectNote: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotes', () => {
  it('should return grades data', async () => {
    (notesService.getNotes as any).mockResolvedValue({ data: { data: [{ id: 1, value: 15 }] } });
    const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.grades).toEqual([{ id: 1, value: 15 }]);
  });
});

describe('usePendingNotes', () => {
  it('should return pending grades', async () => {
    (notesService.getPendingNotes as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => usePendingNotes(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useAddNote', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useAddNote(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUpdateNote', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useUpdateNote(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useDeleteNote', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useDeleteNote(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useValidateNote', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useValidateNote(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useRejectNote', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useRejectNote(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

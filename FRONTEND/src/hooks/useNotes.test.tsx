import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useNotes, usePendingNotes, useAddNote, useUpdateNote, useDeleteNote, useValidateNote, useRejectNote } from './useNotes';
import { notesService } from '../services/notes';
import { extractData } from '../lib/utils';

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

vi.mock('../lib/utils', () => ({
  extractData: vi.fn((res) => res.data.data),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches notes successfully', async () => {
    const mockGrades = [
      { id: 1, value: 15, type: 'EXAMEN', status: 'VALIDE', period_id: 1, student_id: 1, subject_id: 1, school_id: 1, created_at: '', updated_at: '' },
    ];
    vi.mocked(notesService.getNotes).mockResolvedValue({ data: { data: mockGrades } } as never);
    vi.mocked(extractData).mockReturnValue(mockGrades);

    const { result } = renderHook(() => useNotes(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.grades).toEqual(mockGrades);
    expect(notesService.getNotes).toHaveBeenCalledWith(undefined);
  });

  it('fetches notes for a specific student', async () => {
    vi.mocked(notesService.getNotes).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(extractData).mockReturnValue([]);

    const { result } = renderHook(() => useNotes(5), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.getNotes).toHaveBeenCalledWith(5);
  });
});

describe('usePendingNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches pending notes', async () => {
    vi.mocked(notesService.getPendingNotes).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(extractData).mockReturnValue([]);

    const { result } = renderHook(() => usePendingNotes(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.getPendingNotes).toHaveBeenCalledWith(1);
  });
});

describe('useAddNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds a note successfully', async () => {
    vi.mocked(notesService.addNote).mockResolvedValue({ data: { data: {} } } as never);

    const { result } = renderHook(() => useAddNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ value: 15, type: 'EXAMEN', period_id: 1, student_id: 1, subject_id: 1 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.addNote).toHaveBeenCalled();
  });
});

describe('useUpdateNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a note successfully', async () => {
    vi.mocked(notesService.updateNote).mockResolvedValue({ data: { data: {} } } as never);

    const { result } = renderHook(() => useUpdateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 1, data: { value: 18 } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.updateNote).toHaveBeenCalledWith(1, { value: 18 });
  });
});

describe('useDeleteNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a note successfully', async () => {
    vi.mocked(notesService.deleteNote).mockResolvedValue({ data: { data: {} } } as never);

    const { result } = renderHook(() => useDeleteNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.deleteNote).toHaveBeenCalledWith(1);
  });
});

describe('useValidateNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates a note successfully', async () => {
    vi.mocked(notesService.validateNote).mockResolvedValue({ data: { data: {} } } as never);

    const { result } = renderHook(() => useValidateNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.validateNote).toHaveBeenCalledWith(1);
  });
});

describe('useRejectNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a note successfully', async () => {
    vi.mocked(notesService.rejectNote).mockResolvedValue({ data: { data: {} } } as never);

    const { result } = renderHook(() => useRejectNote(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ id: 1, reason: 'Incomplete' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(notesService.rejectNote).toHaveBeenCalledWith(1, 'Incomplete');
  });
});

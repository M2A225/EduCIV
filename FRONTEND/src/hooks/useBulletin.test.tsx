import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useBulletin } from './useBulletin';
import { notesService } from '../services/notes';

vi.mock('../services/notes', () => ({
  notesService: {
    generateReportCard: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBulletin', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useBulletin(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

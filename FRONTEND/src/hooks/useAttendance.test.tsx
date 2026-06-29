import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAttendanceSessions, useAttendance, useCreateSession, useMarkAttendance } from './useAttendance';
import { attendanceService } from '../services/attendance';

vi.mock('../services/attendance', () => ({
  attendanceService: {
    getAttendanceSessions: vi.fn(),
    getAttendance: vi.fn(),
    createSession: vi.fn(),
    markAttendance: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAttendanceSessions', () => {
  it('should return sessions data', async () => {
    (attendanceService.getAttendanceSessions as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    const { result } = renderHook(() => useAttendanceSessions(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.sessions).toEqual([{ id: 1 }]);
  });
});

describe('useAttendance', () => {
  it('should return attendance data', async () => {
    (attendanceService.getAttendance as any).mockResolvedValue({ data: { data: [] } });
    const { result } = renderHook(() => useAttendance(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

describe('useCreateSession', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useCreateSession(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useMarkAttendance', () => {
  it('should expose mutate function', () => {
    const { result } = renderHook(() => useMarkAttendance(), { wrapper: createWrapper() });
    expect(typeof result.current.mutate).toBe('function');
  });
});

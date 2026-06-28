import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotifications } from './useNotifications';
import { notificationService } from '../services/notifications';

vi.mock('../services/notifications', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotifications', () => {
  it('should return notifications and unread count', async () => {
    (notificationService.getNotifications as any).mockResolvedValue({ data: { data: [{ id: 1 }] } });
    (notificationService.getUnreadCount as any).mockResolvedValue({ data: { data: { count: 3 } } });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toEqual([{ id: 1 }]);
    expect(result.current.unreadCount).toBe(3);
  });

  it('should expose markAsRead function', async () => {
    (notificationService.getNotifications as any).mockResolvedValue({ data: { data: [] } });
    (notificationService.getUnreadCount as any).mockResolvedValue({ data: { data: { count: 0 } } });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.markAsRead).toBe('function');
  });

  it('should expose markAllAsRead function', async () => {
    (notificationService.getNotifications as any).mockResolvedValue({ data: { data: [] } });
    (notificationService.getUnreadCount as any).mockResolvedValue({ data: { data: { count: 0 } } });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.markAllAsRead).toBe('function');
  });

  it('should expose deleteNotification function', async () => {
    (notificationService.getNotifications as any).mockResolvedValue({ data: { data: [] } });
    (notificationService.getUnreadCount as any).mockResolvedValue({ data: { data: { count: 0 } } });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.deleteNotification).toBe('function');
  });

  it('should default to empty array when no data', async () => {
    (notificationService.getNotifications as any).mockResolvedValue({ data: { data: null } });
    (notificationService.getUnreadCount as any).mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });
});

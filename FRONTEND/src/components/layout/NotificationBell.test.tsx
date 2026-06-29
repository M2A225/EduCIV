import { render, screen } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';

vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [{ id: 1, title: 'Test', message: 'Hello', created_at: new Date().toISOString(), read: false }],
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    isLoading: false,
  }),
}));

describe('NotificationBell', () => {
  it('should render bell icon', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('should show unread count badge', () => {
    render(<NotificationBell />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

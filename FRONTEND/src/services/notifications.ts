import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  school_id: number;
  title: string;
  body: string;
  type: string;
  read_at: string | null;
  link: string | null;
  created_at: string;
}

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id: number) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id: number) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

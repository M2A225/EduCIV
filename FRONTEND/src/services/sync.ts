import { api } from './api';

export const syncService = {
  pushData: async (data: { operations: Record<string, unknown>[] }) => {
    const res = await api.post('/sync/push', data);
    return res.data;
  },
  pullData: async (since?: string) => {
    const params = since ? { since } : {};
    const res = await api.get('/sync/pull', { params });
    return res.data;
  }
};

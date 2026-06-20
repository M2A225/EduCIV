import { api } from './api';

export const syncService = {
  pushData: async (data: { operations: Record<string, unknown>[] }) => {
    return api.post('/sync/push', data);
  },
  pullData: async (since?: string) => {
    const params = since ? { since } : {};
    return api.get('/sync/pull', { params });
  }
};

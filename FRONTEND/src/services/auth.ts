import { api } from './api';
import type { LoginDto } from '../types';

export const authService = {
  login: async (data: LoginDto) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  refresh: async () => {
    const res = await api.post('/auth/refresh');
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  switchRole: async (role: string) => {
    const res = await api.post('/auth/switch-role', { role });
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token: string, password: string) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  }
};

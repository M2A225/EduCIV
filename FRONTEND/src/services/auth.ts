import { api } from './api';
import type { LoginDto } from '../types';

export const authService = {
  login: async (data: LoginDto) => {
    return api.post('/auth/login', data);
  },
  refresh: async () => {
    return api.post('/auth/refresh');
  },
  logout: async () => {
    return api.post('/auth/logout');
  },
  me: async () => {
    return api.get('/auth/me');
  },
  switchRole: async (role: string) => {
    return api.post('/auth/switch-role', { role });
  },
  forgotPassword: async (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  }
};

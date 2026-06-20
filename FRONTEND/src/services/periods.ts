import { api } from './api';
import type { AcademicPeriod } from '../types';

export const periodService = {
  getPeriods: async (page = 1, pageSize = 50) => {
    return api.get<AcademicPeriod[]>('/periods', { params: { page, pageSize } });
  },
  getPeriod: async (id: number) => {
    return api.get<AcademicPeriod>(`/periods/${id}`);
  },
  createPeriod: async (data: { name: string; start_date: string; end_date: string }) => {
    return api.post('/periods', data);
  },
  updatePeriod: async (id: number, data: Partial<{ name: string; start_date: string; end_date: string }>) => {
    return api.patch(`/periods/${id}`, data);
  },
  deletePeriod: async (id: number) => {
    return api.delete(`/periods/${id}`);
  },
};

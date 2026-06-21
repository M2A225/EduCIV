import { api } from './api';
import type { AcademicPeriod } from '../types';

export const periodService = {
  getPeriods: async (page = 1, pageSize = 50) => {
    const res = await api.get<AcademicPeriod[]>('/periods', { params: { page, pageSize } });
    return res.data;
  },
  getPeriod: async (id: number) => {
    const res = await api.get<AcademicPeriod>(`/periods/${id}`);
    return res.data;
  },
  createPeriod: async (data: { name: string; start_date: string; end_date: string; period_type?: string; school_year_id?: number }) => {
    const res = await api.post('/periods', data);
    return res.data;
  },
  updatePeriod: async (id: number, data: Partial<{ name: string; start_date: string; end_date: string }>) => {
    const res = await api.patch(`/periods/${id}`, data);
    return res.data;
  },
  deletePeriod: async (id: number) => {
    const res = await api.delete(`/periods/${id}`);
    return res.data;
  },
};

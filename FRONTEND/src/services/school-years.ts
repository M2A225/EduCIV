import { api } from './api';
import type { SchoolYear } from '../types';

export const schoolYearService = {
  getSchoolYears: async (page = 1, pageSize = 50) => {
    const res = await api.get<SchoolYear[]>('/school-years', { params: { page, pageSize } });
    return res.data;
  },
  getSchoolYear: async (id: number) => {
    const res = await api.get<SchoolYear>(`/school-years/${id}`);
    return res.data;
  },
  createSchoolYear: async (data: { year_range: string }) => {
    const res = await api.post('/school-years', data);
    return res.data;
  },
  updateSchoolYear: async (id: number, data: Partial<{ year_range: string }>) => {
    const res = await api.patch(`/school-years/${id}`, data);
    return res.data;
  },
  deleteSchoolYear: async (id: number) => {
    const res = await api.delete(`/school-years/${id}`);
    return res.data;
  },
};

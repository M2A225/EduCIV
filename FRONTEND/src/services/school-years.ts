import { api } from './api';
import type { SchoolYear } from '../types';

export const schoolYearService = {
  getSchoolYears: async (page = 1, pageSize = 50) => {
    return api.get<SchoolYear[]>('/school-years', { params: { page, pageSize } });
  },
  getSchoolYear: async (id: number) => {
    return api.get<SchoolYear>(`/school-years/${id}`);
  },
  createSchoolYear: async (data: { year_range: string }) => {
    return api.post('/school-years', data);
  },
  updateSchoolYear: async (id: number, data: Partial<{ year_range: string }>) => {
    return api.patch(`/school-years/${id}`, data);
  },
  deleteSchoolYear: async (id: number) => {
    return api.delete(`/school-years/${id}`);
  },
};

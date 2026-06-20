import { api } from './api';
import type { Subject } from '../types';

export const subjectService = {
  getSubjects: async (page = 1, pageSize = 50) => {
    return api.get<Subject[]>('/subjects', { params: { page, pageSize } });
  },
  getSubject: async (id: number) => {
    return api.get<Subject>(`/subjects/${id}`);
  },
  createSubject: async (data: { name: string; coefficient: number }) => {
    return api.post('/subjects', data);
  },
  updateSubject: async (id: number, data: Partial<{ name: string; coefficient: number }>) => {
    return api.patch(`/subjects/${id}`, data);
  },
  deleteSubject: async (id: number) => {
    return api.delete(`/subjects/${id}`);
  },
  bulkCreate: async (subjects: { name: string; coefficient: number; max_score?: number; level_group?: string }[]) => {
    return api.post('/subjects/bulk', { subjects });
  },
};

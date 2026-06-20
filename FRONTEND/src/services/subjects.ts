import { api } from './api';
import type { Subject, CreateSubjectDto } from '../types';

export const subjectService = {
  getSubjects: async (page = 1, pageSize = 50) => {
    const res = await api.get<Subject[]>('/subjects', { params: { page, pageSize } });
    return res.data;
  },
  getSubject: async (id: number) => {
    const res = await api.get<Subject>(`/subjects/${id}`);
    return res.data;
  },
  createSubject: async (data: CreateSubjectDto) => {
    const res = await api.post('/subjects', data);
    return res.data;
  },
  updateSubject: async (id: number, data: Partial<CreateSubjectDto>) => {
    const res = await api.patch(`/subjects/${id}`, data);
    return res.data;
  },
  deleteSubject: async (id: number) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};

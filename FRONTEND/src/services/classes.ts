import { api } from './api';
import type { Class, CreateClassDto } from '../types';

export const classService = {
  getClasses: async (page = 1, pageSize = 50) => {
    const res = await api.get<Class[]>('/classes', { params: { page, pageSize } });
    return res.data;
  },
  getClass: async (id: number) => {
    const res = await api.get<Class>(`/classes/${id}`);
    return res.data;
  },
  createClass: async (data: CreateClassDto) => {
    const res = await api.post('/classes', data);
    return res.data;
  },
  updateClass: async (id: number, data: Partial<CreateClassDto>) => {
    const res = await api.patch(`/classes/${id}`, data);
    return res.data;
  },
  deleteClass: async (id: number) => {
    const res = await api.delete(`/classes/${id}`);
    return res.data;
  },
};

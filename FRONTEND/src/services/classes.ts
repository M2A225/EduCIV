import { api } from './api';
import type { Class, CreateClassDto } from '../types';

export const classService = {
  getClasses: async (page = 1, pageSize = 50) => {
    return api.get<Class[]>('/classes', { params: { page, pageSize } });
  },
  getClass: async (id: number) => {
    return api.get<Class>(`/classes/${id}`);
  },
  createClass: async (data: CreateClassDto) => {
    return api.post('/classes', data);
  },
  updateClass: async (id: number, data: Partial<CreateClassDto>) => {
    return api.patch(`/classes/${id}`, data);
  },
  deleteClass: async (id: number) => {
    return api.delete(`/classes/${id}`);
  },
};

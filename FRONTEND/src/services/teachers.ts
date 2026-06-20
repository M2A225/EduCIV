import { api } from './api';
import type { Teacher, CreateTeacherDto } from '../types';

export const teacherService = {
  getTeachers: async (page = 1, pageSize = 50) => {
    return api.get<Teacher[]>('/teachers', { params: { page, pageSize } });
  },
  getTeacher: async (id: number) => {
    return api.get<Teacher>(`/teachers/${id}`);
  },
  createTeacher: async (data: CreateTeacherDto) => {
    return api.post('/teachers', data);
  },
  updateTeacher: async (id: number, data: Partial<CreateTeacherDto>) => {
    return api.patch(`/teachers/${id}`, data);
  },
  deleteTeacher: async (id: number) => {
    return api.delete(`/teachers/${id}`);
  },
};

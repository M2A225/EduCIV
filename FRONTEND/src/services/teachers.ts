import { api } from './api';
import type { Teacher, CreateTeacherDto } from '../types';

export const teacherService = {
  getTeachers: async (page = 1, pageSize = 50) => {
    const res = await api.get<Teacher[]>('/teachers', { params: { page, pageSize } });
    return res.data;
  },
  getTeacher: async (id: number) => {
    const res = await api.get<Teacher>(`/teachers/${id}`);
    return res.data;
  },
  createTeacher: async (data: CreateTeacherDto) => {
    const res = await api.post('/teachers', data);
    return res.data;
  },
  updateTeacher: async (id: number, data: Partial<CreateTeacherDto>) => {
    const res = await api.patch(`/teachers/${id}`, data);
    return res.data;
  },
  deleteTeacher: async (id: number) => {
    const res = await api.delete(`/teachers/${id}`);
    return res.data;
  },
};

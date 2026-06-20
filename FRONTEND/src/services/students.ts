import { api } from './api';
import type { Student, CreateStudentDto } from '../types';

export const studentService = {
  getStudents: async (page = 1, pageSize = 50, search?: string) => {
    const params: Record<string, unknown> = { page, pageSize };
    if (search) params.search = search;
    const res = await api.get<Student[]>('/students', { params });
    return res.data;
  },
  getStudent: async (id: string | number) => {
    const res = await api.get<Student>(`/students/${id}`);
    return res.data;
  },
  createStudent: async (data: CreateStudentDto) => {
    const res = await api.post('/students', data);
    return res.data;
  },
};

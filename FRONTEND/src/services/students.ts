import { api } from './api';
import type { Student, CreateStudentDto } from '../types';

export const studentService = {
  getStudents: async (page = 1, pageSize = 50, search?: string) => {
    const params: Record<string, unknown> = { page, pageSize };
    if (search) params.search = search;
    return api.get<Student[]>('/students', { params });
  },
  getStudent: async (id: string | number) => {
    return api.get<Student>(`/students/${id}`);
  },
  createStudent: async (data: CreateStudentDto) => {
    return api.post('/students', data);
  },
};

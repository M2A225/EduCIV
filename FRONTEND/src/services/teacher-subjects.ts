import { api } from './api';

export interface CreateTeacherSubjectInput {
  teacher_id: number;
  subject_id: number;
  class_id: number;
}

export const teacherSubjectService = {
  getAssignments: async () => {
    const res = await api.get('/teacher-subjects');
    return res.data;
  },
  getByTeacher: async (teacherId: number) => {
    const res = await api.get(`/teacher-subjects/by-teacher/${teacherId}`);
    return res.data;
  },
  getMyAssignments: async () => {
    const res = await api.get('/teacher-subjects/my-assignments');
    return res.data;
  },
  createAssignment: async (data: CreateTeacherSubjectInput) => {
    const res = await api.post('/teacher-subjects', data);
    return res.data;
  },
  deleteAssignment: async (id: number) => {
    const res = await api.delete(`/teacher-subjects/${id}`);
    return res.data;
  },
};

import { api } from './api';

export interface CreateTeacherSubjectInput {
  teacher_id: number;
  subject_id: number;
  class_id: number;
}

export const teacherSubjectService = {
  getAssignments: async () => api.get('/teacher-subjects'),
  getByTeacher: async (teacherId: number) => api.get(`/teacher-subjects/by-teacher/${teacherId}`),
  getMyAssignments: async () => api.get('/teacher-subjects/my-assignments'),
  createAssignment: async (data: CreateTeacherSubjectInput) => api.post('/teacher-subjects', data),
  deleteAssignment: async (id: number) => api.delete(`/teacher-subjects/${id}`),
};

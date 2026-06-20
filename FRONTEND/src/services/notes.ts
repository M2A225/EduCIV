import { api } from './api';
import type { CreateGradeDto, Grade } from '../types';

export const notesService = {
  getNotes: async (studentId?: number) => {
    if (studentId) {
      return api.get(`/notes/student/${studentId}`);
    }
    return api.get('/notes');
  },
  getNote: async (id: number) => {
    return api.get(`/notes/${id}`);
  },
  getPendingNotes: async (periodId?: number) => {
    const params = periodId ? { periodId } : {};
    return api.get('/notes/pending', { params });
  },
  addNote: async (data: CreateGradeDto) => {
    return api.post('/notes', data);
  },
  updateNote: async (id: number, data: Partial<Grade>) => {
    return api.patch(`/notes/${id}`, data);
  },
  deleteNote: async (id: number) => {
    return api.delete(`/notes/${id}`);
  },
  validateNote: async (id: number) => {
    return api.post(`/notes/${id}/validate`);
  },
  rejectNote: async (id: number, rejection_reason?: string) => {
    return api.post(`/notes/${id}/reject`, { rejection_reason });
  },
  getAverage: async (studentId: number, periodId: number) => {
    return api.get(`/notes/average/${studentId}`, { params: { periodId } });
  },
  generateReportCard: async (studentId: number, periodId: number, year: string) => {
    return api.post(`/notes/report-card/${studentId}`, { periodId, year });
  },
};

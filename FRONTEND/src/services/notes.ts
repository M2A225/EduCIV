import { api } from './api';
import type { CreateGradeDto, Grade } from '../types';

export const notesService = {
  getNotes: async (studentId?: number) => {
    const res = studentId
      ? await api.get(`/notes/student/${studentId}`)
      : await api.get('/notes');
    return res.data;
  },
  getNote: async (id: number) => {
    const res = await api.get(`/notes/${id}`);
    return res.data;
  },
  getPendingNotes: async (periodId?: number) => {
    const params = periodId ? { periodId } : {};
    const res = await api.get('/notes/pending', { params });
    return res.data;
  },
  addNote: async (data: CreateGradeDto) => {
    const res = await api.post('/notes', data);
    return res.data;
  },
  updateNote: async (id: number, data: Partial<Grade>) => {
    const res = await api.patch(`/notes/${id}`, data);
    return res.data;
  },
  deleteNote: async (id: number) => {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
  validateNote: async (id: number) => {
    const res = await api.post(`/notes/${id}/validate`);
    return res.data;
  },
  rejectNote: async (id: number, rejection_reason?: string) => {
    const res = await api.post(`/notes/${id}/reject`, { rejection_reason });
    return res.data;
  },
  getAverage: async (studentId: number, periodId: number) => {
    const res = await api.get(`/notes/average/${studentId}`, { params: { periodId } });
    return res.data;
  },
  generateReportCard: async (studentId: number, periodId: number, year: string) => {
    const res = await api.post(`/notes/report-card/${studentId}`, { periodId, year });
    return res.data;
  },
};

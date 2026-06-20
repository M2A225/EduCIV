import { api } from './api';
import type { CreateTimetableDto } from '../types';

export const timetableService = {
  getTimetables: async (params?: { class_id?: number; teacher_id?: number; page?: number; pageSize?: number }) => {
    const res = await api.get('/timetables', { params });
    return res.data;
  },
  addSlot: async (data: CreateTimetableDto) => {
    const res = await api.post('/timetables', data);
    return res.data;
  },
};

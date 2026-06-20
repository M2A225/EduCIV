import { api } from './api';
import type { CreateTimetableDto } from '../types';

export const timetableService = {
  getTimetables: async (params?: { class_id?: number; teacher_id?: number; page?: number; pageSize?: number }) => {
    return api.get('/timetables', { params });
  },
  addSlot: async (data: CreateTimetableDto) => {
    return api.post('/timetables', data);
  },
};

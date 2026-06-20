import { api } from './api';
import type { MarkAttendanceDto } from '../types';

export const attendanceService = {
  getAttendanceSessions: async () => {
    return api.get('/attendance/sessions');
  },
  getAttendance: async (studentId?: number) => {
    const params = studentId ? { student_id: studentId } : {};
    return api.get('/attendance', { params });
  },
  getSession: async (sessionId: number) => {
    return api.get(`/attendance/session/${sessionId}`);
  },
  markAttendance: async (sessionId: number, data: MarkAttendanceDto) => {
    return api.post(`/attendance/${sessionId}`, data);
  },
  createSession: async (data: { class_id: number; subject_id: number; timetable_id: number; date: string }) => {
    return api.post('/attendance/session', data);
  },
};

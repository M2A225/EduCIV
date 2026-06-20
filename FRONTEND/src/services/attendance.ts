import { api } from './api';
import type { MarkAttendanceDto } from '../types';

export const attendanceService = {
  getAttendanceSessions: async () => {
    const res = await api.get('/attendance/sessions');
    return res.data;
  },
  getAttendance: async (studentId?: number) => {
    const params = studentId ? { student_id: studentId } : {};
    const res = await api.get('/attendance', { params });
    return res.data;
  },
  getSession: async (sessionId: number) => {
    const res = await api.get(`/attendance/session/${sessionId}`);
    return res.data;
  },
  markAttendance: async (sessionId: number, data: MarkAttendanceDto) => {
    const res = await api.post(`/attendance/${sessionId}`, data);
    return res.data;
  },
  createSession: async (data: { class_id: number; subject_id: number; timetable_id: number; date: string }) => {
    const res = await api.post('/attendance/session', data);
    return res.data;
  },
};

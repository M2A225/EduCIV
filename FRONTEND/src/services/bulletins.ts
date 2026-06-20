import { api } from './api';

export const bulletinService = {
  generateBulletin: async (studentId: number, periodId: number, year: string) => {
    const res = await api.post(`/bulletins/${studentId}`, { periodId, year });
    return res.data;
  },
  generateBatchBulletins: async (classId: number, periodId: number, year: string) => {
    const res = await api.post(`/bulletins/batch/${classId}`, { periodId, year });
    return res.data;
  },
};

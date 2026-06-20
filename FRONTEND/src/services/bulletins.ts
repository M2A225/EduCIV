import { api } from './api';

export const bulletinService = {
  generateBulletin: async (studentId: number, periodId: number, year: string) => {
    return api.post(`/bulletins/${studentId}`, { periodId, year });
  },
  generateBatchBulletins: async (classId: number, periodId: number, year: string) => {
    return api.post(`/bulletins/batch/${classId}`, { periodId, year });
  },
};

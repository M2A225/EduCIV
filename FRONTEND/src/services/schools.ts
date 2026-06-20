import { api } from './api';
import type { CreateSchoolDto, UpdateSchoolDto, School, DirectorStats, SetupStatus, SchoolLevel, LevelTuition } from '../types';

export const schoolService = {
  getSchools: async () => {
    return api.get<School[]>('/schools');
  },
  getSchool: async (id: number) => {
    return api.get<School>(`/schools/${id}`);
  },
  getMySchool: async () => {
    return api.get<School>('/schools/me');
  },
  createSchool: async (data: CreateSchoolDto) => {
    return api.post('/schools', data);
  },
  updateSchool: async (id: number, data: UpdateSchoolDto) => {
    return api.patch(`/schools/${id}`, data);
  },
  updateMySchool: async (data: UpdateSchoolDto) => {
    return api.patch('/schools/me', data);
  },
  deleteSchool: async (id: number) => {
    return api.delete(`/schools/${id}`);
  },
  getSchoolStats: async (schoolId: number) => {
    return api.get<DirectorStats>(`/schools/stats?school_id=${schoolId}`);
  },
  getSetupStatus: async () => {
    return api.get<SetupStatus>('/schools/setup-status');
  },
  getDefaultLevels: async (schoolType?: string) => {
    const params = schoolType ? `?school_type=${schoolType}` : '';
    return api.get<string[]>(`/schools/levels/defaults${params}`);
  },
  getLevels: async () => {
    return api.get<SchoolLevel[]>('/schools/levels');
  },
  updateLevels: async (levels: string[]) => {
    return api.put<SchoolLevel[]>('/schools/levels', { levels });
  },
  getLevelTuitions: async () => {
    return api.get<LevelTuition[]>('/schools/level-tuitions');
  },
  upsertLevelTuitions: async (tuitions: { level: string; amount: number }[]) => {
    return api.put<LevelTuition[]>('/schools/level-tuitions', { tuitions });
  },
  completeSetup: async () => {
    return api.post('/schools/complete-setup');
  },
  resetSetup: async (id: number) => {
    return api.post(`/schools/${id}/reset-setup`);
  },
};

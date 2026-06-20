import { api } from './api';
import type { City, Commune } from '../types';

export const cityService = {
  getAll: async () => {
    return api.get<City[]>('/cities');
  },
  getById: async (id: number) => {
    return api.get<City>(`/cities/${id}`);
  },
  create: async (name: string) => {
    return api.post('/cities', { name });
  },
  update: async (id: number, name: string) => {
    return api.patch(`/cities/${id}`, { name });
  },
  delete: async (id: number) => {
    return api.delete(`/cities/${id}`);
  },
  getCommunes: async (cityId: number) => {
    return api.get<Commune[]>(`/cities/${cityId}/communes`);
  },
  createCommune: async (cityId: number, name: string) => {
    return api.post(`/cities/${cityId}/communes`, { name });
  },
  updateCommune: async (id: number, name: string) => {
    return api.patch(`/cities/communes/${id}`, { name });
  },
  deleteCommune: async (id: number) => {
    return api.delete(`/cities/communes/${id}`);
  },
};

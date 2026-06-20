import { api } from './api';
import type { City, Commune } from '../types';

export const cityService = {
  getAll: async () => {
    const res = await api.get<City[]>('/cities');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<City>(`/cities/${id}`);
    return res.data;
  },
  create: async (name: string) => {
    const res = await api.post('/cities', { name });
    return res.data;
  },
  update: async (id: number, name: string) => {
    const res = await api.patch(`/cities/${id}`, { name });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/cities/${id}`);
    return res.data;
  },
  getCommunes: async (cityId: number) => {
    const res = await api.get<Commune[]>(`/cities/${cityId}/communes`);
    return res.data;
  },
  createCommune: async (cityId: number, name: string) => {
    const res = await api.post(`/cities/${cityId}/communes`, { name });
    return res.data;
  },
  updateCommune: async (id: number, name: string) => {
    const res = await api.patch(`/cities/communes/${id}`, { name });
    return res.data;
  },
  deleteCommune: async (id: number) => {
    const res = await api.delete(`/cities/communes/${id}`);
    return res.data;
  },
};

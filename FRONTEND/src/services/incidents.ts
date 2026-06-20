import { api } from './api';
import type { Incident, CreateIncidentDto } from '../types';

export const incidentService = {
  getIncidents: async (page = 1, pageSize = 50) => {
    const res = await api.get<Incident[]>('/incidents', { params: { page, pageSize } });
    return res.data;
  },
  getIncident: async (id: number) => {
    const res = await api.get<Incident>(`/incidents/${id}`);
    return res.data;
  },
  createIncident: async (data: CreateIncidentDto) => {
    const res = await api.post('/incidents', data);
    return res.data;
  },
  updateIncident: async (id: number, data: Partial<CreateIncidentDto>) => {
    const res = await api.patch(`/incidents/${id}`, data);
    return res.data;
  },
  deleteIncident: async (id: number) => {
    const res = await api.delete(`/incidents/${id}`);
    return res.data;
  },
};

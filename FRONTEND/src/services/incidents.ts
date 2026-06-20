import { api } from './api';
import type { Incident, CreateIncidentDto } from '../types';

export const incidentService = {
  getIncidents: async (page = 1, pageSize = 50) => {
    return api.get<Incident[]>('/incidents', { params: { page, pageSize } });
  },
  getIncident: async (id: number) => {
    return api.get<Incident>(`/incidents/${id}`);
  },
  createIncident: async (data: CreateIncidentDto) => {
    return api.post('/incidents', data);
  },
  updateIncident: async (id: number, data: Partial<CreateIncidentDto>) => {
    return api.patch(`/incidents/${id}`, data);
  },
  deleteIncident: async (id: number) => {
    return api.delete(`/incidents/${id}`);
  },
};

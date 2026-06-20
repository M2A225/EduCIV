import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { incidentService } from '../services/incidents';
import { extractData } from '../lib/utils';
import type { Incident, CreateIncidentDto } from '../types';

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentService.getIncidents().then(res => extractData<Incident[]>(res)),
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncidentDto) => incidentService.createIncident(data),
    onSuccess: () => {
      toast.success('Incident créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: () => { toast.error('Erreur lors de la création de l\'incident'); },
  });
};

export const useUpdateIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      incidentService.updateIncident(id, data),
    onSuccess: () => {
      toast.success('Incident modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useDeleteIncident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incidentService.deleteIncident(id),
    onSuccess: () => {
      toast.success('Incident supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

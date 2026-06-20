import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { periodService } from '../services/periods';
import { extractData } from '../lib/utils';
import type { AcademicPeriod } from '../types';

export const usePeriods = () => {
  return useQuery({
    queryKey: ['periods'],
    queryFn: () => periodService.getPeriods().then(res => extractData<AcademicPeriod[]>(res)),
  });
};

export const useCreatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => periodService.createPeriod(data),
    onSuccess: () => {
      toast.success('Période créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
    onError: () => { toast.error('Erreur lors de la création de la période'); },
  });
};

export const useUpdatePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; start_date: string; end_date: string }> }) =>
      periodService.updatePeriod(id, data),
    onSuccess: () => {
      toast.success('Période modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
};

export const useDeletePeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => periodService.deletePeriod(id),
    onSuccess: () => {
      toast.success('Période supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
};

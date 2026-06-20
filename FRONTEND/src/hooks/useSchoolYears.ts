import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { schoolYearService } from '../services/school-years';
import { extractData } from '../lib/utils';
import type { SchoolYear } from '../types';

export const useSchoolYears = () => {
  return useQuery({
    queryKey: ['school-years'],
    queryFn: () => schoolYearService.getSchoolYears().then(res => extractData<SchoolYear[]>(res)),
  });
};

export const useCreateSchoolYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { year_range: string }) => schoolYearService.createSchoolYear(data),
    onSuccess: () => {
      toast.success('Année scolaire créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
    onError: () => { toast.error('Erreur lors de la création de l\'année scolaire'); },
  });
};

export const useDeleteSchoolYear = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schoolYearService.deleteSchoolYear(id),
    onSuccess: () => {
      toast.success('Année scolaire supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });
};

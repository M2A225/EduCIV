import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { schoolService } from '../services/schools';
import { extractData } from '../lib/utils';
import type { School, SchoolStats, CreateSchoolDto, UpdateSchoolDto } from '../types';

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => schoolService.getSchools().then(res => extractData<School[]>(res)),
  });
};

export const useSchool = (id: number) => {
  return useQuery({
    queryKey: ['schools', id],
    queryFn: () => schoolService.getSchool(id).then(res => extractData<School>(res)),
    enabled: !!id,
  });
};

export const useSchoolStats = (schoolId: number) => {
  return useQuery({
    queryKey: ['school-stats', schoolId],
    queryFn: () => schoolService.getSchoolStats(schoolId).then(res => extractData<SchoolStats>(res)),
    enabled: !!schoolId,
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolDto) => schoolService.createSchool(data),
    onSuccess: () => {
      toast.success('École créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSchoolDto }) =>
      schoolService.updateSchool(id, data),
    onSuccess: () => {
      toast.success('École modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => schoolService.deleteSchool(id),
    onSuccess: () => {
      toast.success('École supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

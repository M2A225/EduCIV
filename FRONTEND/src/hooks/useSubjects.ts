import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { subjectService } from '../services/subjects';
import { extractData } from '../lib/utils';
import type { Subject, CreateSubjectDto } from '../types';

export const useSubjects = () => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getSubjects().then(res => extractData<Subject[]>(res)),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectDto) => subjectService.createSubject(data),
    onSuccess: () => {
      toast.success('Matière créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubjectDto> }) =>
      subjectService.updateSubject(id, data),
    onSuccess: () => {
      toast.success('Matière modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subjectService.deleteSubject(id),
    onSuccess: () => {
      toast.success('Matière supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherService } from '../services/teachers';
import { extractData } from '../lib/utils';
import type { Teacher, CreateTeacherDto } from '../types';

export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => teacherService.getTeachers().then(res => extractData<Teacher[]>(res)),
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeacherDto) => teacherService.createTeacher(data),
    onSuccess: () => {
      toast.success('Enseignant créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTeacherDto> }) =>
      teacherService.updateTeacher(id, data),
    onSuccess: () => {
      toast.success('Enseignant modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      toast.success('Enseignant supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

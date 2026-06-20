import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classService } from '../services/classes';
import { extractData } from '../lib/utils';
import type { Class, CreateClassDto } from '../types';

export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses().then(res => extractData<Class[]>(res)),
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassDto) => classService.createClass(data),
    onSuccess: () => {
      toast.success('Classe créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateClassDto> }) =>
      classService.updateClass(id, data),
    onSuccess: () => {
      toast.success('Classe modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => classService.deleteClass(id),
    onSuccess: () => {
      toast.success('Classe supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notesService } from '../services/notes';
import { extractData } from '../lib/utils';
import type { Grade, CreateGradeDto } from '../types';

export const useNotes = (studentId?: number) => {
  const query = useQuery({
    queryKey: ['notes', studentId],
    queryFn: () => notesService.getNotes(studentId).then(res => extractData<Grade[]>(res)),
  });
  return { ...query, grades: query.data, loading: query.isLoading };
};

export const usePendingNotes = (periodId?: number) => {
  return useQuery({
    queryKey: ['notes-pending', periodId],
    queryFn: () => notesService.getPendingNotes(periodId).then(res => extractData<Grade[]>(res)),
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGradeDto) => notesService.addNote(data),
    onSuccess: () => {
      toast.success('Note ajoutée avec succès');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Grade> }) =>
      notesService.updateNote(id, data),
    onSuccess: () => {
      toast.success('Note modifiée avec succès');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesService.deleteNote(id),
    onSuccess: () => {
      toast.success('Note supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useValidateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notesService.validateNote(id),
    onSuccess: () => {
      toast.success('Note validée');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-pending'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useRejectNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      notesService.rejectNote(id, reason),
    onSuccess: () => {
      toast.success('Note rejetée');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-pending'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

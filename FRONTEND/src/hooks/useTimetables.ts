import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { timetableService } from '../services/timetables';
import { extractData } from '../lib/utils';
import type { Timetable } from '../types';

export const useTimetables = (params?: { class_id?: number; teacher_id?: number }) => {
  const query = useQuery({
    queryKey: ['timetables', params],
    queryFn: () => timetableService.getTimetables(params).then(res => extractData<Timetable[]>(res)),
  });
  const { error: queryError, ...rest } = query;
  return { timetables: query.data, loading: query.isLoading, error: queryError as string | null, ...rest };
};

export const useAddSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => timetableService.addSlot(data),
    onSuccess: () => {
      toast.success('Créneau ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
    },
    onError: (err: Error) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || err.message || 'Erreur lors de l\'ajout';
      toast.error(msg);
    },
  });
};

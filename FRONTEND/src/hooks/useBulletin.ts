import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notesService } from '../services/notes';

export const useBulletin = () => {
  return useMutation({
    mutationFn: ({ studentId, periodId, year }: { studentId: number; periodId: number; year: string }) =>
      notesService.generateReportCard(studentId, periodId, year),
    onSuccess: () => toast.success('Bulletin généré avec succès'),
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

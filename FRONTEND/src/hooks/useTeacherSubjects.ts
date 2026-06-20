import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teacherSubjectService } from '../services/teacher-subjects';
import { extractData } from '../lib/utils';

export const useTeacherSubjects = () => {
  return useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: () => teacherSubjectService.getAssignments().then(res => extractData<Record<string, unknown>[]>(res)),
  });
};

export const useMyAssignments = () => {
  return useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => teacherSubjectService.getMyAssignments().then(res => extractData<Record<string, unknown>[]>(res)),
  });
};

export const useCreateTeacherSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { teacher_id: number; subject_id: number; class_id: number }) =>
      teacherSubjectService.createAssignment(data),
    onSuccess: () => {
      toast.success('Affectation créée');
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteTeacherSubject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => teacherSubjectService.deleteAssignment(id),
    onSuccess: () => {
      toast.success('Affectation supprimée');
      qc.invalidateQueries({ queryKey: ['teacher-subjects'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

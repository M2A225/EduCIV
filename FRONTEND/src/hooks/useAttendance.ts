import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attendanceService } from '../services/attendance';
import { extractData } from '../lib/utils';
import type { AttendanceSession, MarkAttendanceDto, AttendanceStatus } from '../types';

export const useAttendanceSessions = () => {
  const query = useQuery({
    queryKey: ['attendance-sessions'],
    queryFn: () => attendanceService.getAttendanceSessions().then(res => extractData<AttendanceSession[]>(res)),
  });
  return { ...query, sessions: query.data, loading: query.isLoading };
};

export const useAttendance = (studentId?: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', studentId],
    queryFn: () => attendanceService.getAttendance(studentId).then(res => {
      const body = res.data as Record<string, unknown>;
      return (body?.data ?? body ?? []) as Record<string, unknown>[];
    }),
  });

  return { attendance: data, loading: isLoading, error: error?.message ?? null, refetch };
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { class_id: number; subject_id: number; timetable_id: number; date: string }) =>
      attendanceService.createSession(data),
    onSuccess: () => {
      toast.success('Séance créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, student_id, status }: { sessionId: number; student_id: number; status: AttendanceStatus }) =>
      attendanceService.markAttendance(sessionId, { student_id, status } as MarkAttendanceDto),
    onSuccess: () => {
      toast.success('Présences enregistrées');
      queryClient.invalidateQueries({ queryKey: ['attendance', 'attendance-sessions'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentService } from '../services/payments';
import { extractData } from '../lib/utils';
import type { Payment, PaymentAuditLog } from '../types';

export const usePayments = (studentId?: number) => {
  const query = useQuery({
    queryKey: ['payments', studentId],
    queryFn: () => paymentService.getPayments(studentId).then(res => extractData<Payment[]>(res)),
  });
  return { ...query, payments: query.data, loading: query.isLoading };
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => paymentService.createPayment(data),
    onSuccess: () => {
      toast.success('Paiement créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useCancelPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentService.cancelPayment(id),
    onSuccess: () => {
      toast.success('Paiement annulé');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => paymentService.getAuditLogs().then(res => extractData<PaymentAuditLog[]>(res)),
  });
};

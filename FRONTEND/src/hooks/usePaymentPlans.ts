import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentPlanService } from '../services/payment-plans';
import { extractData } from '../lib/utils';
import type { PaymentPlan } from '../types';

export const usePaymentPlans = () => {
  return useQuery({
    queryKey: ['payment-plans'],
    queryFn: () => paymentPlanService.getPlans().then(res => extractData<PaymentPlan[]>(res)),
  });
};

export const useCreatePaymentPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; total_amount: number }) => paymentPlanService.createPlan(data),
    onSuccess: () => {
      toast.success('Plan de paiement créé');
      qc.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
};

export const useDeletePaymentPlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => paymentPlanService.deletePlan(id),
    onSuccess: () => {
      toast.success('Plan de paiement supprimé');
      qc.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });
};

import { api } from './api';

export interface CreatePaymentPlanInput {
  name: string;
  total_amount: number;
}

export const paymentPlanService = {
  getPlans: async () => {
    const res = await api.get('/payment-plans');
    return res.data;
  },
  getPlan: async (id: number) => {
    const res = await api.get(`/payment-plans/${id}`);
    return res.data;
  },
  createPlan: async (data: CreatePaymentPlanInput) => {
    const res = await api.post('/payment-plans', data);
    return res.data;
  },
  updatePlan: async (id: number, data: Partial<CreatePaymentPlanInput>) => {
    const res = await api.patch(`/payment-plans/${id}`, data);
    return res.data;
  },
  deletePlan: async (id: number) => {
    const res = await api.delete(`/payment-plans/${id}`);
    return res.data;
  },
  bulkCreate: async (plans: CreatePaymentPlanInput[]) => {
    const res = await api.post('/payment-plans/bulk', { plans });
    return res.data;
  },
};

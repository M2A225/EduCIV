import { api } from './api';

export interface CreatePaymentPlanInput {
  name: string;
  total_amount: number;
}

export const paymentPlanService = {
  getPlans: async () => api.get('/payment-plans'),
  getPlan: async (id: number) => api.get(`/payment-plans/${id}`),
  createPlan: async (data: CreatePaymentPlanInput) => api.post('/payment-plans', data),
  updatePlan: async (id: number, data: Partial<CreatePaymentPlanInput>) => api.patch(`/payment-plans/${id}`, data),
  deletePlan: async (id: number) => api.delete(`/payment-plans/${id}`),
  bulkCreate: async (plans: CreatePaymentPlanInput[]) => api.post('/payment-plans/bulk', { plans }),
};

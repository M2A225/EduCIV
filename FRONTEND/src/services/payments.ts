import { api } from './api';

export interface CreatePaymentInput {
  amount_fcfa: number;
  receipt_number: string;
  payment_type: 'SCOLARITE' | 'CANTINE' | 'INSCRIPTION' | 'TRANSPORT' | 'AUTRE';
  payment_date: string;
  student_id: number;
  plan_id?: number;
}

export const paymentService = {
  getPayments: async (studentId?: number) => {
    const params = studentId ? { student_id: studentId } : {};
    return api.get('/payments', { params });
  },
  createPayment: async (data: CreatePaymentInput) => {
    return api.post('/payments', data);
  },
  cancelPayment: async (id: number) => {
    return api.post(`/payments/${id}/cancel`);
  },
  getAuditLogs: async () => {
    return api.get('/payments/audit');
  },
};

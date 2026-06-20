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
    const res = await api.get('/payments', { params });
    return res.data;
  },
  createPayment: async (data: CreatePaymentInput) => {
    const res = await api.post('/payments', data);
    return res.data;
  },
  cancelPayment: async (id: number) => {
    const res = await api.post(`/payments/${id}/cancel`);
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get('/payments/audit');
    return res.data;
  },
};

import { api } from './api';

export interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalPayments?: number;
  totalIncidents?: number;
  attendanceRate?: number;
  paymentCollectionRate?: number;
  [key: string]: unknown;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: Array<{
    id: string | number;
    type: string;
    description: string;
    date: string;
  }>;
}

export const dashboardService = {
  getDashboardData: async () => {
    const res = await api.get<DashboardData>('/dashboard');
    return res.data;
  },
  getDirectorDashboard: async () => {
    const res = await api.get<DashboardData>('/dashboard/director');
    return res.data;
  },
  getTeacherDashboard: async () => {
    const res = await api.get<DashboardData>('/dashboard/teacher');
    return res.data;
  },
  getParentDashboard: async () => {
    const res = await api.get<DashboardData>('/dashboard/parent');
    return res.data;
  },
  getStudentDashboard: async () => {
    const res = await api.get<DashboardData>('/dashboard/student');
    return res.data;
  },
};

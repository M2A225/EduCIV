import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { QueryProvider } from './providers/QueryProvider';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/director/DashboardPage';
import { AttendancePage } from './pages/director/AttendancePage';
import { StudentsPage } from './pages/director/StudentsPage';
import { TimetablePage } from './pages/director/TimetablePage';
import { ClassesPage } from './pages/director/ClassesPage';
import { TeachersPage } from './pages/director/TeachersPage';
import { PaymentsPage } from './pages/director/PaymentsPage';
import { PlaceholderPage } from './pages/director/PlaceholderPage';
import { BackofficeDashboard } from './pages/backoffice/BackofficeDashboard';

export const AppRouter = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="absences" element={<AttendancePage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="timetables" element={<TimetablePage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="bulletins" element={<PlaceholderPage title="Bulletins" />} />
              <Route path="backoffice" element={<BackofficeDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
};

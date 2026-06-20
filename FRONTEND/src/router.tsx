import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { MotionProvider } from './components/providers/MotionProvider';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoadingState } from './components/ui/LoadingState';

const lazyLoad = <T extends Record<string, any>>(fn: () => Promise<T>, name: keyof T) =>
  lazy(() => fn().then(m => ({ default: m[name] })));

const LoginPage = lazyLoad(() => import('./pages/LoginPage'), 'LoginPage');
const ForgotPasswordPage = lazyLoad(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyLoad(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage');
const NotFoundPage = lazyLoad(() => import('./pages/NotFoundPage'), 'NotFoundPage');
const DashboardPage = lazyLoad(() => import('./pages/director/DashboardPage'), 'DashboardPage');
const AttendancePage = lazyLoad(() => import('./pages/director/AttendancePage'), 'AttendancePage');
const StudentsPage = lazyLoad(() => import('./pages/director/StudentsPage'), 'StudentsPage');
const TimetablePage = lazyLoad(() => import('./pages/director/TimetablePage'), 'TimetablePage');
const ClassesPage = lazyLoad(() => import('./pages/director/ClassesPage'), 'ClassesPage');
const TeachersPage = lazyLoad(() => import('./pages/director/TeachersPage'), 'TeachersPage');
const PaymentsPage = lazyLoad(() => import('./pages/director/PaymentsPage'), 'PaymentsPage');
const NotesPage = lazyLoad(() => import('./pages/director/NotesPage'), 'NotesPage');
const BulletinsPage = lazyLoad(() => import('./pages/director/BulletinsPage'), 'BulletinsPage');
const SubjectsPage = lazyLoad(() => import('./pages/director/SubjectsPage'), 'SubjectsPage');
const IncidentsPage = lazyLoad(() => import('./pages/director/IncidentsPage'), 'IncidentsPage');
const PeriodsPage = lazyLoad(() => import('./pages/director/PeriodsPage'), 'PeriodsPage');
const SchoolSettingsPage = lazyLoad(() => import('./pages/director/SchoolSettingsPage'), 'SchoolSettingsPage');
const BulkImportPage = lazyLoad(() => import('./pages/director/BulkImportPage'), 'BulkImportPage');
const FilieresPage = lazyLoad(() => import('./pages/settings/FilieresPage'), 'FilieresPage');
const ProgressionPage = lazyLoad(() => import('./pages/director/ProgressionPage'), 'ProgressionPage');
const ProgressionVotePage = lazyLoad(() => import('./pages/teacher/ProgressionVotePage'), 'ProgressionVotePage');
const ArchivePage = lazyLoad(() => import('./pages/settings/ArchivePage'), 'ArchivePage');
const StatisticsPage = lazyLoad(() => import('./pages/progression/StatisticsPage'), 'StatisticsPage');
const FinancialClosePage = lazyLoad(() => import('./pages/progression/FinancialClosePage'), 'FinancialClosePage');
const NextYearPage = lazyLoad(() => import('./pages/progression/NextYearPage'), 'NextYearPage');
const DirectorUsersPage = lazyLoad(() => import('./pages/director/UsersPage'), 'UsersPage');
const ParentsPage = lazyLoad(() => import('./pages/director/ParentsPage'), 'ParentsPage');
const BackofficeDashboard = lazyLoad(() => import('./pages/backoffice/BackofficeDashboard'), 'BackofficeDashboard');
const BackofficeUsers = lazyLoad(() => import('./pages/backoffice/UsersPage'), 'BackofficeUsers');
const BackofficeSchools = lazyLoad(() => import('./pages/backoffice/SchoolsPage'), 'BackofficeSchools');
const BackofficeSchoolManage = lazyLoad(() => import('./pages/backoffice/SchoolManagePage'), 'SchoolManagePage');
const BackofficeUserManage = lazyLoad(() => import('./pages/backoffice/UserManagePage'), 'BackofficeUserManage');
const BackofficeSchoolGroups = lazyLoad(() => import('./pages/backoffice/SchoolGroupsPage'), 'BackofficeSchoolGroups');
const BackofficeAuditPage = lazyLoad(() => import('./pages/backoffice/AuditPage'), 'BackofficeAuditPage');
const BackofficeCitiesPage = lazyLoad(() => import('./pages/backoffice/CitiesManagementPage'), 'CitiesManagementPage');
const TeacherDashboard = lazyLoad(() => import('./pages/teacher/TeacherDashboard'), 'TeacherDashboard');
const TeacherAttendancePage = lazyLoad(() => import('./pages/teacher/TeacherAttendancePage'), 'TeacherAttendancePage');
const TeacherNotesPage = lazyLoad(() => import('./pages/teacher/TeacherNotesPage'), 'TeacherNotesPage');
const TeacherTimetablePage = lazyLoad(() => import('./pages/teacher/TeacherTimetablePage'), 'TeacherTimetablePage');
const ParentDashboard = lazyLoad(() => import('./pages/parent/ParentDashboard'), 'ParentDashboard');
const ParentPaymentsPage = lazyLoad(() => import('./pages/parent/ParentPaymentsPage'), 'ParentPaymentsPage');
const ParentNotesPage = lazyLoad(() => import('./pages/parent/ParentNotesPage'), 'ParentNotesPage');
const ParentAttendancePage = lazyLoad(() => import('./pages/parent/ParentAttendancePage'), 'ParentAttendancePage');
const ParentTimetablePage = lazyLoad(() => import('./pages/parent/ParentTimetablePage'), 'ParentTimetablePage');
const SetupWizardDirector = lazyLoad(() => import('./pages/setup/SetupWizardDirector'), 'SetupWizardDirector');
const SetupWizardAccountant = lazyLoad(() => import('./pages/setup/SetupWizardAccountant'), 'SetupWizardAccountant');
const WaitingForDirectorPage = lazyLoad(() => import('./pages/setup/WaitingForDirectorPage'), 'WaitingForDirectorPage');
const AccountantDashboard = lazyLoad(() => import('./pages/accountant/AccountantDashboard'), 'AccountantDashboard');
const AccountantSettingsPage = lazyLoad(() => import('./pages/accountant/AccountantSettingsPage'), 'AccountantSettingsPage');
const AccountantPaymentPlansPage = lazyLoad(() => import('./pages/accountant/AccountantPaymentPlansPage'), 'AccountantPaymentPlansPage');
const CashierDashboard = lazyLoad(() => import('./pages/cashier/CashierDashboard'), 'CashierDashboard');
const CashierSearchPage = lazyLoad(() => import('./pages/cashier/CashierSearchPage'), 'CashierSearchPage');
const EducatorDashboard = lazyLoad(() => import('./pages/educator/EducatorDashboard'), 'EducatorDashboard');
const EducatorAttendancePage = lazyLoad(() => import('./pages/educator/EducatorAttendancePage'), 'EducatorAttendancePage');
const EducatorIncidentsPage = lazyLoad(() => import('./pages/educator/EducatorIncidentsPage'), 'EducatorIncidentsPage');

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RoleIndexRedirect = () => {
  const { user } = useAuth();
  const roleRedirects: Record<string, string> = {
    BACKOFFICE: '/backoffice', TEACHER: '/teacher',
    PARENT: '/parent',
    ACCOUNTANT: '/accountant', CASHIER: '/cashier', EDUCATOR: '/educator',
  };
  if (user && roleRedirects[user.role]) return <Navigate to={roleRedirects[user.role]} replace />;
  return <Suspense fallback={<LoadingState type="card" count={4} />}><DashboardPage /></Suspense>;
};

export const AppRouter = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
      <MotionProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingState />}>
                    <LoginPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingState />}>
                    <ForgotPasswordPage />
                  </Suspense>
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingState />}>
                    <ResetPasswordPage />
                  </Suspense>
                </PublicRoute>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                {/* Role-based index redirect */}
                <Route index element={<RoleIndexRedirect />} />
                <Route path="absences" element={<Suspense fallback={<LoadingState />}><AttendancePage /></Suspense>} />
                <Route path="students" element={<Suspense fallback={<LoadingState />}><StudentsPage /></Suspense>} />
                <Route path="classes" element={<Suspense fallback={<LoadingState />}><ClassesPage /></Suspense>} />
                <Route element={<ProtectedRoute allowedRoles={['DIRECTOR']} />}>
                  <Route path="timetables" element={<Suspense fallback={<LoadingState />}><TimetablePage /></Suspense>} />
                </Route>
                <Route path="teachers" element={<Suspense fallback={<LoadingState />}><TeachersPage /></Suspense>} />
                <Route path="payments" element={<Suspense fallback={<LoadingState />}><PaymentsPage /></Suspense>} />
                <Route path="notes" element={<Suspense fallback={<LoadingState />}><NotesPage /></Suspense>} />
                <Route path="bulletins" element={<Suspense fallback={<LoadingState />}><BulletinsPage /></Suspense>} />
                <Route path="incidents" element={<Suspense fallback={<LoadingState />}><IncidentsPage /></Suspense>} />
                <Route path="periods" element={<Suspense fallback={<LoadingState />}><PeriodsPage /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<LoadingState />}><SchoolSettingsPage /></Suspense>} />
                <Route path="settings/subjects" element={<Suspense fallback={<LoadingState />}><SubjectsPage /></Suspense>} />
                <Route path="settings/import" element={<Suspense fallback={<LoadingState />}><BulkImportPage /></Suspense>} />
                <Route path="settings/filieres" element={<Suspense fallback={<LoadingState />}><FilieresPage /></Suspense>} />
                <Route path="settings/archive" element={<Suspense fallback={<LoadingState />}><ArchivePage /></Suspense>} />
                <Route path="settings/statistics" element={<Suspense fallback={<LoadingState />}><StatisticsPage /></Suspense>} />
                <Route path="settings/financial" element={<Suspense fallback={<LoadingState />}><FinancialClosePage /></Suspense>} />
                <Route path="settings/next-year" element={<Suspense fallback={<LoadingState />}><NextYearPage /></Suspense>} />
                <Route path="progression" element={<Suspense fallback={<LoadingState />}><ProgressionPage /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<LoadingState />}><DirectorUsersPage /></Suspense>} />
                <Route path="parents" element={<Suspense fallback={<LoadingState />}><ParentsPage /></Suspense>} />

                {/* Teacher routes */}
                <Route path="teacher" element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><TeacherDashboard /></Suspense>} />
                  <Route path="attendance" element={<Suspense fallback={<LoadingState />}><TeacherAttendancePage /></Suspense>} />
                  <Route path="notes" element={<Suspense fallback={<LoadingState />}><TeacherNotesPage /></Suspense>} />
                  <Route path="timetable" element={<Suspense fallback={<LoadingState />}><TeacherTimetablePage /></Suspense>} />
                  <Route path="progression" element={<Suspense fallback={<LoadingState />}><ProgressionVotePage /></Suspense>} />
                </Route>

                {/* Parent routes */}
                <Route path="parent" element={<ProtectedRoute allowedRoles={['PARENT']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><ParentDashboard /></Suspense>} />
                <Route path="payments" element={<Suspense fallback={<LoadingState />}><ParentPaymentsPage /></Suspense>} />
                <Route path="notes" element={<Suspense fallback={<LoadingState />}><ParentNotesPage /></Suspense>} />
                <Route path="attendance" element={<Suspense fallback={<LoadingState />}><ParentAttendancePage /></Suspense>} />
                <Route path="timetable" element={<Suspense fallback={<LoadingState />}><ParentTimetablePage /></Suspense>} />
                </Route>



                {/* Accountant routes */}
                <Route path="accountant" element={<ProtectedRoute allowedRoles={['ACCOUNTANT']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><AccountantDashboard /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<LoadingState />}><AccountantSettingsPage /></Suspense>} />
                  <Route path="settings/plans" element={<Suspense fallback={<LoadingState />}><AccountantPaymentPlansPage /></Suspense>} />
                  <Route path="financial" element={<Suspense fallback={<LoadingState />}><FinancialClosePage /></Suspense>} />
                </Route>

                {/* Cashier routes */}
                <Route path="cashier" element={<ProtectedRoute allowedRoles={['CASHIER']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><CashierDashboard /></Suspense>} />
                  <Route path="search" element={<Suspense fallback={<LoadingState />}><CashierSearchPage /></Suspense>} />
                </Route>

                {/* Educator routes */}
                <Route path="educator" element={<ProtectedRoute allowedRoles={['EDUCATOR']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><EducatorDashboard /></Suspense>} />
                  <Route path="attendance" element={<Suspense fallback={<LoadingState />}><EducatorAttendancePage /></Suspense>} />
                  <Route path="incidents" element={<Suspense fallback={<LoadingState />}><EducatorIncidentsPage /></Suspense>} />
                </Route>

                {/* Backoffice routes */}
                <Route path="backoffice" element={<ProtectedRoute allowedRoles={['BACKOFFICE']} />}>
                  <Route index element={<Suspense fallback={<LoadingState type="card" count={3} />}><BackofficeDashboard /></Suspense>} />
                  <Route path="users" element={<Suspense fallback={<LoadingState />}><BackofficeUsers /></Suspense>} />
                  <Route path="users/:id" element={<Suspense fallback={<LoadingState />}><BackofficeUserManage /></Suspense>} />
                  <Route path="schools" element={<Suspense fallback={<LoadingState />}><BackofficeSchools /></Suspense>} />
                  <Route path="schools/:id" element={<Suspense fallback={<LoadingState />}><BackofficeSchoolManage /></Suspense>} />
                  <Route path="school-groups" element={<Suspense fallback={<LoadingState />}><BackofficeSchoolGroups /></Suspense>} />
                  <Route path="audit" element={<Suspense fallback={<LoadingState />}><BackofficeAuditPage /></Suspense>} />
                  <Route path="cities" element={<Suspense fallback={<LoadingState />}><BackofficeCitiesPage /></Suspense>} />
                </Route>
              </Route>
            </Route>

            {/* Setup wizard routes — accessible sans SchoolPicker */}
            <Route element={<ProtectedRoute />}>
              <Route path="/setup/director" element={<Suspense fallback={<LoadingState />}><SetupWizardDirector /></Suspense>} />
              <Route path="/setup/accountant" element={<Suspense fallback={<LoadingState />}><SetupWizardAccountant /></Suspense>} />
              <Route path="/setup/waiting" element={<Suspense fallback={<LoadingState />}><WaitingForDirectorPage /></Suspense>} />
            </Route>

            <Route path="*" element={<Suspense fallback={<LoadingState />}><NotFoundPage /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MotionProvider>
    </ThemeProvider>
    </QueryProvider>
  );
};

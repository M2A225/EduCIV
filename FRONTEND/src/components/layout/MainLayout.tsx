import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { LoadingState } from '../ui/LoadingState';
import { PageTransition } from '../ui/PageTransition';

export const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          onToggleSidebar={handleToggleSidebar}
          collapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto" style={{ maxWidth: 'var(--container-max)' }}>
            <ErrorBoundary fallback={<LoadingState type="card" count={3} />}>
              <PageTransition>
                <Outlet />
              </PageTransition>
            </ErrorBoundary>
          </div>
          <SyncStatusIndicator />
        </main>
      </div>
    </div>
  );
};

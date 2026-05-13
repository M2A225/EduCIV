import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_CONFIG } from '../../config/navigation';
import { SyncStatusIndicator } from '../sync/SyncStatusIndicator';

export const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user?.role || 'STUDENT';
  const filteredNav = NAV_CONFIG.filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / Mobile Nav */}
      <nav className="bg-blue-900 text-white w-full md:w-64 p-4 flex flex-col">
        <div className="text-xl font-bold mb-8">EduCIV</div>
        <div className="flex-grow space-y-2">
          {filteredNav.map(item => (
            <Link key={item.path} to={item.path} className="block p-2 hover:bg-blue-800 rounded transition">
              {item.label}
            </Link>
          ))}
          <div className="text-sm opacity-70 mt-4 mb-4 border-t border-blue-800 pt-4">
            Rôle: {role}
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-800 hover:bg-red-700 p-2 rounded transition w-full text-left"
        >
          Déconnexion
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <Outlet />
        <SyncStatusIndicator />
      </main>
    </div>
  );
};

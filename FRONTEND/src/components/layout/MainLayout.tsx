import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const MainLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / Mobile Nav */}
      <nav className="bg-blue-900 text-white w-full md:w-64 p-4 flex flex-col">
        <div className="text-xl font-bold mb-8">EduCIV</div>
        <div className="flex-grow space-y-2">
          <Link to="/" className="block p-2 hover:bg-blue-800 rounded">Dashboard</Link>
          <Link to="/absences" className="block p-2 hover:bg-blue-800 rounded">Absences</Link>
          <Link to="/students" className="block p-2 hover:bg-blue-800 rounded">Élèves</Link>
          <Link to="/classes" className="block p-2 hover:bg-blue-800 rounded">Classes</Link>
          <Link to="/timetables" className="block p-2 hover:bg-blue-800 rounded">Emploi du temps</Link>
          <Link to="/teachers" className="block p-2 hover:bg-blue-800 rounded">Enseignants</Link>
          <Link to="/payments" className="block p-2 hover:bg-blue-800 rounded">Paiements</Link>
          <Link to="/bulletins" className="block p-2 hover:bg-blue-800 rounded">Bulletins</Link>
          <div className="text-sm opacity-70 mt-4 mb-4">Rôle: {user?.role || 'Utilisateur'}</div>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-800 hover:bg-red-700 p-2 rounded transition"
        >
          Déconnexion
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

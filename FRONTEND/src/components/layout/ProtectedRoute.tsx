import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSetup } from '../../hooks/useSetup';
import { useSchools } from '../../hooks/useSchools';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Building2 } from 'lucide-react';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const SchoolPicker = () => {
  const { schoolIds, setCurrentSchoolId } = useAuth();
  const { data: schools } = useSchools();
  const navigate = useNavigate();

  const handleSelect = (id: number) => {
    setCurrentSchoolId(id);
    navigate('/', { replace: true });
  };

  const schoolMap: Record<number, string> = {};
  if (Array.isArray(schools)) {
    schools.forEach(s => { schoolMap[s.id] = s.name; });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text">Sélectionnez votre école</h2>
          <p className="text-text/60 text-sm mt-2">Vous avez accès à plusieurs établissements</p>
        </div>
        <div className="space-y-3">
          {schoolIds.map(id => (
            <Button
              key={id}
              variant="glass"
              className="w-full flex items-center gap-3 py-4 text-left justify-start"
              onClick={() => handleSelect(id)}
            >
              <Building2 className="w-5 h-5 text-primary shrink-0" />
              <span className="font-medium">{schoolMap[id] || `École #${id}`}</span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps = {}) => {
  const { token, activeRole, schoolIds, currentSchoolId } = useAuth();
  const { setupStatus, loading } = useSetup();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
    return <Navigate to="/" replace />;
  }

  if (schoolIds.length > 1 && !currentSchoolId) {
    return <SchoolPicker />;
  }

  if (loading) return null;

  if (activeRole === 'DIRECTOR' && setupStatus && !setupStatus.director_completed) {
    return <Navigate to="/setup/director" replace />;
  }

  if (activeRole === 'ACCOUNTANT' && setupStatus) {
    if (!setupStatus.director_completed) {
      return <Navigate to="/setup/waiting" replace />;
    }
    if (!setupStatus.accountant_completed) {
      return <Navigate to="/setup/accountant" replace />;
    }
  }

  return <Outlet />;
};
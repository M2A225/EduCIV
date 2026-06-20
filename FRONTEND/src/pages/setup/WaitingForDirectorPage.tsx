import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSetup } from '../../hooks/useSetup';
import { Card } from '../../components/ui/Card';
import { Clock, Building2 } from 'lucide-react';

export const WaitingForDirectorPage = () => {
  const { activeRole } = useAuth();
  const { setupStatus, loading } = useSetup();

  if (loading) return null;
  if (activeRole !== 'ACCOUNTANT') return <Navigate to="/" replace />;
  if (setupStatus?.director_completed) return <Navigate to="/setup/accountant" replace />;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Configuration en attente</h2>
        <p className="text-text/60">
          Le directeur de votre établissement n'a pas encore finalisé la configuration initiale de l'école.
          Veuillez le contacter pour qu'il termine l'assistant de configuration.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-text/50 pt-4">
          <Building2 className="w-4 h-4" />
          <span>Vous pourrez configurer les plans de paiement dès que le directeur aura terminé.</span>
        </div>
      </Card>
    </div>
  );
};

import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';

export const EducatorDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title={`Éducateur - ${user?.name || 'Éducateur'}`} size="md" />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl bg-red-50/50">
          <div className="text-sm text-text/60 mb-1">Absences du jour</div>
          <div className="text-3xl font-bold text-red-600">0</div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="text-sm text-text/60 mb-1">Appels en attente</div>
          <div className="text-3xl font-bold">0</div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <div className="text-sm text-text/60 mb-1">Incidents récents</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <a href="/educator/attendance" className="glass p-6 rounded-2xl hover:shadow-lg transition-shadow block">
          <h2 className="text-lg font-semibold mb-2">Suivi des appels</h2>
          <p className="text-text/60">Voir le statut des appels par classe</p>
        </a>

        <a href="/educator/incidents" className="glass p-6 rounded-2xl hover:shadow-lg transition-shadow block">
          <h2 className="text-lg font-semibold mb-2">Incidents</h2>
          <p className="text-text/60">Gérer les incidents disciplinaires</p>
        </a>
      </div>
    </div>
  );
};

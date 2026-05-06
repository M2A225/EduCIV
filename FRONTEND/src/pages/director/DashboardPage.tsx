import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';

export const DashboardPage = () => {
  // Simulating loading state
  const isLoading = false;

  if (isLoading) return <LoadingState type="card" count={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Élèves</p>
          <p className="text-2xl font-bold">1,240</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Classes</p>
          <p className="text-2xl font-bold">32</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Paiements (Aujourd'hui)</p>
          <p className="text-2xl font-bold text-green-600">450,000 FCFA</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Taux Présence</p>
          <p className="text-2xl font-bold text-blue-900">92%</p>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold mb-4">Alertes</h2>
          <ul className="space-y-2 text-sm">
            <li className="text-red-600">⚠️ 3 appels non effectués aujourd'hui</li>
            <li className="text-orange-600">⚠️ 12 paiements en retard</li>
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-4">Actions Rapides</h2>
          <div className="flex gap-2">
            <button className="bg-blue-900 text-white px-3 py-1 rounded text-sm">Ajouter Élève</button>
            <button className="bg-blue-900 text-white px-3 py-1 rounded text-sm">Générer Bulletin</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

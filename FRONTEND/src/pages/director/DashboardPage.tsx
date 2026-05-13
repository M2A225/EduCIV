import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['director-stats', user?.school_id],
    queryFn: () => api.get(`/schools/stats?school_id=${user?.school_id}`).then(res => res.data.data),
    enabled: !!user?.school_id
  });

  if (isLoading) return <LoadingState type="card" count={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total Élèves</p>
          <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Classes</p>
          <p className="text-2xl font-bold">{stats?.totalClasses || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Paiements (Aujourd'hui)</p>
          <p className="text-2xl font-bold text-green-600">{stats?.todayPayments || 0} FCFA</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Taux Présence</p>
          <p className="text-2xl font-bold text-blue-900">{stats?.attendanceRate || 0}%</p>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-bold mb-4">Alertes</h2>
          <ul className="space-y-2 text-sm">
            {stats?.alerts?.map((alert: string, i: number) => (
                <li key={i} className="text-red-600">⚠️ {alert}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold mb-4">Actions Rapides</h2>
          <div className="flex gap-2">
            <Button className="w-auto">Ajouter Élève</Button>
            <Button variant="outline" className="w-auto">Générer Bulletin</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

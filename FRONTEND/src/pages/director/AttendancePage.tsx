import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Table } from '../../components/ui/Table';
import { api } from '../../services/api';

export const AttendancePage = () => {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get('/attendance').then(res => res.data),
  });

  if (isLoading) return <LoadingState type="list" count={5} />;

  const columns = [
    { header: 'Classe', accessor: (row: any) => row.class },
    { header: 'Heure', accessor: (row: any) => row.time },
    { header: 'Professeur', accessor: (row: any) => row.teacher },
    { 
      header: 'Statut', 
      accessor: (row: any) => row.status === 'done' ? (
        <span className="text-green-600 font-bold">✅ Fait</span>
      ) : (
        <span className="text-red-600 font-bold">❌ Non fait</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Suivi des Appels</h1>
      
      <Card>
        <Table data={attendanceData || []} columns={columns} />
      </Card>
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';

export const ClassesPage = () => {
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(res => res.data),
  });

  const columns = [
    { header: 'Nom', accessor: (row: any) => row.name },
    { header: 'Effectif', accessor: (row: any) => row.capacity },
    { header: 'Prof. Principal', accessor: (row: any) => row.teacher },
    { 
      header: 'Actions', 
      accessor: (row: any) => <Button variant="outline" className="text-xs">Voir</Button>
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Classes</h1>
        <Button>+ Créer Classe</Button>
      </div>
      <Card>
        <Table data={classesData || []} columns={columns} />
      </Card>
    </div>
  );
};

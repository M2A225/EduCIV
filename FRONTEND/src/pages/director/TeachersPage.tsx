import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';

export const TeachersPage = () => {
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then(res => res.data),
  });

  const columns = [
    { header: 'Nom', accessor: (row: any) => row.name },
    { header: 'Matière', accessor: (row: any) => row.subject },
    { header: 'Classes', accessor: (row: any) => row.classes },
    { 
      header: 'Actions', 
      accessor: (row: any) => <Button variant="outline" className="text-xs">Modifier</Button>
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Enseignants</h1>
        <Button>+ Ajouter</Button>
      </div>
      <Card>
        <Table data={teachersData || []} columns={columns} />
      </Card>
    </div>
  );
};

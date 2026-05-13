import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

export const BackofficeSchools = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: () => api.get('/schools').then(res => res.data)
  });

  const columns = [
    { header: 'ID', accessor: (s: any) => s.id },
    { header: 'Nom', accessor: (s: any) => s.name },
    { header: 'School ID', accessor: (s: any) => s.school_id },
    { 
      header: 'Actions', 
      accessor: (s: any) => <Button variant="outline" className="py-1 text-xs">Gérer</Button> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Écoles</h1>
        <Button>Nouvelle École</Button>
      </div>
      <Card>
        <Table data={data || []} columns={columns} isLoading={isLoading} />
      </Card>
    </div>
  );
};

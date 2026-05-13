import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export const BackofficeUsers = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(res => res.data)
  });

  const columns = [
    { header: 'Email', accessor: (u: any) => u.email },
    { header: 'Rôle', accessor: (u: any) => u.role },
    { header: 'École ID', accessor: (u: any) => u.school_id },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
      <Card>
        <Table data={data || []} columns={columns} isLoading={isLoading} />
      </Card>
    </div>
  );
};

import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';
import { Payment } from '../../types';

export const PaymentsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(res => res.data.data),
  });

  const columns = [
    { header: 'Numéro Reçu', accessor: (row: Payment) => row.receipt_number },
    { header: 'Montant', accessor: (row: Payment) => <span className="font-bold text-green-700">{row.amount_fcfa} FCFA</span> },
    { header: 'Statut', accessor: (row: Payment) => row.status },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Suivi des Paiements</h1>
      <Card>
        <Table data={data || []} columns={columns} />
      </Card>
    </div>
  );
};

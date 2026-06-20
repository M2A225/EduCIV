import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePayments } from '../../hooks/usePayments';
import { CreditCard } from 'lucide-react';
import type { Payment } from '../../types';

const typeLabels: Record<string, string> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  INSCRIPTION: 'Inscription',
  TRANSPORT: 'Transport',
  AUTRE: 'Autre',
};

export const StudentPaymentsPage = () => {
  const { payments, loading } = usePayments();

  const totalPaid = payments
    ?.filter((p: Payment) => p.status === 'VALIDE')
    .reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0) || 0;

  const columns: Column<Payment>[] = [
    { header: 'Reçu', accessor: (row: Payment) => <span className="font-medium text-text">{row.receipt_number}</span> },
    { header: 'Type', accessor: (row: Payment) => typeLabels[row.payment_type] || row.payment_type },
    { header: 'Montant', accessor: (row: Payment) => <span className="font-bold text-cta">{row.amount_fcfa?.toLocaleString()} FCFA</span> },
    { header: 'Date', accessor: (row: Payment) => new Date(row.payment_date).toLocaleDateString('fr-FR') },
    { header: 'Statut', accessor: (row: Payment) => (
      <StatusBadge status={row.status === 'VALIDE' ? 'Validé' : 'Annulé'} variant={row.status === 'VALIDE' ? 'green' : 'red'} />
    ) },
  ];

  if (loading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Mes Paiements" />

      <Card className="border border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-xl">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Total payé</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{totalPaid.toLocaleString()} FCFA</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data={payments || []} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
};

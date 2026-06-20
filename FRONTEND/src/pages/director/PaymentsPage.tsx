import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePayments } from '../../hooks/usePayments';
import type { Payment } from '../../types';

const statusLabels: Record<string, string> = {
  VALIDE: 'Validé',
  ANNULE: 'Annulé',
};

const statusVariant: Record<string, 'green' | 'red' | 'gray'> = {
  VALIDE: 'green',
  ANNULE: 'red',
};

const typeLabels: Record<string, string> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  INSCRIPTION: 'Inscription',
  TRANSPORT: 'Transport',
  AUTRE: 'Autre',
};

export const PaymentsPage = () => {
  const { payments, loading } = usePayments();

  const columns = [
    { header: 'Reçu', accessor: (row: Payment) => <span className="font-medium text-text">{row.receipt_number}</span> },
    { header: 'Type', accessor: (row: Payment) => <span className="text-sm">{typeLabels[row.payment_type] || row.payment_type}</span> },
    { header: 'Montant', accessor: (row: Payment) => <span className="font-bold text-cta">{row.amount_fcfa?.toLocaleString()} FCFA</span> },
    { header: 'Date', accessor: (row: Payment) => <span className="text-sm">{row.payment_date ? new Date(row.payment_date).toLocaleDateString('fr-FR') : '-'}</span> },
    { header: 'Statut', accessor: (row: Payment) => (
        <StatusBadge status={statusLabels[row.status] || row.status} variant={statusVariant[row.status] || 'gray'} />
    ) },
  ];

  if (loading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Suivi des Paiements" subtitle={`${(payments || []).length} paiement(s)`} />
      <Card className="overflow-hidden">
        <Table data={payments || []} columns={columns} />
      </Card>
    </div>
  );
};

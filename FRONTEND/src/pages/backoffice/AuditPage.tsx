import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuditLogs } from '../../hooks/usePayments';
import type { PaymentAuditLog } from '../../types';

const actionLabels: Record<string, string> = {
  CREATION: 'Création',
  ANNULATION: 'Annulation',
};

const actionVariants: Record<string, 'green' | 'red' | 'blue'> = {
  CREATION: 'green',
  ANNULATION: 'red',
};

export const BackofficeAuditPage = () => {
  const { data: logs, isLoading, error, refetch } = useAuditLogs();

  if (isLoading) return <LoadingState type="list" count={8} />;
  if (error) return <Feedback type="error" message="Erreur de chargement" onRetry={refetch} />;

  const columns: Column<PaymentAuditLog>[] = [
    { header: 'ID', accessor: (row: PaymentAuditLog) => <span className="font-mono text-sm">#{row.id}</span> },
    {
      header: 'Action',
      accessor: (row: PaymentAuditLog) => (
        <StatusBadge
          status={actionLabels[row.action] || row.action}
          variant={actionVariants[row.action] || 'blue'}
        />
      ),
    },
    {
      header: 'Paiement',
      accessor: (row: PaymentAuditLog) => <span className="font-mono text-sm">#{row.payment_id}</span>,
    },
    {
      header: 'Utilisateur',
      accessor: (row: PaymentAuditLog) => row.performed_by ? <span className="font-mono text-sm">#{row.performed_by}</span> : '-',
    },
    {
      header: 'Date',
      accessor: (row: PaymentAuditLog) => new Date(row.created_at).toLocaleString('fr-FR'),
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Journal d'audit"
        subtitle="Historique des actions sur les paiements"
      />

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Logs d'audit</CardTitle>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <Table data={logs} columns={columns} />
          ) : (
            <p className="text-text/60 text-center py-8">Aucun log d'audit</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

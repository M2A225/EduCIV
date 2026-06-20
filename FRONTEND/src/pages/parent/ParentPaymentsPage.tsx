import { usePayments } from '../../hooks/usePayments';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Payment } from '../../types';

const statusLabels: Record<string, string> = {
  VALIDE: 'Validé',
  ANNULE: 'Annulé',
};

const typeLabels: Record<string, string> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  INSCRIPTION: 'Inscription',
  TRANSPORT: 'Transport',
  AUTRE: 'Autre',
};

export const ParentPaymentsPage = () => {
  const { payments, loading, error } = usePayments();

  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error instanceof Error ? error.message : 'Une erreur est survenue'} />;

  return (
    <div>
      <PageHeader title="Paiements" size="sm" />

      <div className="grid gap-4">
        {payments?.map((payment: Payment) => (
          <div key={payment.id} className="glass p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{typeLabels[payment.payment_type] || payment.payment_type}</div>
                <div className="text-sm text-text/60">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{payment.amount_fcfa?.toLocaleString()} FCFA</div>
                <div className={`text-xs font-medium ${payment.status === 'VALIDE' ? 'text-green-600' : 'text-red-600'}`}>
                  {statusLabels[payment.status] || payment.status}
                </div>
              </div>
            </div>
          </div>
        ))}
        {payments?.length === 0 && (
          <div className="glass p-8 rounded-xl text-center text-text/60">
            Aucun paiement enregistré
          </div>
        )}
      </div>
    </div>
  );
};

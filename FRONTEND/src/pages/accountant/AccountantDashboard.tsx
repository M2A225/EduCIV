import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { usePayments } from '../../hooks/usePayments';
import { usePaymentPlans } from '../../hooks/usePaymentPlans';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CreditCard, TrendingUp, AlertCircle, BarChart3, PieChart } from 'lucide-react';
import type { Payment } from '../../types';

const typeLabels: Record<string, string> = {
  SCOLARITE: 'Scolarité',
  CANTINE: 'Cantine',
  INSCRIPTION: 'Inscription',
  TRANSPORT: 'Transport',
  AUTRE: 'Autre',
};

export const AccountantDashboard = () => {
  const { payments, loading: paymentsLoading } = usePayments();
  const { data: plans } = usePaymentPlans();
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: () => api.get('/payments/stats').then(res => extractData<any>(res)),
  });

  const totalReceived = payments
    ?.filter((p: Payment) => p.status === 'VALIDE')
    .reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0) || 0;

  const totalCancelled = payments
    ?.filter((p: Payment) => p.status === 'ANNULE')
    .reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0) || 0;

  const today = new Date().toDateString();
  const todayTotal = payments
    ?.filter((p: Payment) => p.status === 'VALIDE' && new Date(p.payment_date).toDateString() === today)
    .reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0) || 0;

  const recentPayments = payments?.slice(0, 10) || [];

  const columns = [
    { header: 'Reçu', accessor: (row: Payment) => <span className="font-medium text-text">{row.receipt_number}</span> },
    { header: 'Type', accessor: (row: Payment) => typeLabels[row.payment_type] || row.payment_type },
    { header: 'Montant', accessor: (row: Payment) => <span className="font-bold text-cta">{row.amount_fcfa?.toLocaleString()} FCFA</span> },
    { header: 'Plan', accessor: (row: any) => row.plan?.name || '-' },
    { header: 'Date', accessor: (row: Payment) => new Date(row.payment_date).toLocaleDateString('fr-FR') },
    { header: 'Statut', accessor: (row: Payment) => (
      <StatusBadge status={row.status === 'VALIDE' ? 'Validé' : 'Annulé'} variant={row.status === 'VALIDE' ? 'green' : 'red'} />
    ) },
  ];

  if (paymentsLoading || statsLoading) return <LoadingState type="card" count={4} />;

  const byType = statsData?.byType || {};
  const byMonth = statsData?.byMonth || {};

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader title="Tableau de bord Comptable" subtitle="Vue d'ensemble financière et consolidation" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-success-bg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-heading font-semibold text-text">Total encaissé</h3>
            </div>
            <p className="text-2xl font-bold text-success">{totalReceived.toLocaleString()} FCFA</p>
            <p className="text-xs text-text-muted mt-1">{statsData?.totalTransactions || 0} transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary-bg">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-text">Aujourd'hui</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{todayTotal.toLocaleString()} FCFA</p>
            <p className="text-xs text-text-muted mt-1">{statsData?.todayCount || 0} encaissements</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-error-bg">
                <AlertCircle className="w-5 h-5 text-error" />
              </div>
              <h3 className="font-heading font-semibold text-text">Annulé</h3>
            </div>
            <p className="text-2xl font-bold text-error">{totalCancelled.toLocaleString()} FCFA</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-info-bg">
                <BarChart3 className="w-5 h-5 text-info" />
              </div>
              <h3 className="font-heading font-semibold text-text">Plans actifs</h3>
            </div>
            <p className="text-2xl font-bold text-info">{plans?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {/* Breakdown by type */}
        <Card className="overflow-hidden hover:shadow-3 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(byType).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-text">{typeLabels[type] || type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(Number(amount) / totalReceived) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-text w-28 text-right">{Number(amount).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly evolution */}
        <Card className="overflow-hidden hover:shadow-3 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Évolution mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byMonth).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(byMonth).sort().reverse().slice(0, 12).map(([month, amount]) => (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm text-text">{month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cta rounded-full"
                          style={{ width: `${(Number(amount) / Math.max(...Object.values(byMonth).map(Number))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-text w-28 text-right">{Number(amount).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Plans Section */}
      {plans && plans.length > 0 && (
        <Card className="overflow-hidden hover:shadow-3 transition-all duration-300">
          <CardHeader>
            <CardTitle>Plans de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.map((plan: any) => {
                const planPayments = payments?.filter((p: any) => p.plan_id === plan.id && p.status === 'VALIDE') || [];
                const collected = planPayments.reduce((sum: number, p: any) => sum + p.amount_fcfa, 0);
                const remaining = Math.max(0, plan.total_amount - collected);
                const progress = plan.total_amount > 0 ? (collected / plan.total_amount) * 100 : 0;
                return (
                  <div key={plan.id} className="border border-border rounded-xl p-4 bg-surface">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold text-text">{plan.name}</span>
                        <span className="text-text-muted ml-2 text-sm">{planPayments.length} paiement(s)</span>
                      </div>
                      <span className="text-sm font-bold text-cta">{plan.total_amount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>Encaissé: {collected.toLocaleString()} FCFA</span>
                      <span>Reste: {remaining.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden hover:shadow-3 transition-all duration-300">
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data={recentPayments} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
};

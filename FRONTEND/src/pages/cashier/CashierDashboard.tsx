import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePayments } from '../../hooks/usePayments';
import { CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Payment } from '../../types';

export const CashierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { payments, loading } = usePayments();

  const today = new Date().toDateString();
  const todayPayments = payments?.filter((p: Payment) =>
    p.status === 'VALIDE' && new Date(p.payment_date).toDateString() === today
  ) || [];

  const todayTotal = todayPayments.reduce((sum: number, p: Payment) => sum + p.amount_fcfa, 0);

  if (loading) return <LoadingState type="card" count={2} />;

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader title={`Caisse - ${user?.name || 'Caissière'}`} subtitle="Encaissement rapide" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        <Card className="border border-success/20 hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-success-bg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="font-heading font-semibold text-text">Total du jour</h3>
            </div>
            <p className="text-3xl font-bold text-success">{todayTotal.toLocaleString()} FCFA</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary-bg">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-text">Paiements aujourd'hui</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{todayPayments.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="primary" onClick={() => navigate('/cashier/search')}>
          Encaisser un paiement
        </Button>
      </div>

      {todayPayments.length > 0 && (
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardHeader>
            <CardTitle>Paiements du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayPayments.map((p: Payment) => (
                <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-border">
                  <div>
                    <div className="font-medium text-text">{p.receipt_number}</div>
                    <div className="text-sm text-text-muted">{p.payment_type}</div>
                  </div>
                  <div className="font-bold text-cta">{p.amount_fcfa?.toLocaleString()} FCFA</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

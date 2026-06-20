import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../../components/ui/Card';
import { useNotes } from '../../hooks/useNotes';
import { usePayments } from '../../hooks/usePayments';
import { useAttendance } from '../../hooks/useAttendance';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { FileText, CreditCard, Activity } from 'lucide-react';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const { grades, loading: notesLoading } = useNotes();
  const { payments, loading: paymentsLoading } = usePayments();
  const { attendance, loading: attendanceLoading } = useAttendance();

  const recentGrades = grades?.slice(0, 3) || [];
  const recentPayments = payments?.slice(0, 3) || [];
  const absences = attendance?.filter((a: any) => a.status === 'ABSENT') || [];

  if (notesLoading || paymentsLoading || attendanceLoading) return <LoadingState type="card" count={3} />;

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader title={`Bonjour, ${user?.name || 'Parent'}`} subtitle="Suivi scolaire de votre enfant" />

      <div className="grid md:grid-cols-3 gap-5 stagger-children">
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-primary-bg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-text">Dernières notes</h3>
            </div>
            {recentGrades.length > 0 ? (
              <div className="space-y-2">
                {recentGrades.map((g: any) => (
                  <div key={g.id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-border text-sm">
                    <span className="text-text">{g.subject?.name || 'Matière'}</span>
                    <span className="font-bold text-primary">{g.value}/20</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">Pas de notes récentes</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-cta-bg">
                <CreditCard className="w-5 h-5 text-cta" />
              </div>
              <h3 className="font-heading font-semibold text-text">Derniers paiements</h3>
            </div>
            {recentPayments.length > 0 ? (
              <div className="space-y-2">
                {recentPayments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-border text-sm">
                    <span className="text-text">{p.payment_type}</span>
                    <span className="font-bold text-cta">{p.amount_fcfa?.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">Pas de paiements récents</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-error-bg">
                <Activity className="w-5 h-5 text-error" />
              </div>
              <h3 className="font-heading font-semibold text-text">Absences</h3>
            </div>
            {absences.length > 0 ? (
              <div className="space-y-2">
                {absences.slice(0, 3).map((a: any) => (
                  <div key={a.id} className="text-sm p-3 rounded-lg bg-error-bg border border-error/20 text-error">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm">Aucune absence</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useSchoolStats } from '../../hooks/useSchools';
import { useAuth } from '../../hooks/useAuth';
import { AddStudentModal } from '../../components/director/AddStudentModal';
import {
  Users, School, CreditCard, Activity, AlertTriangle,
  PlusCircle, FileText, TrendingUp, UserPlus, ArrowUpRight,
} from 'lucide-react';

const statConfig = [
  { label: 'Total Élèves', key: 'totalStudents', icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary', format: (v: number) => v.toLocaleString() },
  { label: 'Classes', key: 'totalClasses', icon: School, gradient: 'from-purple-500/20 to-purple-500/5', iconBg: 'bg-purple-500', format: (v: number) => v.toLocaleString() },
  { label: "Paiements Aujourd'hui", key: 'todayPayments', icon: CreditCard, gradient: 'from-cta/20 to-cta/5', iconBg: 'bg-cta', format: (v: number) => `${v.toLocaleString()} FCFA` },
  { label: 'Taux Présence', key: 'attendanceRate', icon: Activity, gradient: 'from-emerald-500/20 to-emerald-500/5', iconBg: 'bg-emerald-500', format: (v: number) => `${v}%` },
];

export const DashboardPage = () => {
  const { currentSchoolId } = useAuth();
  const navigate = useNavigate();
  const [showAddStudent, setShowAddStudent] = useState(false);

  const { data: stats, isLoading } = useSchoolStats(Number(currentSchoolId) || 0);

  const statItems = useMemo(() =>
    statConfig.map(item => ({
      ...item,
      value: item.format(stats?.[item.key as keyof typeof stats] as number || 0),
    })),
    [stats]
  );

  if (isLoading) return <LoadingState type="card" count={4} />;

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader
        title="Tableau de bord"
        subtitle="Bienvenue, voici un aperçu de l'activité de votre école."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        {statItems.map((item, i) => (
          <Card key={i} className="relative overflow-hidden group hover:shadow-3 transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">{item.label}</p>
                  <p className="text-3xl font-heading font-bold text-text tabular-nums">{item.value}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% vs mois dernier</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${item.iconBg}/10 group-hover:${item.iconBg}/20 transition-colors duration-300`}>
                  <item.icon className={`w-5 h-5 ${item.iconBg.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Activité récente</span>
              <Button variant="ghost" size="sm">
                Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
              <div className="text-center">
                <Activity className="w-10 h-10 text-text-muted/50 mx-auto mb-3" />
                <p className="text-sm text-text-muted">Graphique d'activité</p>
                <p className="text-xs text-text-muted/60">Données à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cta" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.alerts && stats.alerts.length > 0) ? (
                stats.alerts.map((alert: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-error-bg border border-error/10">
                    <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-error">{alert}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm text-text-muted">Tout est calme</p>
                  <p className="text-xs text-text-muted/60">Aucune alerte pour le moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface hover:bg-primary/5 border border-border hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-text">Ajouter un élève</span>
            </button>

            <button
              onClick={() => navigate('/bulletins')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface hover:bg-cta/5 border border-border hover:border-cta/20 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center group-hover:bg-cta/20 transition-colors">
                <FileText className="w-6 h-6 text-cta" />
              </div>
              <span className="text-sm font-semibold text-text">Générer un bulletin</span>
            </button>

            <button
              onClick={() => navigate('/students')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface hover:bg-primary/5 border border-border hover:border-primary/20 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-text">Voir les élèves</span>
            </button>

            <button
              onClick={() => navigate('/payments')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl bg-surface hover:bg-cta/5 border border-border hover:border-cta/20 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center group-hover:bg-cta/20 transition-colors">
                <CreditCard className="w-6 h-6 text-cta" />
              </div>
              <span className="text-sm font-semibold text-text">Voir les paiements</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} />}
    </div>
  );
};

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useSchoolStats } from '../../hooks/useSchools';
import { useAuth } from '../../hooks/useAuth';
import { AddStudentModal } from '../../components/director/AddStudentModal';
import { PaymentChart } from '../../components/charts/PaymentChart';
import { AttendanceChart } from '../../components/charts/AttendanceChart';
import { GradesChart } from '../../components/charts/GradesChart';
import { StudentsChart } from '../../components/charts/StudentsChart';
import {
  Users, School, CreditCard, Activity, AlertTriangle,
  FileText, TrendingUp, UserPlus, ArrowUpRight,
} from 'lucide-react';

const statConfig = [
  { label: 'Total Élèves', key: 'totalStudents', icon: Users, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary', format: (v: number) => v.toLocaleString() },
  { label: 'Classes', key: 'totalClasses', icon: School, gradient: 'from-purple-500/20 to-purple-500/5', iconBg: 'bg-purple-500', format: (v: number) => v.toLocaleString() },
  { label: "Paiements Aujourd'hui", key: 'todayPayments', icon: CreditCard, gradient: 'from-cta/20 to-cta/5', iconBg: 'bg-cta', format: (v: number) => `${v.toLocaleString()} FCFA` },
  { label: 'Taux Présence', key: 'attendanceRate', icon: Activity, gradient: 'from-emerald-500/20 to-emerald-500/5', iconBg: 'bg-emerald-500', format: (v: number) => `${v}%` },
];

const mockPaymentData = [
  { month: 'Jan', amount: 2500000 },
  { month: 'Fév', amount: 3200000 },
  { month: 'Mar', amount: 2800000 },
  { month: 'Avr', amount: 3500000 },
  { month: 'Mai', amount: 4100000 },
  { month: 'Jun', amount: 3800000 },
];

const mockAttendanceData = [
  { date: '01/06', rate: 92 },
  { date: '02/06', rate: 88 },
  { date: '03/06', rate: 95 },
  { date: '04/06', rate: 91 },
  { date: '05/06', rate: 94 },
  { date: '06/06', rate: 89 },
  { date: '07/06', rate: 93 },
];

const mockGradesData = [
  { subject: 'Maths', average: 13.5 },
  { subject: 'Français', average: 12.8 },
  { subject: 'Anglais', average: 14.2 },
  { subject: 'SVT', average: 11.9 },
  { subject: 'Histoire', average: 13.1 },
];

const mockStudentsData = [
  { name: '6ème', value: 45 },
  { name: '5ème', value: 38 },
  { name: '4ème', value: 42 },
  { name: '3ème', value: 35 },
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Paiements mensuels</span>
              <Button variant="ghost" size="sm">
                Voir tout <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentChart data={mockPaymentData} />
          </CardContent>
        </Card>

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

      {/* Second row charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Présence cette semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceChart data={mockAttendanceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moyennes par matière</CardTitle>
          </CardHeader>
          <CardContent>
            <GradesChart data={mockGradesData} />
          </CardContent>
        </Card>
      </div>

      {/* Third row charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des élèves par niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentsChart data={mockStudentsData} />
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

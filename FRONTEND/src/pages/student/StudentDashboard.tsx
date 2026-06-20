import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useNotes } from '../../hooks/useNotes';
import { useTimetables } from '../../hooks/useTimetables';
import { usePayments } from '../../hooks/usePayments';
import { useAttendance } from '../../hooks/useAttendance';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { FileText, Calendar, CreditCard, Activity } from 'lucide-react';

export const StudentDashboard = () => {
  const { grades, loading: notesLoading } = useNotes();
  const { timetables, loading: ttLoading } = useTimetables();
  const { payments, loading: payLoading } = usePayments();
  const { attendance, loading: attLoading } = useAttendance();

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
  const todaySlots = timetables?.filter((tt: any) => tt.slot?.startsWith(today)) || [];
  const recentGrades = grades?.slice(0, 5) || [];
  const totalPaid = payments?.filter((p: any) => p.status === 'VALIDE').reduce((sum: number, p: any) => sum + p.amount_fcfa, 0) || 0;
  const attendanceRate = attendance?.length
    ? Math.round((attendance.filter((a: any) => a.status === 'PRESENT').length / attendance.length) * 100)
    : 0;

  if (notesLoading || ttLoading || payLoading || attLoading) return <LoadingState type="card" count={4} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Mon Tableau de bord" subtitle="Bienvenue dans votre espace étudiant" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Moyenne</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              {recentGrades.length > 0
                ? (recentGrades.reduce((sum: number, g: any) => sum + g.value, 0) / recentGrades.length).toFixed(2)
                : 'N/A'}/20
            </p>
          </CardContent>
        </Card>

        <Card className="border border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-cta/10 rounded-xl">
                <Calendar className="w-5 h-5 text-cta" />
              </div>
              <h3 className="font-semibold">Cours aujourd'hui</h3>
            </div>
            <p className="text-2xl font-bold text-cta">{todaySlots.length}</p>
          </CardContent>
        </Card>

        <Card className="border border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-xl">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Total payé</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} FCFA</p>
          </CardContent>
        </Card>

        <Card className="border border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-text/10 rounded-xl">
                <Activity className="w-5 h-5 text-text" />
              </div>
              <h3 className="font-semibold">Présence</h3>
            </div>
            <p className="text-2xl font-bold text-text">{attendanceRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-primary/5">
          <CardHeader>
            <CardTitle>Dernières notes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGrades.length > 0 ? (
              <div className="space-y-2">
                {recentGrades.map((g: any) => (
                  <div key={g.id} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                    <span className="text-sm">{g.subject?.name || 'Matière'}</span>
                    <span className="font-bold text-primary">{g.value}/20</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text/60 text-center py-4">Aucune note</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-primary/5">
          <CardHeader>
            <CardTitle>Cours du jour</CardTitle>
          </CardHeader>
          <CardContent>
            {todaySlots.length > 0 ? (
              <div className="space-y-2">
                {todaySlots.map((tt: any) => (
                  <div key={tt.id} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                    <span className="text-sm">{tt.slot?.split('-')[1]}</span>
                    <span className="font-medium">{tt.subject?.name || 'Matière'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text/60 text-center py-4">Aucun cours aujourd'hui</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

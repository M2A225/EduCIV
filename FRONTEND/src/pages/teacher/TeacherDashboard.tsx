import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '../../components/ui/Card';
import { useTimetables } from '../../hooks/useTimetables';
import { useAttendanceSessions } from '../../hooks/useAttendance';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Clock, ClipboardCheck, BookOpen, GraduationCap } from 'lucide-react';
import type { Timetable, AttendanceSession } from '../../types';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const { timetables, loading: ttLoading } = useTimetables();
  const { sessions, loading: sessLoading } = useAttendanceSessions();

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
  const todaySlots = timetables?.filter((tt: Timetable) => tt.slot?.startsWith(today)) || [];
  const pendingSessions = sessions?.filter((s: AttendanceSession) => {
    const sessionDate = new Date(s.date);
    const todayDate = new Date();
    return sessionDate.toDateString() === todayDate.toDateString();
  }) || [];

  if (ttLoading || sessLoading) return <LoadingState type="card" count={3} />;

  const uniqueClasses = [...new Set(todaySlots.map((tt: Timetable) => tt.class_id))];

  return (
    <div className="space-y-8 animate-page-enter">
      <PageHeader
        title={`Bonjour, ${user?.name || 'Enseignant'}`}
        subtitle="Voici votre aperçu du jour"
      />

      <div className="grid md:grid-cols-3 gap-5 stagger-children">
        {/* Today's schedule */}
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-text">Cours du jour</h3>
            </div>
            {todaySlots.length > 0 ? (
              <div className="space-y-2">
                {todaySlots.map((tt: Timetable) => (
                  <div key={tt.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border text-sm">
                    <span className="font-semibold text-text">{tt.slot?.split('-')[1]}</span>
                    <span className="text-text-secondary">{tt.subject?.name || `Matière #${tt.subject_id}`}</span>
                    <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded-md border border-border">
                      {tt.class?.name || `Classe #${tt.class_id}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <GraduationCap className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                <p className="text-sm text-text-muted">Aucun cours prévu aujourd'hui</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending attendance */}
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-cta/10">
                <ClipboardCheck className="w-5 h-5 text-cta" />
              </div>
              <h3 className="font-heading font-semibold text-text">Appels à faire</h3>
            </div>
            {pendingSessions.length > 0 ? (
              <div className="space-y-2">
                {pendingSessions.map((s: AttendanceSession) => (
                  <div key={s.id} className="p-3 rounded-lg bg-surface border border-border text-sm">
                    <span className="font-semibold text-text">{s.subject?.name || `Matière #${s.subject_id}`}</span>
                    <span className="text-text-muted ml-2">{s.class?.name || `Classe #${s.class_id}`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardCheck className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                <p className="text-sm text-text-muted">Aucun appel en attente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My classes */}
        <Card className="hover:shadow-3 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-heading font-semibold text-text">Mes classes</h3>
            </div>
            {uniqueClasses.length > 0 ? (
              <div className="space-y-2">
                {uniqueClasses.map((classId: number) => (
                  <div key={classId} className="p-3 rounded-lg bg-surface border border-border text-sm font-medium text-text">
                    {todaySlots.find((tt: Timetable) => tt.class_id === classId)?.class?.name || `Classe #${classId}`}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-text-muted/50 mx-auto mb-2" />
                <p className="text-sm text-text-muted">Aucune classe assignée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

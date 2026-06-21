import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useTimetables } from '../../hooks/useTimetables';
import { useTeachers } from '../../hooks/useTeachers';
import type { Teacher, Timetable } from '../../types';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const DAY_LABELS: Record<string, string> = {
  Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi', Jeu: 'Jeudi', Ven: 'Vendredi',
};
const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export const TeacherTimetablePage = () => {
  const { user } = useAuth();
  const { data: teachers } = useTeachers();
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!teachers || !user) return;
    const match = teachers.find((t: Teacher) => t.email === user.email || t.name === user.name);
    if (match) {
      setTeacherId(match.id);
      setTeacherName(match.name);
    }
  }, [teachers, user]);

  const { timetables, loading, error } = useTimetables(
    teacherId ? { teacher_id: teacherId } : undefined,
  );

  const groupedByDay = useMemo(() => {
    if (!timetables) return {};
    const groups: Record<string, Timetable[]> = {};
    DAYS.forEach(d => { groups[d] = []; });
    timetables.forEach((tt: Timetable) => {
      const day = DAYS.find(d => tt.slot?.startsWith(d));
      if (day) {
        groups[day] = groups[day] || [];
        groups[day].push(tt);
      }
    });
    DAYS.forEach(d => {
      groups[d]?.sort((a: Timetable, b: Timetable) => {
        const aHour = a.slot?.split('-')[1] || '';
        const bHour = b.slot?.split('-')[1] || '';
        return HOURS.indexOf(aHour) - HOURS.indexOf(bHour);
      });
    });
    return groups;
  }, [timetables]);

  if (!teacherId && teachers && user) {
    return (
      <div className="space-y-6 font-sans">
        <PageHeader title="Mon emploi du temps" />
        <Feedback type="warning" message="Aucun profil enseignant trouvé pour votre compte. Contactez l'administration." />
      </div>
    );
  }

  if (loading) return <LoadingState type="card" count={5} />;
  if (error) return <Feedback type="error" message={error} />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Mon emploi du temps" subtitle={teacherName} />

      {(!timetables || timetables.length === 0) ? (
        <Card>
          <CardContent className="p-8 text-center text-text/60">
            Aucun cours programmé
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DAYS.map(day => {
            const daySlots = groupedByDay[day] || [];
            return (
              <Card key={day} className="border border-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{DAY_LABELS[day]}</CardTitle>
                </CardHeader>
                <CardContent>
                  {daySlots.length > 0 ? (
                    <div className="space-y-3">
                      {daySlots.map((tt: Timetable) => (
                        <div key={tt.id} className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                          <div className="font-semibold text-primary text-sm">
                            {tt.slot?.split('-')[1] || ''}
                          </div>
                          <div className="font-medium text-text mt-1">
                            {tt.subject?.name || `Matière #${tt.subject_id}`}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-text/60 mt-1">
                            <span>{tt.class?.name || `Classe #${tt.class_id}`}</span>
                            {tt.class?.classroom && (
                              <>
                                <span>·</span>
                                <span>Salle {tt.class.classroom}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text/40 text-sm italic">Repos</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
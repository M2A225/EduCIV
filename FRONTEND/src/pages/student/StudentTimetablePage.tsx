import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useTimetables } from '../../hooks/useTimetables';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import type { Student } from '../../types';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const DAY_LABELS: Record<string, string> = {
  Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi', Jeu: 'Jeudi', Ven: 'Vendredi',
};
const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export const StudentTimetablePage = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [studentError, setStudentError] = useState('');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!user) return;
    setLoadingStudent(true);
    api.get('/students/me')
      .then(res => extractData<Student>(res))
      .then(data => {
        if (!data) {
          setStudentError('Aucun profil élève trouvé pour votre compte.');
        } else {
          setStudent(data);
        }
      })
      .catch(() => setStudentError('Erreur lors du chargement de votre profil.'))
      .finally(() => setLoadingStudent(false));
  }, [user]);

  const { timetables, loading, error } = useTimetables(
    student?.class_id ? { class_id: student.class_id } : undefined,
  );

  const getSlotAt = (day: string, hour: string) => {
    return timetables?.find((tt: any) => tt.slot === `${day}-${hour}`);
  };

  if (loadingStudent) return <LoadingState />;
  if (studentError) return <Feedback type="error" message={studentError} />;
  if (!student?.class_id) return <Feedback type="warning" message="Aucune classe attribuée. Contactez l'administration." />;
  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error} />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Mon emploi du temps" subtitle={`${student.name} - ${student.class?.name || `Classe #${student.class_id}`}`} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5">
                <th className="p-3 text-left font-semibold border-b">Heure</th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 text-left font-semibold border-b">{DAY_LABELS[day]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="border-b border-primary/5">
                  <td className="p-3 font-medium text-text/60">{hour}</td>
                  {DAYS.map(day => {
                    const slot = getSlotAt(day, hour);
                    return (
                      <td key={`${day}-${hour}`} className="p-2">
                        {slot ? (
                          <div className="bg-primary/10 rounded-lg p-2 text-xs">
                            <div className="font-semibold text-primary">{slot.subject?.name || `Matière #${slot.subject_id}`}</div>
                            <div className="text-text/60">{slot.teacher?.name || `Prof #${slot.teacher_id}`}</div>
                            {slot.class?.classroom && <div className="text-text/40">Salle {slot.class.classroom}</div>}
                          </div>
                        ) : (
                          <div className="text-text/20 text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!timetables || timetables.length === 0) && (
          <div className="p-8 text-center text-text/60">
            Aucun cours programmé pour votre classe
          </div>
        )}
      </Card>
    </div>
  );
};
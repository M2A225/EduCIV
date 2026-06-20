import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useTimetables } from '../../hooks/useTimetables';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import type { StudentParent, Student } from '../../types';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const DAY_LABELS: Record<string, string> = {
  Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi', Jeu: 'Jeudi', Ven: 'Vendredi',
};
const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

interface ChildInfo {
  id: number;
  name: string;
  matricule?: string;
  class_id?: number;
  class?: { id: number; name: string; classroom?: string };
}

export const ParentTimetablePage = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const { timetables, loading, error } = useTimetables(
    selectedChild?.class_id ? { class_id: selectedChild.class_id } : undefined,
  );

  useEffect(() => {
    if (!user) return;
    setLoadingChildren(true);
    api.get(`/parents/parent/${user.id}`)
      .then(res => extractData<StudentParent[]>(res))
      .then(data => {
        const kids = data.map((link: StudentParent) => link.student).filter(Boolean) as Student[];
        setChildren(kids);
        if (kids.length === 1) {
          setSelectedChildId(kids[0].id);
        }
      })
      .catch(() => toast.error('Impossible de charger la liste des enfants'))
      .finally(() => setLoadingChildren(false));
  }, [user]);

  const getSlotAt = (day: string, hour: string) => {
    return timetables?.find((tt: any) => tt.slot === `${day}-${hour}`);
  };

  if (loadingChildren) return <LoadingState type="card" count={3} />;

  if (children.length === 0) {
    return (
      <div className="space-y-6 font-sans">
        <PageHeader title="Emploi du temps" />
        <Feedback type="warning" message="Aucun enfant lié à votre compte" />
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="space-y-6 font-sans">
        <PageHeader title="Emploi du temps" />
        <Card>
          <CardHeader>
            <CardTitle>Sélectionnez votre enfant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {children.map(child => (
                <Button
                  key={child.id}
                  variant="glass"
                  className="justify-start text-left h-auto py-4 px-4"
                  onClick={() => setSelectedChildId(child.id)}
                >
                  <div>
                    <div className="font-semibold text-base">{child.name}</div>
                    <div className="text-xs text-text/60">
                      {child.matricule || ''}
                      {child.class?.name ? ` - ${child.class.name}` : ''}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error} />;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Button variant="glass" className="text-sm" onClick={() => setSelectedChildId(null)}>
          ← Changer d'enfant
        </Button>
        <PageHeader title="Emploi du temps" subtitle={`${selectedChild.name} - ${selectedChild.class?.name || ''}`} />
      </div>

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
            Aucun cours pour cette classe
          </div>
        )}
      </Card>
    </div>
  );
};
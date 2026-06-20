import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAttendanceSessions, useAttendance, useCreateSession } from '../../hooks/useAttendance';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';

const statusLabels: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'Retard',
};

const statusVariant: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  PRESENT: 'green',
  ABSENT: 'red',
  LATE: 'yellow',
};

export const AttendancePage = () => {
  const { sessions, loading: sessionsLoading } = useAttendanceSessions();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const createSession = useCreateSession();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    timetable_id: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_id || !formData.subject_id) return;

    try {
      await createSession.mutateAsync({
        class_id: Number(formData.class_id),
        subject_id: Number(formData.subject_id),
        timetable_id: Number(formData.timetable_id) || 1,
        date: formData.date,
      });
      setShowForm(false);
      setFormData({ class_id: '', subject_id: '', timetable_id: '', date: new Date().toISOString().split('T')[0] });
    } catch { toast.error('Impossible de créer la session'); }
  };

  const sessionColumns = [
    {
      header: 'Date',
      accessor: (row: any) => <span className="font-medium text-text">{new Date(row.date).toLocaleDateString('fr-FR')}</span>,
    },
    { header: 'Classe', accessor: (row: any) => row.class?.name || `Classe #${row.class_id}` },
    { header: 'Matière', accessor: (row: any) => row.subject?.name || `Matière #${row.subject_id}` },
    { header: 'Professeur', accessor: (row: any) => row.teacher?.name || `Prof #${row.teacher_id}` },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button variant="glass" className="text-xs px-3 py-1" onClick={() => setSelectedSession(row)}>
          Voir détails
        </Button>
      ),
    },
  ];

  const attendanceColumns = [
    { header: 'Session', accessor: (row: any) => new Date(row.session?.date || row.created_at).toLocaleDateString('fr-FR') },
    { header: 'Élève ID', accessor: (row: any) => row.student_id },
    {
      header: 'Statut',
      accessor: (row: any) => (
        <StatusBadge status={statusLabels[row.status] || row.status} variant={statusVariant[row.status] || 'gray'} />
      ),
    },
  ];

  if (sessionsLoading || attendanceLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Suivi des Appels"
        actions={
          <Button onClick={() => setShowForm(prev => !prev)} variant="primary">
            {showForm ? 'Annuler' : '+ Nouvelle session'}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une session d'appel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium mb-1">Classe</label>
                <select
                  className="input w-full"
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {classes?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Matière</label>
                <select
                  className="input w-full"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" isLoading={createSession.isPending} className="w-full">
                  Créer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle>Session du {new Date(selectedSession.date).toLocaleDateString('fr-FR')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {selectedSession.attendances?.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                  <span>Élève #{a.student_id}</span>
                  <StatusBadge status={statusLabels[a.status] || a.status} variant={statusVariant[a.status] || 'gray'} />
                </div>
              ))}
              {!selectedSession.attendances?.length && (
                <p className="text-text/60 text-center py-4">Aucun appel enregistré pour cette session</p>
              )}
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setSelectedSession(null)}>
              Fermer
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sessions d'appel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data={sessions || []} columns={sessionColumns} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des présences</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data={attendance || []} columns={attendanceColumns} />
        </CardContent>
      </Card>
    </div>
  );
};

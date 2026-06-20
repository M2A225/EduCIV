import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAttendanceSessions, useAttendance, useCreateSession, useMarkAttendance } from '../../hooks/useAttendance';
import { useClasses } from '../../hooks/useClasses';
import { useSubjects } from '../../hooks/useSubjects';

export const TeacherAttendancePage = () => {
  const { sessions, loading: sessionsLoading } = useAttendanceSessions();
  const { loading: attendanceLoading } = useAttendance();
  const createSession = useCreateSession();
  const markAttendance = useMarkAttendance();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
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
  
  const handleMark = async (sessionId: number, studentId: number, status: string) => {
    try { await markAttendance.mutateAsync({ sessionId, student_id: studentId, status: status as any }); } catch { toast.error('Impossible de marquer la présence'); }
  };

  if (sessionsLoading || attendanceLoading) return <LoadingState />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Appel - Séance"
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
                <input
                  type="date"
                  className="input w-full"
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessions disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions?.map((session: any) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{session.subject?.name || `Matière #${session.subject_id}`}</span>
                      <span className="text-text/60 text-sm ml-2">{session.class?.name || `Classe #${session.class_id}`}</span>
                    </div>
                    <span className="text-sm text-text/60">{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
              {!sessions?.length && (
                <p className="text-text/60 text-center py-4">Aucune session. Créez-en une pour commencer l'appel.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedSession ? `Marquer - ${new Date(selectedSession.date).toLocaleDateString('fr-FR')}` : 'Sélectionnez une session'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-2">
                <p className="text-sm text-text/60 mb-4">Cliquez sur le statut pour chaque élève</p>
                <div className="grid gap-2">
                  {[1, 2, 3].map((studentId) => (
                    <div key={studentId} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                      <span className="font-medium">Élève #{studentId}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 border-green-200 text-green-700 hover:bg-green-50"
                          isLoading={markAttendance.isPending}
                          onClick={() => handleMark(selectedSession.id, studentId, 'PRESENT')}
                        >
                          Présent
                        </Button>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 border-red-200 text-red-700 hover:bg-red-50"
                          isLoading={markAttendance.isPending}
                          onClick={() => handleMark(selectedSession.id, studentId, 'ABSENT')}
                        >
                          Absent
                        </Button>
                        <Button
                          variant="outline"
                          className="text-xs px-2 py-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                          isLoading={markAttendance.isPending}
                          onClick={() => handleMark(selectedSession.id, studentId, 'LATE')}
                        >
                          Retard
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-text/60 text-center py-8">Sélectionnez une session à gauche</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

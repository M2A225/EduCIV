import { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import type { Student } from '../../types';

export const StudentNotesPage = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.get('/students/me')
      .then(res => extractData<Student>(res))
      .then(data => {
        if (data?.id) setStudentId(data.id);
        else setLoadError('Aucun profil élève trouvé.');
      })
      .catch(() => setLoadError('Erreur de chargement.'));
  }, [user]);

  const { grades, loading, error } = useNotes(studentId ?? undefined);

  if (loadError) return <Feedback type="error" message={loadError} />;
  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error instanceof Error ? error.message : 'Une erreur est survenue'} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Mes notes" size="sm" />

      <div className="grid gap-4">
        {grades?.map((grade: any) => (
          <div key={grade.id} className="glass p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{grade.subject?.name || 'Matière'}</div>
                <div className="text-sm text-text/60">{grade.type} - {grade.period?.name || 'Période'}</div>
              </div>
              <div className="text-2xl font-bold text-primary">{grade.value}/20</div>
            </div>
          </div>
        ))}
        {(!grades || grades.length === 0) && (
          <div className="glass p-8 rounded-xl text-center text-text/60">
            Aucune note disponible
          </div>
        )}
      </div>
    </div>
  );
};
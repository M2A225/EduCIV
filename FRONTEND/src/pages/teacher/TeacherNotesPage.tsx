import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotes, useAddNote, useDeleteNote } from '../../hooks/useNotes';
import { useMyAssignments } from '../../hooks/useTeacherSubjects';
import { useStudents } from '../../hooks/useStudents';
import { usePeriods } from '../../hooks/usePeriods';
import type { Grade, Student, Subject, AcademicPeriod } from '../../types';

export const TeacherNotesPage = () => {
  const { grades, loading: notesLoading, error, refetch } = useNotes();
  const { data: assignments, isLoading: assignmentsLoading } = useMyAssignments();
  const { data: students } = useStudents();
  const { data: periods } = usePeriods();
  const addNote = useAddNote();
  const deleteNote = useDeleteNote();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    period_id: '',
    value: '',
    type: 'DEVOIR',
  });

  const assignedSubjectIds = useMemo(() => {
    if (!assignments) return new Set<number>();
    return new Set(assignments.map((a: Record<string, unknown>) => a.subject_id as number));
  }, [assignments]);

  const assignedClassIds = useMemo(() => {
    if (!assignments) return new Set<number>();
    return new Set(assignments.map((a: Record<string, unknown>) => a.class_id as number));
  }, [assignments]);

  const filteredStudents = useMemo(() => {
    if (!students || !assignments) return [];
    const classIds = [...assignedClassIds];
    return students.filter((s: Student) => classIds.includes(s.class_id));
  }, [students, assignedClassIds, assignments]);

  const filteredSubjects = useMemo(() => {
    if (!assignments) return [];
    const subjectMap = new Map<number, Subject>();
    assignments.forEach((a: Record<string, unknown>) => {
      const subject = a.subject as Subject | undefined;
      if (subject && !subjectMap.has(subject.id)) {
        subjectMap.set(subject.id, subject);
      }
    });
    return [...subjectMap.values()];
  }, [assignments]);

  const filteredGrades = useMemo(() => {
    if (!grades || !assignedSubjectIds.size) return [];
    return grades.filter((g: Grade) => assignedSubjectIds.has(g.subject_id));
  }, [grades, assignedSubjectIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.subject_id || !formData.period_id || !formData.value) return;
    try {
      await addNote.mutateAsync({
        student_id: Number(formData.student_id),
        subject_id: Number(formData.subject_id),
        period_id: Number(formData.period_id),
        value: Number(formData.value),
        type: formData.type,
        status: 'EN_ATTENTE',
      });
      setShowForm(false);
    } catch { toast.error('Impossible d\'ajouter la note'); }
    setFormData({ student_id: '', subject_id: '', period_id: '', value: '', type: 'DEVOIR' });
  };

  const columns: Column<Grade>[] = [
    { header: 'Élève', accessor: (row: Grade) => row.student?.name || `Élève #${row.student_id}` },
    { header: 'Matière', accessor: (row: Grade) => row.subject?.name || `Matière #${row.subject_id}` },
    { header: 'Période', accessor: (row: Grade) => row.period?.name || `Période #${row.period_id}` },
    { header: 'Type', accessor: (row: Grade) => row.type },
    { header: 'Note', accessor: (row: Grade) => <span className="text-xl font-bold text-primary">{row.value}/20</span> },
    {
      header: 'Statut',
      accessor: (row: Grade) => {
        const variant: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
          EN_ATTENTE: 'yellow',
          VALIDE: 'green',
          REJETE: 'red',
        };
        const labels: Record<string, string> = {
          EN_ATTENTE: 'En attente',
          VALIDE: 'Validé',
          REJETE: 'Rejeté',
        };
        return (
          <StatusBadge status={labels[row.status] || row.status} variant={variant[row.status] || 'gray'} />
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: Grade) =>
        row.status === 'EN_ATTENTE' ? (
          <Button
            variant="outline"
            className="text-xs px-2 py-1 border-red-200 text-red-600"
            isLoading={deleteNote.isPending}
            onClick={() => deleteNote.mutate(row.id)}
          >
            Supprimer
          </Button>
        ) : null,
    },
  ];

  if (notesLoading || assignmentsLoading) return <LoadingState type="list" count={10} />;
  if (error) return <Feedback type="error" message={error instanceof Error ? error.message : 'Une erreur est survenue'} onRetry={refetch} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Saisie des Notes"
        subtitle={`${filteredSubjects.length} matière(s) assignée(s)`}
        actions={
          <Button onClick={() => setShowForm(prev => !prev)} variant="primary">
            {showForm ? 'Annuler' : '+ Ajouter une note'}
          </Button>
        }
      />

      {assignments && assignments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assignments.map((a: Record<string, unknown>) => {
            const aSubject = a.subject as { name?: string } | undefined;
            const aClass = a.class as { name?: string } | undefined;
            return (
            <Badge key={a.id as number} className="bg-primary/10 text-primary text-sm px-3 py-1">
              {aSubject?.name || `Matière #${a.subject_id as number}`} - {aClass?.name || `Classe #${a.class_id as number}`}
            </Badge>
            );
          })}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">Élève</label>
                <select
                  className="input w-full"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {filteredStudents?.map((s: Student) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
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
                  {filteredSubjects?.map((s: Subject) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Période</label>
                <select
                  className="input w-full"
                  value={formData.period_id}
                  onChange={(e) => setFormData({ ...formData, period_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {periods?.map((p: AcademicPeriod) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (0-20)</label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0-20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="input w-full"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="INTERROGATION">Interrogation</option>
                  <option value="DEVOIR">Devoir</option>
                  <option value="EXAMEN">Examen</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" isLoading={addNote.isPending} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table data={filteredGrades} columns={columns} />
      </Card>
    </div>
  );
};

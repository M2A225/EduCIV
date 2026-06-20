import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useTimetables, useAddSlot } from '../../hooks/useTimetables';
import { useClasses } from '../../hooks/useClasses';
import { useTeachers } from '../../hooks/useTeachers';
import { useSubjects } from '../../hooks/useSubjects';
import { useTeacherSubjects } from '../../hooks/useTeacherSubjects';


const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export const TimetablePage = () => {
  const { timetables, loading, error: fetchError } = useTimetables();
  const addSlot = useAddSlot();
  const { data: classes } = useClasses();
  const { data: teachers } = useTeachers();
  const { data: subjects } = useSubjects();
  const { data: teacherSubjects } = useTeacherSubjects();
  const [showForm, setShowForm] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    day: 'Lun',
    hour: '8:00',
  });

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((c: any) =>
      c.name.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [classes, classSearch]);

  const selectedClassTimetable = useMemo(() => {
    if (!timetables || !selectedClassId) return [];
    return timetables.filter((tt: any) => tt.class_id === selectedClassId);
  }, [timetables, selectedClassId]);

  const availableSubjects = useMemo(() => {
    if (!teacherSubjects || !selectedClassId || !subjects) return subjects || [];
    const assignedSubjectIds = [...new Set(
      teacherSubjects
        .filter((ts: any) => ts.class_id === selectedClassId)
        .map((ts: any) => ts.subject_id)
    )] as number[];
    if (assignedSubjectIds.length === 0) return subjects;
    return subjects.filter((s: any) => assignedSubjectIds.includes(s.id));
  }, [teacherSubjects, selectedClassId, subjects]);

  const availableTeachers = useMemo(() => {
    if (!teacherSubjects || !selectedClassId || !formData.subject_id || !teachers) return [];
    const assignedTeacherIds = [...new Set(
      teacherSubjects
        .filter((ts: any) =>
          ts.class_id === selectedClassId &&
          ts.subject_id === Number(formData.subject_id)
        )
        .map((ts: any) => ts.teacher_id)
    )] as number[];
    if (assignedTeacherIds.length === 0) return teachers || [];
    return teachers.filter((t: any) => assignedTeacherIds.includes(t.id));
  }, [teacherSubjects, selectedClassId, formData.subject_id, teachers]);

  const getSlotAt = (day: string, hour: string) => {
    return selectedClassTimetable.find((tt: any) => tt.slot === `${day}-${hour}`);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !formData.teacher_id || !formData.subject_id) return;

    try {
      await addSlot.mutateAsync({
        class_id: selectedClassId,
        teacher_id: Number(formData.teacher_id),
        subject_id: Number(formData.subject_id),
        slot: `${formData.day}-${formData.hour}`,
      });
      setShowForm(false);
      setFormData({ teacher_id: '', subject_id: '', day: 'Lun', hour: '8:00' });
    } catch { toast.error('Impossible d\'ajouter la séance'); }
  };

  if (loading) return <LoadingState type="list" count={5} />;

  if (fetchError) {
    return (
      <div className="space-y-8 font-sans">
        <PageHeader title="Emploi du Temps" />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500 font-medium mb-2">Erreur de chargement</p>
            <p className="text-text/60 text-sm">{String(fetchError)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Emploi du Temps"
        actions={selectedClassId ? (
          <Button onClick={() => setShowForm(prev => !prev)} variant="primary">
            {showForm ? 'Annuler' : '+ Ajouter Séance'}
          </Button>
        ) : undefined}
      />

      {!selectedClassId ? (
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner une classe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Rechercher une classe..."
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
            />
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredClasses.map((c: any) => (
                <Button
                  key={c.id}
                  variant="glass"
                  className="justify-start text-left h-auto py-3 px-4"
                  onClick={() => setSelectedClassId(c.id)}
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {c.level && <div className="text-xs text-text/60">{c.level}{c.section ? ` ${c.section}` : ''}</div>}
                  </div>
                </Button>
              ))}
              {filteredClasses.length === 0 && (
                <p className="text-text/40 col-span-full text-center py-8">Aucune classe trouvée</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Button
              variant="glass"
              className="text-sm"
              onClick={() => { setSelectedClassId(null); setShowForm(false); }}
            >
              ← Changer de classe
            </Button>
            <span className="text-lg font-semibold text-text">
              {classes?.find((c: any) => c.id === selectedClassId)?.name || `Classe #${selectedClassId}`}
            </span>
          </div>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle séance — {classes?.find((c: any) => c.id === selectedClassId)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-4">
                  <Select
                    label="Matière"
                    value={formData.subject_id}
                    onChange={(e) => {
                      setFormData({ ...formData, subject_id: e.target.value, teacher_id: '' });
                    }}
                    options={[
                      { value: '', label: 'Sélectionner une matière' },
                      ...availableSubjects.map((s: any) => ({ value: String(s.id), label: `${s.name} (coef ${s.coefficient})` })),
                    ]}
                    required
                  />
                  <Select
                    label="Enseignant"
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                    options={[
                      { value: '', label: formData.subject_id ? 'Sélectionner un enseignant' : 'Choisissez d\'abord la matière' },
                      ...availableTeachers.map((t: any) => ({ value: String(t.id), label: t.name })),
                    ]}
                    disabled={!formData.subject_id}
                    required
                  />
                  <Select
                    label="Jour"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    options={DAYS.map(d => ({ value: d, label: d }))}
                  />
                  <Select
                    label="Heure"
                    value={formData.hour}
                    onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                    options={HOURS.map(h => ({ value: h, label: h }))}
                  />
                  <div className="md:col-span-4">
                    <Button type="submit" variant="primary" isLoading={addSlot.isPending} className="w-full">
                      Ajouter
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="p-3 text-left font-semibold border-b">Heure</th>
                    {DAYS.map(day => (
                      <th key={day} className="p-3 text-left font-semibold border-b">{day}</th>
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
          </Card>
        </>
      )}
    </div>
  );
};

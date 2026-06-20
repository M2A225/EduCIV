import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { useTeachers, useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from '../../hooks/useTeachers';
import { useSubjects } from '../../hooks/useSubjects';
import { useClasses } from '../../hooks/useClasses';
import { useTeacherSubjects, useCreateTeacherSubject, useDeleteTeacherSubject } from '../../hooks/useTeacherSubjects';
import type { Teacher, Subject, Class } from '../../types';
import type { Column } from '../../components/ui/Table';

interface TeacherAssignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
  subject?: { name: string };
  class?: { name: string };
}

export const TeachersPage = () => {
  const { data, isLoading } = useTeachers();
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();
  const { data: allAssignments } = useTeacherSubjects();
  const createTeacher = useCreateTeacher();
  const deleteTeacher = useDeleteTeacher();
  const updateTeacher = useUpdateTeacher();
  const createAssignment = useCreateTeacherSubject();
  const deleteAssignment = useDeleteTeacherSubject();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    grade: '', specialty: '', hire_date: '', address: '',
  });
  const [assignTeacher, setAssignTeacher] = useState<number | null>(null);
  const [assignData, setAssignData] = useState({ subject_id: '', class_id: '' });
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!search) return data || [];
    const q = search.toLowerCase();
    return (data || []).filter((t: Teacher) =>
      t.name?.toLowerCase().includes(q) ||
      t.specialty?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', grade: '', specialty: '', hire_date: '', address: '' });
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTeacher.mutateAsync({ id: editingId, data: formData });
      } else {
        await createTeacher.mutateAsync(formData);
      }
      resetForm();
      setShowForm(false);
    } catch { toast.error('Impossible d\'enregistrer l\'enseignant'); }
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData({
      name: teacher.name, email: teacher.email || '', phone: teacher.phone || '',
      grade: teacher.grade || '', specialty: teacher.specialty || '',
      hire_date: teacher.hire_date ? teacher.hire_date.split('T')[0] : '', address: teacher.address || '',
    });
    setEditingId(teacher.id);
    setShowForm(true);
  };

  const handleAssign = async () => {
    if (!assignTeacher || !assignData.subject_id || !assignData.class_id) return;
    try {
      await createAssignment.mutateAsync({
        teacher_id: assignTeacher,
        subject_id: Number(assignData.subject_id),
        class_id: Number(assignData.class_id),
      });
    } catch { toast.error('Impossible d\'affecter la matière'); }
    setAssignData({ subject_id: '', class_id: '' });
  };

  const getTeacherAssignments = (teacherId: number): TeacherAssignment[] => {
    return (allAssignments as TeacherAssignment[] | undefined)?.filter(a => a.teacher_id === teacherId) || [];
  };

  const columns: Column<Teacher>[] = [
    { header: 'Nom', accessor: (row: Teacher) => row.name },
    { header: 'Email', accessor: (row: Teacher) => row.email || '-' },
    { header: 'Téléphone', accessor: (row: Teacher) => row.phone || '-' },
    { header: 'Spécialité', accessor: (row: Teacher) => row.specialty || '-' },
    {
      header: 'Affectations',
      accessor: (row: Teacher) => {
        const a = getTeacherAssignments(row.id);
        return a.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {a.slice(0, 3).map((ass: TeacherAssignment) => (
              <Badge key={ass.id} className="bg-primary/10 text-primary text-xs">
                {ass.subject?.name || `M#${ass.subject_id}`}
              </Badge>
            ))}
            {a.length > 3 && <span className="text-xs text-text/40">+{a.length - 3}</span>}
          </div>
        ) : <span className="text-text/40 text-sm">Aucune</span>;
      },
    },
    {
      header: 'Actions',
      accessor: (row: Teacher) => (
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs px-2 py-1" onClick={() => handleEdit(row)}>
            Modifier
          </Button>
          <Button
            variant="outline"
            className="text-xs px-2 py-1 border-blue-200 text-blue-600"
            onClick={() => { setAssignTeacher(row.id); setAssignData({ subject_id: '', class_id: '' }); }}
          >
            Affecter
          </Button>
          <Button
            variant="outline"
            className="text-xs px-2 py-1 border-red-200 text-red-600"
            isLoading={deleteTeacher.isPending}
            onClick={() => deleteTeacher.mutate(row.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="card" count={3} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Enseignants"
        subtitle={`${filteredData.length} enseignant(s)`}
        actions={
          <Button onClick={() => { resetForm(); setShowForm(prev => !prev); }} variant="primary">
            {showForm ? 'Annuler' : '+ Ajouter'}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier' : 'Nouvel'} enseignant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                placeholder="Grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              />
              <Select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Spécialité (matière)"
                options={[
                  { value: '', label: 'Aucune' },
                  ...(subjects ?? []).map((s: Subject) => ({ value: s.name, label: s.name })),
                ]}
              />
              <Input
                placeholder="Date d'embauche"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              />
              <Input
                placeholder="Adresse"
                className="md:col-span-3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Button type="submit" variant="primary" isLoading={createTeacher.isPending || updateTeacher.isPending}>
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un enseignant..." />

      <Card className="overflow-hidden">
        <Table data={filteredData} columns={columns} />
      </Card>

      {/* Assignment Modal */}
      {assignTeacher !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Affecter une matière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  label="Matière"
                  placeholder="Sélectionner une matière"
                  value={assignData.subject_id}
                  onChange={(e) => setAssignData({ ...assignData, subject_id: e.target.value })}
                  options={(subjects || []).map((s: Subject) => ({ value: String(s.id), label: s.name }))}
                />
                <Select
                  label="Classe"
                  placeholder="Sélectionner une classe"
                  value={assignData.class_id}
                  onChange={(e) => setAssignData({ ...assignData, class_id: e.target.value })}
                  options={(classes || []).map((c: Class) => ({ value: String(c.id), label: c.name }))}
                />

                {/* Existing assignments */}
                {getTeacherAssignments(assignTeacher).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Affectations actuelles:</p>
                    <div className="space-y-1">
                      {getTeacherAssignments(assignTeacher).map((a: TeacherAssignment) => (
                        <div key={a.id} className="flex justify-between items-center p-2 bg-primary/5 rounded-lg text-sm">
                          <span>{a.subject?.name || `M#${a.subject_id}`} - {a.class?.name || `C#${a.class_id}`}</span>
                          <Button
                            variant="outline"
                            className="text-xs px-2 py-1 border-red-200 text-red-600"
                            isLoading={deleteAssignment.isPending}
                            onClick={() => deleteAssignment.mutate(a.id)}
                          >
                            Retirer
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleAssign}
                    disabled={!assignData.subject_id || !assignData.class_id}
                    isLoading={createAssignment.isPending}
                  >
                    Affecter
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setAssignTeacher(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

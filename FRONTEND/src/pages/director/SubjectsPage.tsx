import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '../../hooks/useSubjects';
import { api } from '../../services/api';
import type { Subject } from '../../types';

export const SubjectsPage = () => {
  const { data: subjects, isLoading, error, refetch } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', coefficient: '', max_score: '' });
  const [schoolGenre, setSchoolGenre] = useState('');
  const [search, setSearch] = useState('');

  const filteredSubjects = useMemo(() => {
    if (!search) return subjects || [];
    const q = search.toLowerCase();
    return (subjects || []).filter((s: any) =>
      s.name.toLowerCase().includes(q)
    );
  }, [subjects, search]);

  useEffect(() => {
    api.get('/schools/me').then(res => {
      const school = (res.data as any)?.data;
      if (school) setSchoolGenre(school.school_type || '');
    }).catch(() => {});
  }, []);

  const isPrimary = schoolGenre === 'PRIMAIRE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.coefficient) return;

    try {
      await createSubject.mutateAsync({
        name: formData.name,
        coefficient: Number(formData.coefficient),
        max_score: formData.max_score ? Number(formData.max_score) : undefined,
      });
      setShowForm(false);
      setFormData({ name: '', coefficient: '', max_score: '' });
    } catch { toast.error('Impossible de créer la matière'); }
  };

  const columns: Column<Subject>[] = [
    { header: 'Matière', accessor: (row: Subject) => <span className="font-medium text-text">{row.name}</span> },
    { header: 'Coefficient', accessor: (row: Subject) => <span className="font-bold text-primary">{row.coefficient}</span> },
    ...(isPrimary ? [{ header: 'Note max', accessor: (row: Subject) => <span className="font-bold text-primary">{row.max_score ?? '-'}</span> }] : []),
    {
      header: 'Actions',
      accessor: (row: Subject) => (
        <div className="flex gap-2 items-center">
          {isPrimary && (
            <input
              type="number"
              className="w-16 px-2 py-1 rounded-lg border border-primary/20 text-xs"
              defaultValue={row.max_score ?? ''}
              placeholder="Max"
              onBlur={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                if (val !== row.max_score) {
                  updateSubject.mutate({ id: row.id, data: { max_score: val ?? undefined } });
                }
              }}
            />
          )}
          <Button
            variant="outline"
            className="text-xs px-2 py-1 border-red-200 text-red-600"
            isLoading={deleteSubject.isPending}
            onClick={() => deleteSubject.mutate(row.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;
  if (error) return <Feedback type="error" message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Matières"
        subtitle={`${filteredSubjects.length} matière(s)`}
        actions={
          <Button onClick={() => setShowForm(prev => !prev)} variant="primary">
            {showForm ? 'Annuler' : '+ Ajouter une matière'}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle matière</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4" style={{ gridTemplateColumns: isPrimary ? '1fr 1fr 1fr auto' : '1fr 1fr auto' }}>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mathématiques"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coefficient</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.coefficient}
                  onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
                  placeholder="2"
                  required
                />
              </div>
              {isPrimary && (
                <div>
                  <label className="block text-sm font-medium mb-1">Note max</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_score}
                    onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                    placeholder="10"
                  />
                </div>
              )}
              <div className="flex items-end">
                <Button type="submit" variant="primary" isLoading={createSubject.isPending} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une matière..." />

      <Card className="overflow-hidden">
        <Table data={filteredSubjects} columns={columns} />
      </Card>
    </div>
  );
};

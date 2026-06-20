import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../../hooks/useClasses';
import { api } from '../../services/api';
import type { Class, ApiResponse } from '../../types';
import type { Column } from '../../components/ui/Table';

const NIVEAUX = [
  '6ème', '5ème', '4ème', '3ème',
  'Seconde A1', 'Seconde A2', 'Seconde C',
  'Première A1', 'Première A2', 'Première C', 'Première D',
  'Terminale A1', 'Terminale A2', 'Terminale C', 'Terminale D',
];

const SECTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  '1', '2', '3', '4', '5', '6',
];

export const ClassesPage = () => {
  const { data, isLoading } = useClasses();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', level: '', section: '', capacity: '', classroom: '',
    grade_total_max: '', grade_avg_scale: '',
  });
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [schoolGenre, setSchoolGenre] = useState('');

  useEffect(() => {
    api.get('/schools/me').then(res => {
      const school = (res.data as ApiResponse<{ school_type?: string }>)?.data;
      if (school) setSchoolGenre(school.school_type || '');
    }).catch(() => {});
  }, []);

  const isPrimary = schoolGenre === 'PRIMAIRE';

  const filteredClasses = useMemo(() => {
    if (!data) return [];
    return data.filter((c: Class) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (levelFilter && c.level !== levelFilter) return false;
      return true;
    });
  }, [data, search, levelFilter]);

  const levels = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((c: Class) => c.level).filter(Boolean))] as string[];
  }, [data]);

  const resetForm = () => {
    setFormData({ name: '', level: '', section: '', capacity: '', classroom: '', grade_total_max: '', grade_avg_scale: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.level) return;
    const payload: Record<string, unknown> = {
      name: formData.name,
      level: formData.level || undefined,
      section: formData.section || undefined,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
      classroom: formData.classroom || undefined,
    };
    if (isPrimary) {
      payload.grade_total_max = formData.grade_total_max ? Number(formData.grade_total_max) : undefined;
      payload.grade_avg_scale = formData.grade_avg_scale ? Number(formData.grade_avg_scale) : undefined;
    }
    try {
      if (editingId) {
        await updateClass.mutateAsync({ id: editingId, data: payload });
      } else {
        await createClass.mutateAsync(payload);
      }
      resetForm();
      setShowForm(false);
    } catch { toast.error('Impossible d\'enregistrer la classe'); }
  };

  const handleEdit = (cls: Class) => {
    setFormData({
      name: cls.name || '',
      level: cls.level || '',
      section: cls.section || '',
      capacity: cls.capacity?.toString() || '',
      classroom: cls.classroom || '',
      grade_total_max: cls.grade_total_max?.toString() || '',
      grade_avg_scale: cls.grade_avg_scale?.toString() || '',
    });
    setEditingId(cls.id);
    setShowForm(true);
  };

  const columns: Column<Class>[] = [
    { header: 'Nom', accessor: (row: Class) => <span className="font-medium text-text">{row.name}</span> },
    { header: 'Niveau', accessor: (row: Class) => row.level || '-' },
    { header: 'Section', accessor: (row: Class) => row.section || '-' },
    { header: 'Capacité', accessor: (row: Class) => row.capacity ?? '-' },
    { header: 'Salle', accessor: (row: Class) => row.classroom || '-' },
    { header: 'Effectif', accessor: (row: Class) => row._count?.students ?? row.students?.length ?? 0 },
    {
      header: 'Actions',
      accessor: (row: Class) => (
        <div className="flex gap-2">
          <Button variant="glass" className="text-xs px-3 py-1" onClick={() => handleEdit(row)}>
            Modifier
          </Button>
          <Button
            variant="outline"
            className="text-xs px-3 py-1 border-red-200 text-red-600"
            isLoading={deleteClass.isPending}
            onClick={() => deleteClass.mutate(row.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Gestion des Classes"
        subtitle={`${filteredClasses.length} classe(s)`}
        actions={
          <Button onClick={() => { resetForm(); setShowForm(prev => !prev); }} variant="primary">
            {showForm ? 'Annuler' : '+ Créer Classe'}
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher par nom..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        hasActiveFilters={!!levelFilter}
        onResetFilters={() => setLevelFilter('')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            placeholder="Niveau"
            options={[{ value: '', label: 'Tous les niveaux' }, ...levels.map(l => ({ value: l, label: l }))]}
          />
        </div>
      </SearchBar>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Modifier' : 'Nouvelle'} classe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4" style={{ gridTemplateColumns: isPrimary ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' }}>
              <Select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value, name: e.target.value && formData.section ? `${e.target.value} ${formData.section}` : '' })}
                placeholder="Sélectionner un niveau"
                options={NIVEAUX.map(n => ({ value: n, label: n }))}
              />
              <Select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value, name: formData.level && e.target.value ? `${formData.level} ${e.target.value}` : '' })}
                placeholder="Sélectionner une section"
                options={SECTIONS.map(s => ({ value: s, label: s }))}
              />
              <Input
                placeholder="Capacité max"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              <Input
                placeholder="Salle (ex: 101)"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
              />
              {isPrimary && (
                <>
                  <Input
                    placeholder="Total max des notes"
                    type="number"
                    value={formData.grade_total_max}
                    onChange={(e) => setFormData({ ...formData, grade_total_max: e.target.value })}
                  />
                  <Input
                    placeholder="Échelle moyenne (ex: 10)"
                    type="number"
                    value={formData.grade_avg_scale}
                    onChange={(e) => setFormData({ ...formData, grade_avg_scale: e.target.value })}
                  />
                </>
              )}
              <Button type="submit" variant="primary" isLoading={createClass.isPending || updateClass.isPending}>
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table data={filteredClasses || []} columns={columns} />
      </Card>
    </div>
  );
};
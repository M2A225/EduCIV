import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';

import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Student, Class } from '../../types';
import { AddStudentModal } from '../../components/director/AddStudentModal';
import { ViewStudentModal } from '../../components/director/ViewStudentModal';
import { useBulletin } from '../../hooks/useBulletin';
import { useStudents } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';

const SEXE_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
];

const REGIME_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'EXTERNE', label: 'Externe' },
  { value: 'DEMI_PENSION', label: 'Demi-pension' },
  { value: 'INTERNE', label: 'Interne' },
];

const BOOL_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' },
];

export const StudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sexeFilter, setSexeFilter] = useState('');
  const [regimeFilter, setRegimeFilter] = useState('');
  const [repeaterFilter, setRepeaterFilter] = useState('');
  const [internalFilter, setInternalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { mutateAsync: generate, isPending: bulletinLoading } = useBulletin();
  const { data, isLoading } = useStudents();
  const { data: classes } = useClasses();

  const levels = useMemo(() => {
    if (!classes) return [];
    const lvls = [...new Set(classes.map((c: Class) => c.level).filter(Boolean))] as string[];
    return lvls.sort();
  }, [classes]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    return data.filter((s: Student) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
          !s.matricule?.toLowerCase().includes(search.toLowerCase())) return false;
      if (levelFilter) {
        const cls = classes?.find((c: Class) => c.id === s.class_id);
        if (cls?.level !== levelFilter) return false;
      }
      if (classFilter && s.class_id !== Number(classFilter)) return false;
      if (sexeFilter && s.sexe !== sexeFilter) return false;
      if (regimeFilter && s.regime !== regimeFilter) return false;
      if (repeaterFilter !== '' && s.is_repeater !== (repeaterFilter === 'true')) return false;
      if (internalFilter !== '' && s.is_internal !== (internalFilter === 'true')) return false;
      return true;
    });
  }, [data, search, levelFilter, classFilter, sexeFilter, regimeFilter, repeaterFilter, internalFilter, classes]);

  const getClassname = (classId?: number) => {
    if (!classId) return 'N/A';
    const cls = classes?.find((c: Class) => c.id === classId);
    return cls?.name || `Classe #${classId}`;
  };

  const columns: Column<Student>[] = [
    { header: 'Nom', accessor: (row: Student) => <span className="font-medium text-text">{row.name}</span> },
    { header: 'Matricule', accessor: (row: Student) => row.matricule || '-' },
    { header: 'Sexe', accessor: (row: Student) => row.sexe || '-' },
    { header: 'Classe', accessor: (row: Student) => getClassname(row.class_id) },
    { header: 'Régime', accessor: (row: Student) => row.regime || '-' },
    {
      header: 'Actions',
      accessor: (row: Student) => (
        <div className="flex gap-2">
          <Button variant="glass" className="text-xs px-3 py-1" onClick={() => setViewStudent(row)}>Voir</Button>
          <Button
            variant="primary"
            className="text-xs px-3 py-1"
            disabled={bulletinLoading}
            onClick={() => generate({ studentId: Number(row.id), periodId: 1, year: '2025-2026' })}
          >
            {bulletinLoading ? '...' : 'Bulletin'}
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={10} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Gestion des Élèves"
        subtitle={`${filteredStudents.length} élève(s)`}
        actions={<Button onClick={() => setIsModalOpen(true)} variant="primary">+ Ajouter Élève</Button>}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Rechercher par nom ou matricule..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        hasActiveFilters={!!(levelFilter || classFilter || sexeFilter || regimeFilter || repeaterFilter || internalFilter)}
        onResetFilters={() => {
          setLevelFilter('');
          setClassFilter('');
          setSexeFilter('');
          setRegimeFilter('');
          setRepeaterFilter('');
          setInternalFilter('');
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Select
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setClassFilter(''); }}
            placeholder="Niveau"
            options={[{ value: '', label: 'Tous les niveaux' }, ...levels.map(l => ({ value: l, label: l }))]}
          />
          <Select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            placeholder="Classe"
            options={[
              { value: '', label: 'Toutes les classes' },
              ...(classes ?? [])
                .filter((c: Class) => !levelFilter || c.level === levelFilter)
                .map((c: Class) => ({ value: String(c.id), label: c.name })),
            ]}
          />
          <Select
            value={sexeFilter}
            onChange={(e) => setSexeFilter(e.target.value)}
            placeholder="Sexe"
            options={SEXE_OPTIONS}
          />
          <Select
            value={regimeFilter}
            onChange={(e) => setRegimeFilter(e.target.value)}
            placeholder="Régime"
            options={REGIME_OPTIONS}
          />
          <Select
            value={repeaterFilter}
            onChange={(e) => setRepeaterFilter(e.target.value)}
            placeholder="Redoublant"
            options={BOOL_OPTIONS}
          />
          <Select
            value={internalFilter}
            onChange={(e) => setInternalFilter(e.target.value)}
            placeholder="Interne"
            options={BOOL_OPTIONS}
          />
        </div>
      </SearchBar>

      <Card className="overflow-hidden">
        <Table data={filteredStudents || []} columns={columns} />
      </Card>

      {isModalOpen && <AddStudentModal onClose={() => setIsModalOpen(false)} />}
      {viewStudent && <ViewStudentModal student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  );
};
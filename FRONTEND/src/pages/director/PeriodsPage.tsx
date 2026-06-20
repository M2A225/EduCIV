import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { LoadingState } from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { usePeriods, useCreatePeriod, useDeletePeriod } from '../../hooks/usePeriods';
import { useSchoolYears, useCreateSchoolYear, useDeleteSchoolYear } from '../../hooks/useSchoolYears';
import type { AcademicPeriod, SchoolYear } from '../../types';

const PERIOD_TYPE_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'TRIMESTRE_1', label: 'Trimestre 1' },
  { value: 'TRIMESTRE_2', label: 'Trimestre 2' },
  { value: 'TRIMESTRE_3', label: 'Trimestre 3' },
  { value: 'SEMESTRE_1', label: 'Semestre 1' },
  { value: 'SEMESTRE_2', label: 'Semestre 2' },
  { value: 'COMPOSITION_1', label: 'Composition 1' },
  { value: 'COMPOSITION_2', label: 'Composition 2' },
  { value: 'COMPOSITION_3', label: 'Composition 3' },
  { value: 'PASSAGE', label: 'Composition de passage' },
];

export const PeriodsPage = () => {
  const { data: periods, isLoading: periodsLoading } = usePeriods();
  const { data: schoolYears, isLoading: yearsLoading } = useSchoolYears();
  const createPeriod = useCreatePeriod();
  const deletePeriod = useDeletePeriod();
  const createSchoolYear = useCreateSchoolYear();
  const deleteSchoolYear = useDeleteSchoolYear();

  const [showYearForm, setShowYearForm] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [yearRange, setYearRange] = useState('');
  const [periodForm, setPeriodForm] = useState({ name: '', period_type: '', start_date: '', end_date: '', school_year_id: '' });

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearRange) return;
    try {
      await createSchoolYear.mutateAsync({ year_range: yearRange });
      setYearRange('');
      setShowYearForm(false);
    } catch { toast.error('Impossible de créer l\'année scolaire'); }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodForm.name || !periodForm.start_date || !periodForm.end_date) return;
    try {
      await createPeriod.mutateAsync({
        name: periodForm.name,
        period_type: periodForm.period_type || undefined,
        start_date: periodForm.start_date,
        end_date: periodForm.end_date,
        school_year_id: periodForm.school_year_id ? Number(periodForm.school_year_id) : undefined,
      });
      setPeriodForm({ name: '', period_type: '', start_date: '', end_date: '', school_year_id: '' });
      setShowPeriodForm(false);
    } catch { toast.error('Impossible de créer la période'); }
  };

  const isLoading = periodsLoading || yearsLoading;

  const periodColumns = [
    { header: 'Période', accessor: (row: AcademicPeriod) => <span className="font-medium text-text">{row.name}</span> },
    { header: 'Type', accessor: (row: AcademicPeriod) => {
      const labels: Record<string, string> = {
        TRIMESTRE_1: 'T1', TRIMESTRE_2: 'T2', TRIMESTRE_3: 'T3',
        SEMESTRE_1: 'S1', SEMESTRE_2: 'S2',
        COMPOSITION_1: 'Comp1', COMPOSITION_2: 'Comp2', COMPOSITION_3: 'Comp3',
        PASSAGE: 'Passage',
      };
      return row.period_type ? labels[row.period_type] || row.period_type : '-';
    }},
    { header: 'Début', accessor: (row: AcademicPeriod) => new Date(row.start_date).toLocaleDateString('fr-FR') },
    { header: 'Fin', accessor: (row: AcademicPeriod) => new Date(row.end_date).toLocaleDateString('fr-FR') },
    {
      header: 'Actions',
      accessor: (row: AcademicPeriod) => (
        <Button
          variant="outline"
          className="text-xs px-2 py-1 border-red-200 text-red-600"
          isLoading={deletePeriod.isPending}
          onClick={() => deletePeriod.mutate(row.id)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Périodes Académiques"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => { setShowPeriodForm(prev => !prev); setShowYearForm(false); }} variant="glass">
              {showPeriodForm ? 'Annuler' : '+ Période'}
            </Button>
            <Button onClick={() => { setShowYearForm(prev => !prev); setShowPeriodForm(false); }} variant="primary">
              {showYearForm ? 'Annuler' : '+ Année scolaire'}
            </Button>
          </div>
        }
      />

      {showYearForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle année scolaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateYear} className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Année (ex: 2025-2026)"
                value={yearRange}
                onChange={(e) => setYearRange(e.target.value)}
                required
              />
              <div className="flex items-end">
                <Button type="submit" variant="primary" isLoading={createSchoolYear.isPending} className="w-full">
                  Créer
                </Button>
              </div>
            </form>
            <p className="text-xs text-text/40 mt-2">
              Les périodes (trimestres, semestres ou compositions) seront automatiquement générées selon le système éducatif défini dans les paramètres de l'école.
            </p>
          </CardContent>
        </Card>
      )}

      {showPeriodForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle période</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePeriod} className="grid gap-4 md:grid-cols-5">
              <Input
                placeholder="Nom (ex: Trimestre 1)"
                value={periodForm.name}
                onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                required
              />
              <Select
                value={periodForm.period_type}
                onChange={(e) => setPeriodForm({ ...periodForm, period_type: e.target.value })}
                placeholder="Type"
                options={PERIOD_TYPE_OPTIONS}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Début</label>
                <Input
                  type="date"
                  value={periodForm.start_date}
                  onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fin</label>
                <Input
                  type="date"
                  value={periodForm.end_date}
                  onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
                  required
                />
              </div>
              <Select
                value={periodForm.school_year_id}
                onChange={(e) => setPeriodForm({ ...periodForm, school_year_id: e.target.value })}
                placeholder="Année scolaire"
                options={[
                  { value: '', label: 'Aucune' },
                  ...(schoolYears ?? []).map((sy: SchoolYear) => ({ value: String(sy.id), label: sy.year_range })),
                ]}
              />
              <div className="md:col-span-5 flex items-end">
                <Button type="submit" variant="primary" isLoading={createPeriod.isPending} className="w-full">
                  Créer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* School Years */}
      {schoolYears && schoolYears.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-text">Années scolaires</h2>
          {schoolYears.map((sy: SchoolYear) => {
            const yearPeriods = periods?.filter((p: AcademicPeriod) => p.school_year_id === sy.id) || [];
            return (
              <Card key={sy.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{sy.year_range}</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    className="text-xs px-2 py-1 border-red-200 text-red-600"
                    isLoading={deleteSchoolYear.isPending}
                    onClick={() => deleteSchoolYear.mutate(sy.id)}
                  >
                    Supprimer
                  </Button>
                </CardHeader>
                <CardContent>
                  {yearPeriods.length > 0 ? (
                    <Table data={yearPeriods} columns={periodColumns} />
                  ) : (
                    <p className="text-text/40 text-sm">Aucune période définie</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Standalone periods (not linked to a school year) */}
      {periods && periods.filter((p: AcademicPeriod) => !p.school_year_id).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-heading font-bold text-text">Autres périodes</h2>
          <Card className="overflow-hidden">
            <Table data={periods.filter((p: AcademicPeriod) => !p.school_year_id)} columns={periodColumns} />
          </Card>
        </div>
      )}
    </div>
  );
};
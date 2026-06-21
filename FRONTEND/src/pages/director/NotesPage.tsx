import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useClasses } from '../../hooks/useClasses';
import { usePeriods } from '../../hooks/usePeriods';
import { usePendingNotes, useValidateNote, useRejectNote } from '../../hooks/useNotes';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Grade, Class, AcademicPeriod, ApiResponse } from '../../types';

interface GridGrade {
  id?: number;
  value: number | null;
  max_score: number;
  comment: string;
}

interface GridSubject {
  id: number;
  name: string;
  coefficient: number;
  max_score?: number;
}

interface GridStudent {
  id: number;
  name: string;
}

interface GridData {
  students: GridStudent[];
  subjects: GridSubject[];
  grades: Record<string, GridGrade>;
  classConfig: { grade_total_max: number; grade_avg_scale: number } | null;
}

export const NotesPage = () => {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: periods, isLoading: periodsLoading } = usePeriods();
  const { data: pendingGrades, isLoading: pendingLoading } = usePendingNotes();
  const validateNote = useValidateNote();
  const rejectNote = useRejectNote();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, string>>({});
  const [appreciations, setAppreciations] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: number; open: boolean }>({ id: 0, open: false });
  const [rejectReason, setRejectReason] = useState('');

  const handleLoad = async () => {
    if (!selectedClassId || !selectedPeriodId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/notes/class/${selectedClassId}/period/${selectedPeriodId}`);
      const body = (res.data as ApiResponse<GridData>)?.data ?? (res.data as GridData);
      const data = body as GridData;
      setGridData(data);

      const values: Record<string, string> = {};
      const appre: Record<number, string> = {};
      if (data.grades) {
        const studentComments: Record<number, string[]> = {};
        for (const [key, grade] of Object.entries(data.grades)) {
          values[key] = grade.value != null ? String(grade.value) : '';
          const [sid] = key.split('-').map(Number);
          if (grade.comment) {
            if (!studentComments[sid]) studentComments[sid] = [];
            studentComments[sid].push(grade.comment);
          }
        }
        for (const [sid, comments] of Object.entries(studentComments)) {
          appre[Number(sid)] = comments[0] || '';
        }
      }
      setCellValues(values);
      setAppreciations(appre);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erreur lors du chargement des notes');
      setGridData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = useCallback((studentId: number, subjectId: number, value: string) => {
    const key = `${studentId}-${subjectId}`;
    setCellValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAppreciationChange = useCallback((studentId: number, text: string) => {
    setAppreciations(prev => ({ ...prev, [studentId]: text }));
  }, []);

  const handleSave = async () => {
    if (!gridData || !selectedPeriodId) return;
    setSaving(true);
    const gradesToSave: Array<{
      student_id: number;
      subject_id: number;
      value: number;
      max_score: number;
      comment: string;
      period_id: number;
      type: string;
    }> = [];

    for (const student of gridData.students) {
      for (const subject of gridData.subjects) {
        const key = `${student.id}-${subject.id}`;
        const val = cellValues[key];
        if (val !== undefined && val !== '') {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            gradesToSave.push({
              student_id: student.id,
              subject_id: subject.id,
              value: numVal,
              max_score: subject.max_score || 20,
              comment: appreciations[student.id] || '',
              period_id: Number(selectedPeriodId),
              type: 'DEVOIR',
            });
          }
        }
      }
    }

    if (gradesToSave.length === 0) {
      toast.warning('Aucune note à enregistrer');
      setSaving(false);
      return;
    }

    try {
      await api.post('/notes/bulk', { grades: gradesToSave });
      toast.success(`${gradesToSave.length} note(s) enregistrée(s) avec succès`);
      await handleLoad();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'enregistrement des notes');
    } finally {
      setSaving(false);
    }
  };

  const gradeTotalMax = useMemo(() => {
    if (gridData?.classConfig?.grade_total_max) {
      return gridData.classConfig.grade_total_max;
    }
    if (gridData?.subjects) {
      return gridData.subjects.reduce((sum, s) => sum + (s.max_score || 20), 0);
    }
    return 0;
  }, [gridData]);

  const gradeAvgScale = useMemo(() => {
    return gridData?.classConfig?.grade_avg_scale || 20;
  }, [gridData]);

  const studentRowData = useMemo(() => {
    if (!gridData) return [];
    return gridData.students.map(student => {
      let total = 0;
      const subjectsData = gridData.subjects.map(subject => {
        const key = `${student.id}-${subject.id}`;
        const val = cellValues[key];
        const numVal = val !== '' ? Number(val) : null;
        if (numVal !== null && !isNaN(numVal)) {
          total += numVal;
        }
        return { subject, value: val ?? '' };
      });
      const average = gradeTotalMax > 0 ? (total / gradeTotalMax) * gradeAvgScale : 0;
      return { student, subjectsData, total, average };
    });
  }, [gridData, cellValues, gradeTotalMax, gradeAvgScale]);

  const classInfo = useMemo(() => {
    if (!gridData || !classes) return null;
    return classes.find((c: Class) => String(c.id) === selectedClassId);
  }, [gridData, classes, selectedClassId]);

  const selectedPeriodName = useMemo(() => {
    if (!periods) return '';
    const p = periods.find((p: AcademicPeriod) => String(p.id) === selectedPeriodId);
    return p?.name || '';
  }, [periods, selectedPeriodId]);

  if (classesLoading || periodsLoading) return <LoadingState type="card" count={3} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Saisie des notes" />

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Select
              label="Classe"
              placeholder="Sélectionner une classe"
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setGridData(null); }}
              options={(classes || []).map((c: Class) => ({ value: String(c.id), label: c.name }))}
            />
            <Select
              label="Période"
              placeholder="Sélectionner une période"
              value={selectedPeriodId}
              onChange={(e) => { setSelectedPeriodId(e.target.value); setGridData(null); }}
              options={(periods || []).map((p: AcademicPeriod) => ({ value: String(p.id), label: p.name }))}
            />
            <div className="flex items-end">
              <Button
                onClick={handleLoad}
                disabled={!selectedClassId || !selectedPeriodId}
                isLoading={loading}
              >
                Charger
              </Button>
            </div>
          </div>

          {error && (
            <Feedback type="error" message={error} onRetry={handleLoad} />
          )}

          {!selectedClassId && !selectedPeriodId && (
            <div className="text-center py-12 text-text/60">
              Sélectionnez une classe et une période
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Grades Validation */}
      <Card className="border border-yellow-200 bg-yellow-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            Notes en attente de validation
            {pendingGrades && pendingGrades.length > 0 && (
              <Badge className="bg-yellow-200 text-yellow-800 ml-2">{pendingGrades.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <LoadingState type="list" count={5} />
          ) : !pendingGrades || pendingGrades.length === 0 ? (
            <p className="text-text/60 text-center py-4">Aucune note en attente</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pendingGrades.map((g: Grade) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-100">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {g.student?.name || `Élève #${g.student_id}`} - {g.subject?.name || `Matière #${g.subject_id}`}
                    </div>
                    <div className="text-xs text-text/60">
                      Note: <span className="font-bold text-primary">{g.value}/20</span> | Type: {g.type} | Période: {g.period?.name || `#${g.period_id}`}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button
                      variant="primary"
                      className="text-xs px-3 py-1.5"
                      onClick={() => {
                        validateNote.mutate(g.id);
                      }}
                      isLoading={validateNote.isPending}
                    >
                      Valider
                    </Button>
                    <Button
                      variant="outline"
                      className="text-xs px-3 py-1.5 border-red-200 text-red-600"
                      onClick={() => { setRejectModal({ id: g.id, open: true }); setRejectReason(''); }}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {gridData && (
        <>
        <Card>
            <CardHeader>
              <CardTitle>
                {classInfo?.name || `Classe #${selectedClassId}`}
                <span className="text-base font-normal ml-4 text-text/60">
                  {gridData.students.length} élève{gridData.students.length > 1 ? 's' : ''}
                </span>
                <span className="text-base font-normal ml-4 text-text/60">
                  Période: {selectedPeriodName || 'N/A'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gridData.students.length === 0 && (
                <div className="text-center py-12 text-text/60">Aucun élève dans cette classe</div>
              )}
              {gridData.subjects.length === 0 && (
                <div className="text-center py-12 text-text/60">Aucune matière configurée</div>
              )}
              {gridData.students.length > 0 && gridData.subjects.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-primary/5 text-primary uppercase font-heading font-bold text-xs tracking-widest">
                        <th className="px-4 py-3 border-b border-primary/10 min-w-[180px]">Élève</th>
                        {gridData.subjects.map((subject) => (
                          <th key={subject.id} className="px-3 py-3 border-b border-primary/10 text-center min-w-[110px]">
                            <div>{subject.name}</div>
                            <div className="text-[10px] font-normal text-text/50 mt-0.5">
                              /{subject.max_score || 20}
                            </div>
                          </th>
                        ))}
                        <th className="px-3 py-3 border-b border-primary/10 text-center min-w-[80px]">Total</th>
                        <th className="px-3 py-3 border-b border-primary/10 text-center min-w-[80px]">Moy.</th>
                        <th className="px-3 py-3 border-b border-primary/10 text-center min-w-[160px]">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {studentRowData.map(({ student, subjectsData, total, average }) => (
                        <tr key={student.id} className="hover:bg-primary/3 transition-colors">
                          <td className="px-4 py-2 font-medium text-text">
                            {student.name}
                          </td>
                          {subjectsData.map(({ subject, value }) => (
                            <td key={subject.id} className="px-2 py-2 text-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={subject.max_score || 20}
                                value={value}
                                onChange={(e) => handleCellChange(student.id, subject.id, e.target.value)}
                                className="w-20 h-9 text-center rounded-lg border border-primary/10 bg-white/50 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/20 transition-all"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-semibold text-text">
                            {total.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-text">
                            {average.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <textarea
                              rows={1}
                              value={appreciations[student.id] || ''}
                              onChange={(e) => handleAppreciationChange(student.id, e.target.value)}
                              className="w-36 min-h-[2.25rem] rounded-lg border border-primary/10 bg-white/50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/20 transition-all resize-none"
                              placeholder="..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving} size="lg">
              Enregistrer tout
            </Button>
          </div>
        </>
      )}
      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Rejeter la note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text/60 mb-4">Veuillez fournir un motif de rejet (optionnel) :</p>
              <textarea
                className="input w-full min-h-[100px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motif du rejet..."
              />
              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    rejectNote.mutate({ id: rejectModal.id, reason: rejectReason || undefined });
                    setRejectModal({ id: 0, open: false });
                  }}
                  isLoading={rejectNote.isPending}
                >
                  Confirmer le rejet
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setRejectModal({ id: 0, open: false })}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

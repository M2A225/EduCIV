import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { Save, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../../components/ui/LoadingState';
import type { Class, SchoolYear } from '../../types';

interface ProgressionStudent {
  id: number;
  name: string;
  average?: number | null;
}

interface ProgressionOption {
  classId: number;
  label: string;
}

export const ProgressionPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [students, setStudents] = useState<ProgressionStudent[]>([]);
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [destinations, setDestinations] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [options, setOptions] = useState<Record<number, ProgressionOption[]>>({});
  const [loading, setLoading] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [classesRes, yearsRes] = await Promise.all([
          api.get('/classes'),
          api.get('/school-years'),
        ]);
        setClasses(classesRes.data.data || []);
        const yrs = yearsRes.data.data || [];
        setYears(yrs);
        if (yrs.length > 0) setSelectedYearId(String(yrs[yrs.length - 1].id));
      } catch { toast.error('Erreur chargement'); }
    };
    init();
  }, []);

  const loadStudents = async () => {
    if (!selectedClassId || !selectedYearId) return;
    setLoading(true);
    try {
      const studentsRes = await api.get(`/progression/class/${selectedClassId}/year/${selectedYearId}`);
      setStudents(studentsRes.data.data || []);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const loadOptions = async (studentId: number) => {
    if (options[studentId]) return;
    try {
      const res = await api.get(`/progression/options/${selectedClassId}`);
      setOptions(prev => ({ ...prev, [studentId]: res.data.data || [] }));
    } catch { toast.error('Erreur chargement options'); }
  };

  useEffect(() => { loadStudents(); }, [selectedClassId, selectedYearId]);

  const handleDecide = async () => {
    setDeciding(true);
    let count = 0;
    let errors = 0;
    for (const s of students) {
      const decision = decisions[s.id];
      if (!decision) continue;
      try {
        await api.post('/progression/decide', {
          student_id: s.id,
          final_decision: decision,
          next_class_id: destinations[s.id] ? Number(destinations[s.id]) : undefined,
          comment: comments[s.id] || undefined,
        });
        count++;
      } catch { errors++; }
    }
    setDeciding(false);
    if (errors > 0) {
      toast.warning(`${count} décision(s) enregistrée(s), ${errors} erreur(s)`);
    } else {
      toast.success(`${count} décision(s) enregistrée(s)`);
    }
  };

  const handleApply = async () => {
    if (!selectedYearId) return;
    if (!confirm('Cette action est irréversible. Les élèves seront affectés dans leurs nouvelles classes. Continuer ?')) return;
    if (!confirm('Confirmez-vous l\'application de toutes les décisions de fin d\'année ?')) return;
    setApplying(true);
    try {
      const res = await api.post('/progression/apply', { school_year_id: Number(selectedYearId) });
      toast.success(`${res.data.data.applied} décision(s) appliquée(s)`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erreur lors de l\'application');
    } finally { setApplying(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Décisions de fin d'année"
        subtitle="Définissez le passage des élèves"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" isLoading={deciding} onClick={handleDecide}>
              <Save className="w-4 h-4" /> Enregistrer
            </Button>
            <Button variant="cta" isLoading={applying} onClick={handleApply}>
              <CheckCircle2 className="w-4 h-4" /> Appliquer la clôture
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Select value={selectedYearId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedYearId(e.target.value)}
          options={years.map(y => ({ value: String(y.id), label: y.year_range }))} />
        <Select value={selectedClassId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClassId(e.target.value)}
          options={[{ value: '', label: 'Classe...' }, ...classes.map((c: Class) => ({ value: String(c.id), label: c.name }))]} />
      </div>

      {loading ? (
        <LoadingState />
      ) : students.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text font-medium">
                    <th className="text-left p-3">Élève</th>
                    <th className="text-left p-3">Moyenne</th>
                    <th className="text-left p-3">Décision</th>
                    <th className="text-left p-3">Destination</th>
                    <th className="text-left p-3">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">{s.average || '-'}</td>
                      <td className="p-3">
                        <select
                          value={decisions[s.id] || ''}
                          onChange={(e) => {
                            setDecisions(prev => ({ ...prev, [s.id]: e.target.value }));
                            if (e.target.value) loadOptions(s.id);
                          }}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="ADMIS">ADMIS</option>
                          <option value="REDOUBLE">REDOUBLE</option>
                          <option value="TRANSFERE">TRANSFERE</option>
                          <option value="EXCLU">EXCLU</option>
                          <option value="ABANDON">ABANDON</option>
                        </select>
                      </td>
                      <td className="p-3">
                        {decisions[s.id] === 'ADMIS' && options[s.id] && (
                          <select
                            value={destinations[s.id] || ''}
                            onChange={(e) => setDestinations(prev => ({ ...prev, [s.id]: e.target.value }))}
                            className="border rounded-lg px-2 py-1 text-sm"
                          >
                            <option value="">Destination...</option>
                            {options[s.id].map((o: ProgressionOption) => (
                              <option key={o.classId || o.label} value={o.classId || ''}>{o.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3">
                        <input
                          value={comments[s.id] || ''}
                          onChange={(e) => setComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                          placeholder={decisions[s.id] === 'TRANSFERE' ? 'Nom établissement (obligatoire)' : 'Optionnel'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : selectedClassId ? (
        <Card><CardContent className="py-8 text-center text-text/40">Aucun élève dans cette classe</CardContent></Card>
      ) : null}
    </div>
  );
};

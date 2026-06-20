import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { Save } from 'lucide-react';
import { LoadingState } from '../../components/ui/LoadingState';

export const ProgressionVotePage = () => {
  const [classes, setClasses] = useState<Record<string, unknown>[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Record<string, unknown>[]>([]);
  const [votes, setVotes] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [yearId, setYearId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [assignmentsRes, yearsRes] = await Promise.all([
          api.get('/teacher-subjects/my-assignments'),
          api.get('/school-years'),
        ]);
        const years = yearsRes.data.data || [];
        const current = years.length > 0 ? years[years.length - 1] : null;
        if (current) setYearId(current.id);

        const uniqueClasses = new Map();
        (assignmentsRes.data.data || []).forEach((a: Record<string, unknown>) => {
          const c = a.class as { id: number; name: string } | undefined;
          if (c) uniqueClasses.set(c.id, c);
        });
        setClasses(Array.from(uniqueClasses.values()));
      } catch {
        toast.error('Erreur chargement');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadStudents = async () => {
    if (!selectedClassId || !yearId) return;
    setLoading(true);
    try {
      const [studentsRes, votesRes] = await Promise.all([
        api.get(`/progression/class/${selectedClassId}/year/${yearId}`),
        api.get(`/progression/votes/class/${selectedClassId}/year/${yearId}`),
      ]);
      const studentsData = studentsRes.data.data || [];
      const votesData = votesRes.data.data || [];
      setStudents(studentsData);
      const voteMap: Record<number, string> = {};
      const commentMap: Record<number, string> = {};
      votesData.forEach((v: Record<string, unknown>) => {
        voteMap[v.student_id as number] = v.decision as string;
        if (v.comment) commentMap[v.student_id as number] = v.comment as string;
      });
      setVotes(voteMap);
      setComments(commentMap);
    } catch {
      toast.error('Erreur chargement élèves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [selectedClassId]);

  const handleVote = async () => {
    if (!selectedClassId || !yearId) return;
    setSaving(true);
    let count = 0;
    for (const student of students) {
      const decision = votes[student.id];
      if (!decision) continue;
      try {
        await api.post('/progression/vote', {
          student_id: student.id,
          decision,
          comment: comments[student.id] || undefined,
        });
        count++;
      } catch {
        toast.error(`Erreur pour ${student.name}`);
      }
    }
    toast.success(`${count} vote(s) enregistré(s)`);
    setSaving(false);
  };

  if (loading && classes.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conseil de classe"
        subtitle="Votez pour chaque élève"
        actions={<Button onClick={handleVote} isLoading={saving}><Save className="w-4 h-4" /> Enregistrer les votes</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <Select
            value={selectedClassId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedClassId(e.target.value)}
            options={[{ value: '', label: 'Sélectionner une classe' }, ...classes.map((c: Record<string, unknown>) => ({ value: String(c.id as number), label: c.name as string }))]}
          />
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Élèves de la classe</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text font-medium">
                    <th className="text-left p-3">Élève</th>
                    <th className="text-left p-3">Moyenne</th>
                    <th className="text-left p-3">Décision</th>
                    <th className="text-left p-3">Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-t border-gray-100">
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.average || '-'}</td>
                      <td className="p-3">
                        <select
                          value={votes[s.id] || ''}
                          onChange={(e) => setVotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="ADMIS">ADMIS</option>
                          <option value="REDOUBLE">REDOUBLE</option>
                          <option value="ABSTENTION">ABSTENTION</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          value={comments[s.id] || ''}
                          onChange={(e) => setComments(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                          placeholder="Optionnel"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { subjectService } from '../../services/subjects';
import { MATIERES_SECONDAIRE_6E_3E, MATIERES_LYCEE } from '../../lib/constants';
import { useAuth } from '../../hooks/useAuth';
import { schoolService } from '../../services/schools';

interface SubjectRow {
  name: string;
  coefficient: number;
  max_score: number;
}

interface Props {
  onComplete: () => void;
}

const TECH_SUBJECTS = ['Dessin Technique', 'Informatique'];
const PRO_SUBJECTS = ['Gestion', 'Comptabilité', 'Informatique'];

export const StepSubjects = ({ onComplete }: Props) => {
  const { currentSchoolId } = useAuth();
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [schoolType, setSchoolType] = useState('');
  const [philosophieDebut2nde, setPhilosophieDebut2nde] = useState(false);

  useEffect(() => {
    if (currentSchoolId) {
      schoolService.getMySchool().then(res => {
        const type = res.data.school_type || '';
        setSchoolType(type);

        let list: { name: string; coefficient: number }[];

        if (type === 'SECONDAIRE') {
          list = MATIERES_SECONDAIRE_6E_3E;
        } else if (type === 'LYCEE_TECHNIQUE') {
          list = MATIERES_LYCEE.map(m => ({ name: m, coefficient: 2 }));
          TECH_SUBJECTS.forEach(s => {
            if (!list.find(l => l.name === s)) list.push({ name: s, coefficient: 2 });
          });
        } else if (type === 'LYCEE_PROFESSIONNEL') {
          list = MATIERES_LYCEE.map(m => ({ name: m, coefficient: 2 }));
          PRO_SUBJECTS.forEach(s => {
            if (!list.find(l => l.name === s)) list.push({ name: s, coefficient: 2 });
          });
        } else {
          const all = [
            ...MATIERES_SECONDAIRE_6E_3E,
            ...MATIERES_LYCEE.filter(m => !MATIERES_SECONDAIRE_6E_3E.find(s => s.name === m)).map(m => ({ name: m, coefficient: 2 })),
          ];
          list = all.reduce((acc, item) => {
            if (!acc.find(a => a.name === item.name)) acc.push(item);
            return acc;
          }, [] as { name: string; coefficient: number }[]);
        }

        setSubjects(list.map(s => ({ name: s.name, coefficient: s.coefficient, max_score: 20 })));
      });
    }
  }, [currentSchoolId]);

  const update = (index: number, field: keyof SubjectRow, value: string | number) => {
    setSubjects(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const add = () => setSubjects(prev => [...prev, { name: '', coefficient: 1, max_score: 20 }]);
  const remove = (index: number) => setSubjects(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const filtered = subjects.filter(s => s.name);
      if (!philosophieDebut2nde && schoolType === 'SECONDAIRE') {
        const idx = filtered.findIndex(s => s.name === 'Philosophie');
        if (idx >= 0) filtered.splice(idx, 1);
      }
      await subjectService.bulkCreate(filtered.map(s => ({ ...s, level_group: '' })));
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const valid = subjects.some(s => s.name);

  return (
    <div className="space-y-6">
      <p className="text-text/60 text-sm">Définissez les matières enseignées dans votre établissement :</p>

      {schoolType === 'SECONDAIRE' && MATIERES_SECONDAIRE_6E_3E.some(s => s.name === 'Philosophie') && (
        <label className="flex items-center gap-3 text-sm bg-primary/5 rounded-xl px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={philosophieDebut2nde}
            onChange={e => setPhilosophieDebut2nde(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            <strong>Philosophie dès la 2nde</strong>
            <span className="text-text/50 ml-2">(Sinon la Philosophie commence en 1ère)</span>
          </span>
        </label>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text/60 border-b border-border/20">
            <th className="pb-2 font-medium">Matière</th>
            <th className="pb-2 font-medium w-24">Coefficient</th>
            <th className="pb-2 font-medium w-24">Max score</th>
            <th className="pb-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={i} className="border-b border-border/10">
              <td className="py-2">
                <Input value={s.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Nom de la matière" />
              </td>
              <td className="py-2 px-2">
                <Input type="number" min={1} max={10} value={s.coefficient} onChange={e => update(i, 'coefficient', Number(e.target.value))} />
              </td>
              <td className="py-2 px-2">
                <Input type="number" min={0} max={200} value={s.max_score} onChange={e => update(i, 'max_score', Number(e.target.value))} />
              </td>
              <td className="py-2">
                <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-lg">&times;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="secondary" onClick={add}>+ Ajouter une matière</Button>
      <p className="text-xs text-text/40">Les LV2 (Allemand, Espagnol) sont des matières distinctes. L'assignation à une classe spécifique se fait après la configuration.</p>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!valid || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

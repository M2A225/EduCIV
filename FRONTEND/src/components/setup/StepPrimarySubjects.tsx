import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { subjectService } from '../../services/subjects';
import { MATIERES_PRIMAIRE, OPTIONNELLES_PRIMAIRE, TOTAL_PRIMAIRE } from '../../lib/constants';

interface SubjectItem {
  name: string;
  max_score: number;
  level_group: string;
  is_optionnel?: boolean;
}

interface Props {
  onComplete: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  'CP1-CP2': 'CP1 – CP2',
  'CE1-CE2': 'CE1 – CE2',
  'CM1-CM2': 'CM1 – CM2',
};

function buildInitialSubjects(): Record<string, SubjectItem[]> {
  const init: Record<string, SubjectItem[]> = {};
  for (const [group, items] of Object.entries(MATIERES_PRIMAIRE)) {
    init[group] = items.map(m => ({ ...m, level_group: group }));
  }
  init['CP1-CP2'].push(
    ...OPTIONNELLES_PRIMAIRE.map(name => ({ name, max_score: 0, level_group: 'CP1-CP2', is_optionnel: true }))
  );
  init['CE1-CE2'].push(
    ...OPTIONNELLES_PRIMAIRE.map(name => ({ name, max_score: 0, level_group: 'CE1-CE2', is_optionnel: true }))
  );
  init['CM1-CM2'].push(
    ...OPTIONNELLES_PRIMAIRE.map(name => ({ name, max_score: 0, level_group: 'CM1-CM2', is_optionnel: true }))
  );
  return init;
}

export const StepPrimarySubjects = ({ onComplete }: Props) => {
  const [subjects, setSubjects] = useState<Record<string, SubjectItem[]>>(buildInitialSubjects);
  const [saving, setSaving] = useState(false);

  const update = (group: string, index: number, field: 'name' | 'max_score', value: string | number) => {
    setSubjects(prev => ({
      ...prev,
      [group]: prev[group].map((s, i) => i === index ? { ...s, [field]: value } : s),
    }));
  };

  const remove = (group: string, index: number) => {
    setSubjects(prev => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== index),
    }));
  };

  const addOption = (group: string) => {
    setSubjects(prev => ({
      ...prev,
      [group]: [...prev[group], { name: '', max_score: 0, level_group: group, is_optionnel: true }],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const all = Object.values(subjects).flat().filter(s => s.name && s.max_score > 0);
      await subjectService.bulkCreate(
        all.map(s => ({
          name: s.name,
          coefficient: 1,
          max_score: s.max_score,
          level_group: s.level_group,
        }))
      );
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const total = (group: string) => subjects[group]?.reduce((sum, s) => sum + (s.max_score || 0), 0) || 0;
  const hasAny = Object.values(subjects).flat().some(s => s.name && s.max_score > 0);

  return (
    <div className="space-y-8">
      <p className="text-text/60 text-sm">
        Définissez les épreuves par groupe de niveaux. Les matières en italique sont optionnelles — supprimez-les ou ajustez leur score max.
      </p>

      {Object.entries(subjects).map(([group, items]) => (
        <div key={group} className="bg-primary/3 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{GROUP_LABELS[group]}</h4>
            <span className="text-xs text-text/40">
              Total : <strong>{total(group)}</strong> / {TOTAL_PRIMAIRE[group]}
            </span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text/60 border-b border-border/20">
                <th className="pb-2 font-medium">Épreuve</th>
                <th className="pb-2 font-medium w-28">Score max</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={i} className="border-b border-border/10">
                  <td className="py-2">
                    <Input
                      value={s.name}
                      onChange={e => update(group, i, 'name', e.target.value)}
                      placeholder="Nom de l'épreuve"
                      className={s.is_optionnel ? 'italic text-text/50' : ''}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={s.max_score}
                      onChange={e => update(group, i, 'max_score', Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2">
                    {s.is_optionnel && (
                      <button type="button" onClick={() => remove(group, i)} className="text-red-400 hover:text-red-600 text-lg">&times;</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button variant="secondary" size="sm" onClick={() => addOption(group)}>
            + Ajouter une épreuve optionnelle
          </Button>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!hasAny || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

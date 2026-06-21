import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { schoolService } from '../../services/schools';
import { PERIODES_PAR_TYPE, SCHOOL_TYPE_LABELS } from '../../lib/constants';
import { api } from '../../services/api';

interface PeriodRow {
  name: string;
  type: string;
  start_date: string;
  end_date: string;
}

interface Props {
  onComplete: () => void;
}

export const StepSchoolYear = ({ onComplete }: Props) => {
  const { currentSchoolId } = useAuth();
  const [yearRange, setYearRange] = useState('');
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [schoolType, setSchoolType] = useState('');
  const [hasCM2, setHasCM2] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const year = new Date().getFullYear();
    setYearRange(`${year}-${year + 1}`);
  }, []);

  useEffect(() => {
    if (currentSchoolId) {
      schoolService.getMySchool().then(res => {
        const st = res.data.school_type || 'SECONDAIRE';
        setSchoolType(st);
      });
      schoolService.getLevels().then(res => {
        const levels = res.data.map((l: { level: string }) => l.level);
        setHasCM2(levels.includes('CM2'));
      });
    }
  }, [currentSchoolId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!schoolType) return;
    const isPrimary = schoolType === 'PRIMAIRE' || (schoolType === 'GROUPE_SCOLAIRE' && hasCM2);
    const isLyc = schoolType === 'LYCEE_TECHNIQUE' || schoolType === 'LYCEE_PROFESSIONNEL';

    let template: { name: string; type: string }[];
    if (isPrimary && hasCM2) {
      template = PERIODES_PAR_TYPE.PRIMAIRE_CM2;
    } else if (isPrimary) {
      template = PERIODES_PAR_TYPE.PRIMAIRE_CP1_CM1;
    } else if (isLyc) {
      template = PERIODES_PAR_TYPE.LYCEE;
    } else {
      template = PERIODES_PAR_TYPE.SECONDAIRE;
    }

    const year = new Date().getFullYear();
    const isUniqueDay = isPrimary;
    setPeriods(template.map((p, i) => {
      const base = new Date(year, 8 + i * 2, 15);
      const start = base.toISOString().split('T')[0];
      const end = isUniqueDay ? start : new Date(year + (i >= 2 ? 1 : 0), 10 + i * 2, 15).toISOString().split('T')[0];
      return { ...p, start_date: start, end_date: end };
    }));
  }, [schoolType, hasCM2]);

  const updatePeriod = (index: number, field: 'start_date' | 'end_date', value: string) => {
    setPeriods(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const syRes = await api.post('/school-years', { year_range: yearRange });
      const schoolYearId = syRes.data.id;

      for (const p of periods) {
        await api.post('/academic-periods', {
          name: p.name,
          period_type: p.type,
          start_date: p.start_date,
          end_date: p.end_date,
          school_year_id: schoolYearId,
        });
      }
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const isValid = yearRange && periods.length > 0 && periods.every(p => p.start_date && p.end_date);

  return (
    <div className="space-y-6">
      <Input label="Année scolaire" value={yearRange} onChange={e => setYearRange(e.target.value)}
        placeholder="Ex: 2025-2026" required />

      {schoolType && (
        <div className="bg-primary/5 rounded-xl p-4 space-y-1">
          <p className="text-sm font-medium">Périodes pour {SCHOOL_TYPE_LABELS[schoolType] || schoolType}</p>
          {hasCM2 && <p className="text-xs text-text/50">Le CM2 a des périodes spécifiques (2 compositions + 1 examen blanc)</p>}
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text/60 border-b border-border/20">
            <th className="pb-2 font-medium">Période</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Date début</th>
            <th className="pb-2 font-medium">Date fin</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p, i) => (
            <tr key={i} className="border-b border-border/10">
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2 text-text/60">{p.type}</td>
              <td className="py-2">
                <Input type="date" value={p.start_date} onChange={e => updatePeriod(i, 'start_date', e.target.value)} />
              </td>
              <td className="py-2">
                <Input type="date" value={p.end_date} onChange={e => updatePeriod(i, 'end_date', e.target.value)}
                  disabled={schoolType === 'PRIMAIRE' || (schoolType === 'GROUPE_SCOLAIRE' && p.type !== 'TRIMESTRE_1' && p.type !== 'TRIMESTRE_2' && p.type !== 'TRIMESTRE_3')} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {schoolType === 'PRIMAIRE' && (
        <p className="text-xs text-text/40">Au primaire, les évaluations se font sur un jour unique (date début = date fin).</p>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!isValid || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

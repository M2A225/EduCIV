import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { schoolService } from '../../services/schools';
import { subjectService } from '../../services/subjects';
import { useSetup } from '../../hooks/useSetup';
import { CheckCircle2, Building2, Layers, GraduationCap } from 'lucide-react';

const GROUP_LABELS: Record<string, string> = {
  'CP1-CP2': 'CP1 – CP2',
  'CE1-CE2': 'CE1 – CE2',
  'CM1-CM2': 'CM1 – CM2',
};

export const StepSummary = () => {
  const { refresh } = useSetup();
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    schoolService.getMySchool().then(res => setSchool(res.data.data));
    schoolService.getLevels().then(res => setLevels(res.data.data));
    subjectService.getSubjects(1, 100).then(res => {
      const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []);
      setSubjects(list);
    });
  }, []);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await schoolService.completeSetup();
      setDone(true);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const groups = [...new Set(subjects.filter(s => s.level_group).map(s => s.level_group))];
  const isPrimary = school?.school_type === 'PRIMAIRE';

  if (done) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Configuration terminée !</h3>
        <p className="text-text/60">Vous allez être redirigé vers votre tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Récapitulatif de la configuration</h3>

      {school && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{school.name}</p>
              <p className="text-xs text-text/50">{school.city} — {school.school_type}</p>
            </div>
          </div>
        </Card>
      )}

      {levels.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{levels.length} niveau{levels.length > 1 ? 'x' : ''}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {levels.map(l => (
                  <span key={l.level} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{l.level}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isPrimary && groups.length > 0 ? (
        groups.map(group => {
          const gSubjects = subjects.filter(s => s.level_group === group);
          if (gSubjects.length === 0) return null;
          const total = gSubjects.reduce((sum: number, s: any) => sum + (s.max_score || 0), 0);
          return (
            <Card key={group} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{GROUP_LABELS[group] || group}</p>
                <span className="text-xs text-text/40">Total : {total}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {gSubjects.map((s: any) => (
                  <span key={s.id} className="px-2 py-0.5 bg-primary/5 text-text rounded text-xs">
                    {s.name} /{s.max_score}
                  </span>
                ))}
              </div>
            </Card>
          );
        })
      ) : (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Matières configurées</p>
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {subjects.map((s: any) => (
                    <span key={s.id} className="px-2 py-0.5 bg-primary/5 text-text rounded text-xs">
                      {s.name} (coeff {s.coefficient})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text/50">Aucune matière configurée.</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleComplete} disabled={saving} className="w-full sm:w-auto">
          {saving ? 'Finalisation...' : 'Terminer la configuration'}
        </Button>
      </div>
    </div>
  );
};

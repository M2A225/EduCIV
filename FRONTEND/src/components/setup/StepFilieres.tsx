import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { schoolService } from '../../services/schools';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { FILIERES_PAR_TYPE } from '../../lib/constants';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export const StepFilieres = ({ onComplete, onSkip }: Props) => {
  const { currentSchoolId } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    schoolService.getMySchool().then(res => {
      const schoolType = res.data.school_type || 'SECONDAIRE';
      if (schoolType === 'PRIMAIRE') {
        onSkip();
        return;
      }
      const filieres = (FILIERES_PAR_TYPE[schoolType]?.filieres || []);
      setSelected(filieres);
    });
  }, [currentSchoolId]);

  const toggle = (f: string) => {
    setSelected(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/schools/filieres', { filieres: selected });
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-text/60 text-sm">Sélectionnez les filières disponibles dans votre établissement (optionnel) :</p>
      <div className="flex flex-wrap gap-3">
        {selected.map(f => (
          <button key={f} type="button" onClick={() => toggle(f)}
            className="px-4 py-2 rounded-xl border-2 border-primary bg-primary/10 text-primary text-sm font-medium">
            ✓ {f}
          </button>
        ))}
      </div>
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onSkip}>Passer</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

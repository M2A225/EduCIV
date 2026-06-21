import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { schoolService } from '../../services/schools';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  onComplete: () => void;
}

export const StepLevels = ({ onComplete }: Props) => {
  const { currentSchoolId } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    schoolService.getDefaultLevels().then(res => setSuggestions(res.data));
    schoolService.getLevels().then(res => setSelected(res.data.map((l: { level: string }) => l.level)));
  }, [currentSchoolId]);

  const toggle = (level: string) => {
    setSelected(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
  };

  const addCustom = () => {
    if (custom && !selected.includes(custom)) {
      setSelected(prev => [...prev, custom]);
      setCustom('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolService.updateLevels(selected);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-text/60 text-sm">Sélectionnez les niveaux proposés par votre école :</p>
      <div className="flex flex-wrap gap-3">
        {suggestions.map(level => (
          <button key={level} type="button" onClick={() => toggle(level)}
            className={`px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
              selected.includes(level)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/40 text-text/60 hover:border-primary/30'
            }`}>
            {selected.includes(level) ? '✓ ' : ''}{level}
          </button>
        ))}
      </div>
      <div className="flex gap-3 items-end">
        <Input label="Ajouter un niveau personnalisé" value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()} />
        <Button variant="secondary" onClick={addCustom} disabled={!custom}>+</Button>
      </div>
      {selected.length > 0 && (
        <div>
          <p className="text-sm font-medium text-text/80 mb-2">Niveaux sélectionnés ({selected.length}) :</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(level => (
              <span key={level} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm">
                {level}
                <button type="button" onClick={() => toggle(level)} className="hover:text-red-500 ml-1">&times;</button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={selected.length === 0 || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

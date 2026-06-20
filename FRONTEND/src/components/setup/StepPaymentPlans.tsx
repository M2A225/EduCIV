import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { paymentPlanService } from '../../services/payment-plans';
import { schoolService } from '../../services/schools';

interface PlanRow {
  name: string;
  total_amount: number;
}

interface Props {
  onComplete: () => void;
}

export const StepPaymentPlans = ({ onComplete }: Props) => {
  const [plans, setPlans] = useState<PlanRow[]>([{ name: 'Scolarité', total_amount: 0 }]);
  const [levels, setLevels] = useState<string[]>([]);
  const [tuitions, setTuitions] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    schoolService.getLevels().then(res => {
      const lvls = res.data.data.map(l => l.level);
      setLevels(lvls);
      const initial: Record<string, number> = {};
      lvls.forEach(l => { initial[l] = 0; });
      setTuitions(initial);
    });
  }, []);

  const updatePlan = (index: number, field: keyof PlanRow, value: string | number) => {
    setPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPlan = () => setPlans(prev => [...prev, { name: '', total_amount: 0 }]);
  const removePlan = (index: number) => setPlans(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    try {
      const validPlans = plans.filter(p => p.name);
      if (validPlans.length > 0) {
        await paymentPlanService.bulkCreate(validPlans);
      }
      const tuitionList = Object.entries(tuitions).filter(([_, amount]) => amount > 0).map(([level, amount]) => ({ level, amount }));
      if (tuitionList.length > 0) {
        await schoolService.upsertLevelTuitions(tuitionList);
      }
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const isValid = plans.some(p => p.name);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Plans de paiement</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text/60 border-b border-border/20">
            <th className="pb-2 font-medium">Nom du plan</th>
            <th className="pb-2 font-medium w-40">Montant total (FCFA)</th>
            <th className="pb-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p, i) => (
            <tr key={i} className="border-b border-border/10">
              <td className="py-2">
                <Input value={p.name} onChange={e => updatePlan(i, 'name', e.target.value)} placeholder="Ex: Scolarité" />
              </td>
              <td className="py-2 px-2">
                <Input type="number" min={0} value={p.total_amount} onChange={e => updatePlan(i, 'total_amount', Number(e.target.value))} />
              </td>
              <td className="py-2">
                {plans.length > 1 && (
                  <button type="button" onClick={() => removePlan(i)} className="text-red-400 hover:text-red-600">&times;</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="secondary" onClick={addPlan}>+ Ajouter un plan</Button>

      {levels.length > 0 && (
        <>
          <h3 className="text-lg font-bold pt-4">Scolarité par niveau</h3>
          <Card className="p-4 space-y-3">
            {levels.map(level => (
              <div key={level} className="flex items-center gap-4">
                <span className="w-16 font-medium text-sm">{level}</span>
                <Input type="number" min={0} value={tuitions[level] || 0}
                  onChange={e => setTuitions(prev => ({ ...prev, [level]: Number(e.target.value) }))} />
                <span className="text-xs text-text/40 w-16">FCFA/an</span>
              </div>
            ))}
          </Card>
        </>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={!isValid || saving}>
          {saving ? 'Enregistrement...' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
};

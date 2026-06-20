import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { schoolService } from '../../services/schools';
import { paymentPlanService } from '../../services/payment-plans';
import { useSetup } from '../../hooks/useSetup';
import { CheckCircle2, CreditCard, DollarSign } from 'lucide-react';

export const StepFinanceSummary = () => {
  const { refresh } = useSetup();
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [tuitions, setTuitions] = useState<any[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    paymentPlanService.getPlans().then(res => setPlans(Array.isArray(res.data.data) ? res.data.data : []));
    schoolService.getLevelTuitions().then(res => setTuitions(res.data.data));
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

  if (done) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold">Configuration financière terminée !</h3>
        <p className="text-text/60">Vous allez être redirigé vers votre tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold">Récapitulatif financier</h3>

      {plans.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <p className="font-medium">{plans.length} plan{plans.length > 1 ? 's' : ''} de paiement</p>
          </div>
          <ul className="space-y-1 ml-8">
            {plans.map((p: any, i: number) => (
              <li key={i} className="text-sm text-text/70">{p.name} — {p.total_amount?.toLocaleString()} FCFA</li>
            ))}
          </ul>
        </Card>
      )}

      {tuitions.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <p className="font-medium">Scolarité par niveau</p>
          </div>
          <div className="ml-8 grid grid-cols-2 gap-2">
            {tuitions.map((t: any) => (
              <div key={t.level} className="flex justify-between text-sm text-text/70">
                <span>{t.level}</span>
                <span className="font-medium">{t.amount?.toLocaleString()} FCFA</span>
              </div>
            ))}
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

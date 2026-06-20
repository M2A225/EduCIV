import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSetup } from '../../hooks/useSetup';
import { StepPaymentPlans } from '../../components/setup/StepPaymentPlans';
import { StepFinanceSummary } from '../../components/setup/StepFinanceSummary';
import { Card } from '../../components/ui/Card';
import { CreditCard, CheckSquare } from 'lucide-react';

const STEPS = [
  { id: 'payment-plans', label: 'Plans de paiement', icon: CreditCard },
  { id: 'summary', label: 'Résumé', icon: CheckSquare },
];

export const SetupWizardAccountant = () => {
  const { activeRole } = useAuth();
  const { setupStatus, loading } = useSetup();
  const [step, setStep] = useState(0);

  if (loading) return null;
  if (activeRole !== 'ACCOUNTANT') return <Navigate to="/" replace />;
  if (setupStatus?.accountant_completed) return <Navigate to="/" replace />;
  if (!setupStatus?.director_completed) return <Navigate to="/setup/waiting" replace />;

  const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length - 1));

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold">Configuration financière</h1>
          <p className="text-text/60 mt-1">Configurez les plans de paiement et la scolarité</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-primary text-white shadow-lg' :
                  isDone ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text/40'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="p-6 sm:p-8">
          {step === 0 && <StepPaymentPlans onComplete={handleNext} />}
          {step === 1 && <StepFinanceSummary />}
        </Card>
      </div>
    </div>
  );
};

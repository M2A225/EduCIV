import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSetup } from '../../hooks/useSetup';
import { StepSchoolInfo } from '../../components/setup/StepSchoolInfo';
import { StepLevels } from '../../components/setup/StepLevels';
import { StepFilieres } from '../../components/setup/StepFilieres';
import { StepSubjects } from '../../components/setup/StepSubjects';
import { StepPrimarySubjects } from '../../components/setup/StepPrimarySubjects';
import { StepSchoolYear } from '../../components/setup/StepSchoolYear';
import { StepSummary } from '../../components/setup/StepSummary';
import { Card } from '../../components/ui/Card';
import { schoolService } from '../../services/schools';
import { Building2, Layers, BookOpen, GraduationCap, Calendar, CheckSquare } from 'lucide-react';

const STEPS = [
  { id: 'school', label: 'École', icon: Building2 },
  { id: 'levels', label: 'Niveaux', icon: Layers },
  { id: 'filieres', label: 'Filières', icon: BookOpen },
  { id: 'subjects', label: 'Matières', icon: GraduationCap },
  { id: 'school-year', label: 'Année scolaire', icon: Calendar },
  { id: 'summary', label: 'Résumé', icon: CheckSquare },
];

export const SetupWizardDirector = () => {
  const { activeRole } = useAuth();
  const { setupStatus, loading } = useSetup();
  const [step, setStep] = useState(0);
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    schoolService.getMySchool().then(r => {
      setIsPrimary(r.data.data.school_type === 'PRIMAIRE');
    }).catch(() => {});
  }, []);

  if (loading) return null;
  if (activeRole !== 'DIRECTOR') return <Navigate to="/" replace />;
  if (setupStatus?.director_completed) return <Navigate to="/" replace />;

  const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length - 1));

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold">Assistant de configuration</h1>
          <p className="text-text/60 mt-1">Configurez votre établissement scolaire</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
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
          {step === 0 && <StepSchoolInfo onComplete={handleNext} />}
          {step === 1 && <StepLevels onComplete={handleNext} />}
          {step === 2 && <StepFilieres onComplete={handleNext} onSkip={handleNext} />}
          {step === 3 && (isPrimary ? (
            <StepPrimarySubjects onComplete={handleNext} />
          ) : (
            <StepSubjects onComplete={handleNext} />
          ))}
          {step === 4 && <StepSchoolYear onComplete={handleNext} />}
          {step === 5 && <StepSummary />}
        </Card>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Feedback } from '../components/ui/Feedback';
import { Logo } from '../components/ui/Logo';
import { Eye, EyeOff } from 'lucide-react';

interface InvitationData {
  valid: boolean;
  target_type: 'PARENT' | 'TEACHER';
  target_ids: string;
  school_id: number;
  has_account: boolean;
}

const registerSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.email || data.phone, {
  message: 'Email ou téléphone requis',
  path: ['email'],
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [, setInvitationData] = useState<InvitationData | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', phone: '' },
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      api.get<{ success: boolean; data: InvitationData }>('/auth/verify-invitation', {
        params: { code },
      }),
    onSuccess: (response) => {
      const data = response.data.data;
      if (!data.valid) {
        setVerifyError('Code invalide');
        return;
      }
      if (data.has_account) {
        setVerifyError('Vous avez déjà un compte');
        return;
      }
      setInvitationData(data);
      setStep(2);
    },
    onError: () => {
      setVerifyError('Erreur lors de la vérification du code');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (formData: RegisterFormValues) =>
      api.post<{ success: boolean; data: { accessToken: string } }>(
        '/auth/register-with-invitation',
        {
          code,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          password: formData.password,
        },
      ),
    onSuccess: (response) => {
      const { accessToken } = response.data.data;
      login(accessToken);
      navigate('/');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error || 'Erreur lors de la création du compte';
      toast.error(message);
    },
  });

  const handleVerify = () => {
    if (!code.trim()) {
      setVerifyError('Veuillez entrer un code d\'invitation');
      return;
    }
    setVerifyError(null);
    verifyMutation.mutate(code.trim());
  };

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  const handleBack = () => {
    setStep(1);
    setVerifyError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans selection:bg-primary/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cta to-primary-light"></div>

      <Card className="w-full max-w-md shadow-2xl shadow-primary/10 border border-primary/5 animate-in fade-in zoom-in duration-500">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Logo className="text-primary w-10 h-10" />
          </div>
          <CardTitle className="text-3xl tracking-tight text-text">EduCIV</CardTitle>
          <p className="text-text/60 text-sm mt-2">Créez votre compte</p>
        </CardHeader>

        <CardContent className="pt-6">
          {step === 1 && (
            <>
              {verifyError && verifyError !== 'Vous avez déjà un compte' && (
                <Feedback type="error" message={verifyError} />
              )}
              {verifyError === 'Vous avez déjà un compte' ? (
                <div className="space-y-4">
                  <Feedback type="warning" message="Vous avez déjà un compte" />
                  <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                    Se connecter
                  </Button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-6">
                  <Input
                    label="Code d'invitation"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); if (verifyError) setVerifyError(null); }}
                    placeholder="EDU-20250524-XXXXXX"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={verifyMutation.isPending}
                    className="w-full text-lg"
                  >
                    Vérifier
                  </Button>
                </form>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <p className="text-text/80">
                  Bienvenue ! Vous allez être lié(e) à votre école
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Nom"
                  {...register('name')}
                  placeholder="Votre nom complet"
                  error={errors.name?.message}
                />

                <div>
                  <Input
                    label="Email"
                    {...register('email')}
                    placeholder="email@exemple.com"
                    error={errors.email?.message}
                  />
                  <p className="mt-1 text-xs text-text/40 px-1">
                    Email ou Téléphone
                  </p>
                </div>

                <div>
                  <Input
                    label="Téléphone"
                    {...register('phone')}
                    placeholder="0102030405"
                    error={errors.phone?.message}
                  />
                  <p className="mt-1 text-xs text-text/40 px-1">
                    Téléphone ou Email
                  </p>
                </div>

                <div className="relative">
                  <Input
                    label="Mot de passe"
                    {...register('password')}
                    placeholder="••••••••"
                    error={errors.password?.message}
                    type={showPassword ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-[38px] text-text/40 hover:text-text/70 transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirmer le mot de passe"
                    {...register('confirmPassword')}
                    placeholder="••••••••"
                    error={errors.confirmPassword?.message}
                    type={showConfirmPassword ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    className="absolute right-3 top-[38px] text-text/40 hover:text-text/70 transition-colors"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={registerMutation.isPending}
                  className="w-full text-lg"
                >
                  Créer mon compte
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Retour
                </button>
              </div>
            </>
          )}

          <div className="mt-8 pt-8 border-t border-primary/5 text-center">
            <p className="text-xs text-text/40">
              &copy; 2026 EduCIV. Tous droits réservés.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

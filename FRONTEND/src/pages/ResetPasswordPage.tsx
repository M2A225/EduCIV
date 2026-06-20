import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Feedback } from '../components/ui/Feedback';
import { Logo } from '../components/ui/Logo';
import { Eye, EyeOff } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirmPassword: z.string().min(6, 'Minimum 6 caractères'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetFormValues) => authService.resetPassword(token!, data.password),
    onSuccess: () => {
      navigate('/login', { state: { resetSuccess: true } });
    },
    onError: (err: Error) => {
      setError(err.message || 'Une erreur est survenue');
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    setError(null);
    resetMutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans selection:bg-primary/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cta to-primary-light"></div>
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10 border border-primary/5 animate-in fade-in zoom-in duration-500">
          <CardHeader className="flex flex-col items-center pb-2">
            <CardTitle className="text-2xl tracking-tight text-text">Lien invalide</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-text/70">Ce lien de réinitialisation est invalide ou a expiré.</p>
            <Button variant="primary" onClick={() => navigate('/forgot-password')} className="w-full">
              Demander un nouveau lien
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans selection:bg-primary/20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cta to-primary-light"></div>
      
      <Card className="w-full max-w-md shadow-2xl shadow-primary/10 border border-primary/5 animate-in fade-in zoom-in duration-500">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Logo className="text-primary w-10 h-10" />
          </div>
          <CardTitle className="text-2xl tracking-tight text-text">Nouveau mot de passe</CardTitle>
          <p className="text-text/60 text-sm mt-2">Choisissez un nouveau mot de passe</p>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && <Feedback type="error" message={error} />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <Input
                label="Nouveau mot de passe"
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

            <Button type="submit" variant="primary" isLoading={resetMutation.isPending} className="w-full text-lg">
              Réinitialiser le mot de passe
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:text-primary-light transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

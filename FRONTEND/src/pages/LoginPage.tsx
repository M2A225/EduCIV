import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import type { LoginDto } from '../types';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou téléphone requis'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRedirects: Record<string, string> = {
  DIRECTOR: '/',
  BACKOFFICE: '/backoffice',
  TEACHER: '/teacher',
  PARENT: '/parent',
  ACCOUNTANT: '/accountant',
  CASHIER: '/cashier',
  EDUCATOR: '/educator',
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      login(accessToken, user);
      const roles = user?.roles || [user?.role];
      const targetRole = roles[0];
      navigate(roleRedirects[targetRole] || '/');
    },
    onError: (err: Error) => {
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    loginMutation.mutate(data as LoginDto);
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-cta/5">
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 -right-20 w-80 h-80 bg-cta/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Logo className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-text">EduCIV</h1>
              <p className="text-sm text-text-secondary">Gestion scolaire intelligente</p>
            </div>
          </div>

          <blockquote className="space-y-4">
            <p className="text-2xl font-heading font-semibold text-text leading-snug">
              "La plateforme qui simplifie la gestion de votre établissement scolaire."
            </p>
            <footer className="text-text-muted text-sm">
              — Équipe EduCIV
            </footer>
          </blockquote>

          <div className="mt-auto grid grid-cols-3 gap-6">
            {[
              { value: '10k+', label: 'Utilisateurs' },
              { value: '500+', label: 'Écoles' },
              { value: '99.9%', label: 'Disponibilité' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Logo className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-heading font-bold text-text">EduCIV</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-text">Bienvenue</h1>
            <p className="text-text-secondary text-sm">Connectez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-error-bg border border-error/20 text-sm text-error animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email ou téléphone"
              {...register('identifier')}
              placeholder="email@exemple.com"
              error={errors.identifier?.message}
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                {...register('password')}
                placeholder="Entrez votre mot de passe"
                error={errors.password?.message}
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-[34px] text-text-muted hover:text-text transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-hover transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" variant="primary" isLoading={loginMutation.isPending} className="w-full h-12 text-base">
              Se connecter
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center pt-4 border-t border-border">
            &copy; {new Date().getFullYear()} EduCIV. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

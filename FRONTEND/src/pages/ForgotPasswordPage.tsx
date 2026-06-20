import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Feedback } from '../components/ui/Feedback';
import { Logo } from '../components/ui/Logo';

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const forgotMutation = useMutation({
    mutationFn: (data: ForgotFormValues) => authService.forgotPassword(data.email),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: Error) => {
      setError(err.message || 'Une erreur est survenue');
    },
  });

  const onSubmit = (data: ForgotFormValues) => {
    setError(null);
    forgotMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-4 font-sans selection:bg-primary/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-cta to-primary-light"></div>
        <Card className="w-full max-w-md shadow-2xl shadow-primary/10 border border-primary/5 animate-in fade-in zoom-in duration-500">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Logo className="text-primary w-10 h-10" />
            </div>
            <CardTitle className="text-2xl tracking-tight text-text">Email envoyé</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-text/70">
              Si un compte existe avec cet email, vous recevrez un lien de réinitialisation sous quelques minutes.
            </p>
            <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
              Retour à la connexion
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
          <CardTitle className="text-2xl tracking-tight text-text">Mot de passe oublié</CardTitle>
          <p className="text-text/60 text-sm mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && <Feedback type="error" message={error} />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              {...register('email')}
              placeholder="email@exemple.com"
              error={errors.email?.message}
            />

            <Button type="submit" variant="primary" isLoading={forgotMutation.isPending} className="w-full text-lg">
              Envoyer le lien
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

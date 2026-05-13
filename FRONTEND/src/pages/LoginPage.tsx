import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/auth/login', data);
      login(response.data.data.accessToken);
      navigate('/');
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Connexion EduCIV</h2>
        
        <Input 
          label="Email"
          {...register('email')} 
          error={errors.email?.message} 
          type="email" 
          className="mb-4"
        />

        <Input 
          label="Mot de passe"
          {...register('password')} 
          error={errors.password?.message} 
          type="password" 
          className="mb-6"
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Se connecter
        </Button>
      </form>
    </div>
  );
};

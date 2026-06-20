import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '../services/users';
import { extractData } from '../lib/utils';
import type { User, CreateUserDto } from '../types';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers().then(res => extractData<User[]>(res)),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUser(id).then(res => {
      const body = res.data as Record<string, unknown>;
      return (body?.data ?? body) as User;
    }),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      toast.success('Utilisateur créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserDto> }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      toast.success('Utilisateur modifié avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success('Utilisateur supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: Error) => toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || err.message || 'Erreur'),
  });
};

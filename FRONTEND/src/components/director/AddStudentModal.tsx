import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const studentSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court'),
  class_id: z.string().transform(val => parseInt(val)).optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
  onClose: () => void;
}

export const AddStudentModal = ({ onClose }: AddStudentModalProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema)
  });

  const mutation = useMutation({
    mutationFn: (data: StudentForm) => api.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Ajouter un élève</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input {...register('name')} placeholder="Nom complet" error={errors.name?.message} />
          <Input {...register('class_id')} placeholder="ID Classe" error={errors.class_id?.message} />
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} type="button">Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ajout...' : 'Ajouter'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

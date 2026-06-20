import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { classService } from '../../services/classes';
import { extractData } from '../../lib/utils';
import type { Class } from '../../types';

const studentSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court'),
  matricule: z.string().optional(),
  dob: z.string().optional(),
  place_birth: z.string().optional(),
  sexe: z.enum(['M', 'F']).optional(),
  nationality: z.string().optional(),
  is_repeater: z.string().optional(),
  regime: z.enum(['INTERNE', 'EXTERNE', 'DEMI_PENSION']).optional(),
  is_internal: z.string().optional(),
  class_id: z.coerce.number().optional(),
});

type StudentForm = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
  onClose: () => void;
}

export const AddStudentModal = ({ onClose }: AddStudentModalProps) => {
  const queryClient = useQueryClient();
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classService.getClasses().then(r => extractData<Class[]>(r)),
  });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema) as any
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    }
  });

  const onSubmit = (d: StudentForm) => {
    mutation.mutate({
      ...d,
      is_repeater: d.is_repeater === 'true',
      is_internal: d.is_internal === 'true',
    });
  };

  return (
    <div className="fixed inset-0 bg-text/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-heading font-bold mb-6 text-text">Ajouter un élève</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('name')} label="Nom complet" error={errors.name?.message} />
            <Input {...register('matricule')} label="Matricule" error={errors.matricule?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input {...register('dob')} type="date" label="Date de naissance" error={errors.dob?.message} />
            <Input {...register('place_birth')} label="Lieu de naissance" error={errors.place_birth?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register('sexe')}
              label="Sexe"
              options={[
                { value: 'M', label: 'Masculin' },
                { value: 'F', label: 'Féminin' },
              ]}
              placeholder="Sélectionner..."
              error={errors.sexe?.message}
            />
            <Input {...register('nationality')} label="Nationalité" error={errors.nationality?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register('regime')}
              label="Régime"
              options={[
                { value: 'INTERNE', label: 'Interne' },
                { value: 'EXTERNE', label: 'Externe' },
                { value: 'DEMI_PENSION', label: 'Demi-pension' },
              ]}
              placeholder="Sélectionner..."
              error={errors.regime?.message}
            />
            <Select
              {...register('is_repeater')}
              label="Redoublant"
              options={[
                { value: 'true', label: 'Oui' },
                { value: 'false', label: 'Non' },
              ]}
              placeholder="Sélectionner..."
              error={errors.is_repeater?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register('is_internal')}
              label="Interne"
              options={[
                { value: 'true', label: 'Oui' },
                { value: 'false', label: 'Non' },
              ]}
              placeholder="Sélectionner..."
              error={errors.is_internal?.message}
            />
            <Select
              {...register('class_id')}
              label="Classe"
              options={(classes || []).map((c: any) => ({ value: String(c.id), label: c.name }))}
              placeholder="Sélectionner..."
              error={errors.class_id?.message}
            />
          </div>
          <div className="flex gap-4 justify-end mt-6">
            <Button variant="outline" onClick={onClose} type="button">Annuler</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Ajouter</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

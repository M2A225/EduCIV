import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { api } from '../../services/api';
import { useCreateSchool, useUpdateSchool } from '../../hooks/useSchools';
import type { School, SchoolGroup, ApiResponse } from '../../types';

interface SchoolFormModalProps {
  onClose: () => void;
  school?: School | null;
}

export const SchoolFormModal = ({ onClose, school }: SchoolFormModalProps) => {
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const isEditing = !!school;

  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', city: '', type: '',
    school_type: '', school_group_id: null as number | null,
  });
  const [groups, setGroups] = useState<SchoolGroup[]>([]);

  useEffect(() => {
    api.get('/school-groups').then(r => {
      const data = (r.data as ApiResponse<SchoolGroup[]>)?.data ?? r.data;
      setGroups(data ?? []);
    });
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (school) {
      setForm({
        name: school.name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        city: school.city || '',
        type: school.type || '',
        school_type: school.school_type || '',
        school_group_id: school.school_group_id ?? null,
      });
    }
  }, [school]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      if (isEditing && school) {
        await updateSchool.mutateAsync({ id: school.id, data: form });
      } else {
        await createSchool.mutateAsync(form);
      }
      onClose();
    } catch { toast.error('Impossible d\'enregistrer l\'école'); }
  };

  const isPending = createSchool.isPending || updateSchool.isPending;

  return (
    <div className="fixed inset-0 bg-text/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg p-8 shadow-2xl">
        <h2 className="text-2xl font-heading font-bold mb-6 text-text">
          {isEditing ? "Modifier l'école" : 'Nouvelle École'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom de l'école *" value={form.name} onChange={handleChange('name')} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Téléphone" value={form.phone} onChange={handleChange('phone')} />
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresse" value={form.address} onChange={handleChange('address')} />
            <Input label="Ville" value={form.city} onChange={handleChange('city')} />
          </div>
          <Select
            label="Type d'établissement"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner...' },
              { value: 'PUBLIC', label: 'Public' },
              { value: 'PRIVE', label: 'Privé' },
              { value: 'CONFESSIONNEL', label: 'Confessionnel' },
              { value: 'LAIC', label: 'Laïc' },
            ]}
          />
          <Select
            label="Type d'école"
            value={form.school_type}
            onChange={(e) => setForm(f => ({ ...f, school_type: e.target.value }))}
            options={[
              { value: '', label: 'Sélectionner...' },
              { value: 'PRIMAIRE', label: 'Primaire' },
              { value: 'SECONDAIRE', label: 'Secondaire (Collège + Lycée général)' },
              { value: 'LYCEE_TECHNIQUE', label: 'Lycée Technique' },
              { value: 'LYCEE_PROFESSIONNEL', label: 'Lycée Professionnel' },
              { value: 'GROUPE_SCOLAIRE', label: 'Groupe scolaire' },
            ]}
          />
          <Select
            label="Groupe scolaire"
            value={form.school_group_id ?? ''}
            onChange={(e) => setForm(f => ({ ...f, school_group_id: e.target.value ? Number(e.target.value) : null }))}
            options={[
              { value: '', label: 'Aucun groupe' },
              ...groups.map(g => ({ value: String(g.id), label: g.name })),
            ]}
          />
          {!isEditing && (
            <p className="text-xs text-text/40">Le School ID (identifiant unique) est généré automatiquement.</p>
          )}
          <div className="flex gap-4 justify-end mt-6">
            <Button variant="outline" onClick={onClose} type="button">Annuler</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

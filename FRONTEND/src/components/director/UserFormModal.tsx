import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { useSchools } from '../../hooks/useSchools';
import type { User, CreateUserDto } from '../../types';

interface UserFormModalProps {
  onClose: () => void;
  user?: User | null;
}

const ROLES = [
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'TEACHER', label: 'Professeur' },
  { value: 'ACCOUNTANT', label: 'Comptable' },
  { value: 'CASHIER', label: 'Caissier' },
  { value: 'EDUCATOR', label: 'Éducateur' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'BACKOFFICE', label: 'Super Admin' },
];

export const UserFormModal = ({ onClose, user }: UserFormModalProps) => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { currentSchoolId, user: authUser } = useAuth();
  const { data: schools } = useSchools();
  const isEditing = !!user;
  const isBackoffice = authUser?.role === 'BACKOFFICE';
  const [showPassword, setShowPassword] = useState(false);

  const defaultSchoolId = String(currentSchoolId || '');

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', role: 'TEACHER', school_id: defaultSchoolId,
  });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
    if (user) {
      setForm({
        email: user.email || '',
        password: '',
        name: user.name || '',
        phone: user.phone || '',
        role: user.role || 'TEACHER',
        school_id: String(user.school_id ?? currentSchoolId ?? ''),
      });
    } else if (!isEditing && !isBackoffice) {
      setForm(f => ({ ...f, school_id: defaultSchoolId }));
    }
  }, [user, currentSchoolId, isEditing, isBackoffice]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || (!isEditing && !form.password)) return;

    const userData: Partial<CreateUserDto> = {
      email: form.email,
      name: form.name || undefined,
      phone: form.phone || undefined,
      role: form.role as CreateUserDto['role'],
    };
    if (form.school_id) userData.school_id = Number(form.school_id);
    if (form.password) userData.password = form.password;

    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({ id: user.id, data: userData as Partial<CreateUserDto> });
      } else {
        await createUser.mutateAsync(userData as CreateUserDto);
      }
      onClose();
    } catch { toast.error('Impossible d\'enregistrer l\'utilisateur'); }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <div className="fixed inset-0 bg-text/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg p-8 shadow-2xl">
        <h2 className="text-2xl font-heading font-bold mb-6 text-text">
          {isEditing ? "Modifier l'utilisateur" : 'Nouvel Utilisateur'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email *" type="email" value={form.email} onChange={handleChange('email')} required />

          <div>
            <label className="block text-sm font-heading font-semibold text-text mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 outline-none pr-10"
                placeholder={isEditing ? 'Laisser vide pour conserver' : 'Minimum 6 caractères'}
                required={!isEditing}
              />
              <button type="button" onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text/70"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Input label="Nom" value={form.name} onChange={handleChange('name')} />
          <Input label="Téléphone" value={form.phone} onChange={handleChange('phone')} />

          <div>
            <label className="block text-sm font-heading font-semibold text-text mb-1.5">Rôle</label>
            <select value={form.role} onChange={handleChange('role')}
              className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 outline-none">
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {isBackoffice ? (
            <div>
              <label className="block text-sm font-heading font-semibold text-text mb-1.5">École</label>
              <select value={form.school_id} onChange={handleChange('school_id')}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 outline-none">
                <option value="">Sélectionner une école...</option>
                {Array.isArray(schools) && schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-text/60">
                École #{form.school_id || currentSchoolId || '—'}
              </span>
            </div>
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
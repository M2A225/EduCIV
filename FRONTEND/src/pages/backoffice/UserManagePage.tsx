import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { extractData } from '../../lib/utils';
import { ArrowLeft, Pencil, X, Save } from 'lucide-react';
import type { User } from '../../types';

export const BackofficeUserManage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then(res => extractData<User>(res)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => api.patch(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setEditing(false);
    },
  });

  const startEditing = useCallback(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone, role: user.role });
      setEditing(true);
    }
  }, [user]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setForm({});
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    updateMutation.mutate(payload);
  }, [form, updateMutation]);

  if (isLoading) return <LoadingState type="card" count={1} />;

  const roles = ['DIRECTOR', 'TEACHER', 'ACCOUNTANT', 'CASHIER', 'EDUCATOR', 'PARENT', 'BACKOFFICE', 'STUDENT'];

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title={user ? `Utilisateur #${user.id}` : 'Chargement...'}
        actions={
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="glass" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button variant="primary" onClick={handleSave} isLoading={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </Button>
              </>
            ) : (
              <Button variant="glass" onClick={startEditing}>
                <Pencil className="w-4 h-4 mr-1" /> Modifier
              </Button>
            )}
            <Button variant="glass" asChild>
              <Link to="/backoffice/users"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
            </Button>
          </div>
        }
      />
      <Card>
        <CardContent className="p-6 space-y-4">
          {user ? (
            <dl className="grid grid-cols-2 gap-4">
              {editing ? (
                <>
                  <div>
                    <dt className="text-sm text-text/50">Nom</dt>
                    <dd><Input value={form.name || ''} onChange={e => handleChange('name', e.target.value)} /></dd>
                  </div>
                  <div>
                    <dt className="text-sm text-text/50">Email</dt>
                    <dd><Input value={form.email || ''} onChange={e => handleChange('email', e.target.value)} /></dd>
                  </div>
                  <div>
                    <dt className="text-sm text-text/50">Téléphone</dt>
                    <dd><Input value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} /></dd>
                  </div>
                  <div>
                    <dt className="text-sm text-text/50">Rôle</dt>
                    <dd>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-white/50 text-sm outline-none" value={form.role || ''} onChange={e => handleChange('role', e.target.value)}>
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-text/50">Nouveau mot de passe</dt>
                    <dd><Input type="password" value={form.password || ''} onChange={e => handleChange('password', e.target.value)} placeholder="Laisser vide pour conserver" /></dd>
                  </div>
                </>
              ) : (
                <>
                  <div><dt className="text-sm text-text/50">Nom</dt><dd className="font-medium">{user.name || '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Email</dt><dd className="font-medium">{user.email || '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Rôle</dt><dd className="font-medium">{user.role || '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Téléphone</dt><dd className="font-medium">{user.phone || '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">École</dt><dd className="font-medium">{user.school_id ? `#${user.school_id}` : '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Avatar</dt><dd className="font-medium">{user.avatar_url ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Créé le</dt><dd className="font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}</dd></div>
                  <div><dt className="text-sm text-text/50">Mis à jour</dt><dd className="font-medium">{user.updated_at ? new Date(user.updated_at).toLocaleDateString('fr-FR') : '-'}</dd></div>
                </>
              )}
            </dl>
          ) : (
            <p className="text-text/60">Utilisateur introuvable</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

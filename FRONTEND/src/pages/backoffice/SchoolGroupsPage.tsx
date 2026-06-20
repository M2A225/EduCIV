import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { Plus, Pencil, Trash2, Building2, X, UserPlus } from 'lucide-react';
import type { SchoolGroup } from '../../types';

export const BackofficeSchoolGroups = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', abbreviation: '', city: '' });
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [addSchoolGroupId, setAddSchoolGroupId] = useState<number | null>(null);

  const { data: groups, isLoading, error, refetch } = useQuery({
    queryKey: ['school-groups'],
    queryFn: () => api.get('/school-groups').then(r => (r.data as any)?.data ?? r.data),
  });

  const { data: availableSchools } = useQuery({
    queryKey: ['available-schools'],
    queryFn: () => api.get('/school-groups/available-schools/all').then(r => (r.data as any)?.data ?? r.data),
  });

  const createMutation = useMutation({
    mutationFn: (dto: typeof form) => api.post('/school-groups', dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-groups'] }); toast.success('Groupe créé'); setShowForm(false); resetForm(); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: typeof form }) => api.patch(`/school-groups/${id}`, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-groups'] }); toast.success('Groupe modifié'); setShowForm(false); resetForm(); },
    onError: () => toast.error('Erreur lors de la modification'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/school-groups/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['school-groups'] }); toast.success('Groupe supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const addSchoolMutation = useMutation({
    mutationFn: ({ groupId, schoolId }: { groupId: number; schoolId: number }) =>
      api.post(`/school-groups/${groupId}/schools`, { schoolId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-groups'] });
      queryClient.invalidateQueries({ queryKey: ['available-schools'] });
      toast.success('École ajoutée au groupe');
      setAddSchoolGroupId(null);
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  });

  const removeSchoolMutation = useMutation({
    mutationFn: ({ groupId, schoolId }: { groupId: number; schoolId: number }) =>
      api.delete(`/school-groups/${groupId}/schools/${schoolId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-groups'] });
      queryClient.invalidateQueries({ queryKey: ['available-schools'] });
      toast.success('École retirée du groupe');
    },
    onError: () => toast.error('Erreur lors du retrait'),
  });

  const resetForm = () => { setForm({ name: '', abbreviation: '', city: '' }); setEditingId(null); };

  const handleEdit = (g: SchoolGroup) => {
    setForm({ name: g.name, abbreviation: g.abbreviation || '', city: g.city || '' });
    setEditingId(g.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    if (editingId) updateMutation.mutate({ id: editingId, dto: form });
    else createMutation.mutate(form);
  };

  if (isLoading) return <LoadingState type="list" count={5} />;
  if (error) return <Feedback type="error" message="Erreur de chargement" onRetry={refetch} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Groupes scolaires"
        actions={
          <Button onClick={() => { resetForm(); setShowForm(prev => !prev); }}>
            {showForm ? 'Annuler' : <><Plus className="w-4 h-4 mr-1" /> Nouveau groupe</>}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? 'Modifier' : 'Nouveau'} groupe scolaire</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
              <Input label="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Abréviation" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} />
              <Input label="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Button type="submit" variant="primary" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Modifier' : 'Créer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(groups || []).map((group: SchoolGroup) => {
          const isExpanded = expandedGroup === group.id;
          const isAdding = addSchoolGroupId === group.id;
          const unassigned = (availableSchools || []).filter(
            (s: any) => !group.schools?.some((gs: any) => gs.id === s.id)
          );

          return (
            <Card key={group.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <h3 className="font-bold text-text text-lg">{group.name}</h3>
                      {group.abbreviation && <p className="text-sm text-text/60">{group.abbreviation}</p>}
                      {group.city && <p className="text-sm text-text/40">{group.city}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="glass" className="p-1.5" aria-label="Modifier" onClick={() => handleEdit(group)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="outline" className="p-1.5 border-red-200 text-red-600" aria-label="Supprimer" isLoading={deleteMutation.isPending} onClick={() => { if (confirm('Supprimer ce groupe ?')) deleteMutation.mutate(group.id); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    {group.schools?.length || 0} école(s)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddSchoolGroupId(isAdding ? null : group.id)}
                  >
                    <UserPlus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>

                {isAdding && (
                  <div className="mb-3 flex gap-2">
                    <Select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addSchoolMutation.mutate({ groupId: group.id, schoolId: Number(e.target.value) });
                        }
                      }}
                      options={[
                        { value: '', label: 'Choisir une école...' },
                        ...unassigned.map((s: any) => ({ value: String(s.id), label: `${s.name}${s.city ? ` (${s.city})` : ''}` })),
                      ]}
                      className="flex-1"
                    />
                    <Button variant="glass" size="sm" aria-label="Fermer" onClick={() => setAddSchoolGroupId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {isExpanded && (
                  <div className="space-y-1">
                    {group.schools && group.schools.length > 0 ? (
                      group.schools.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-bg rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text">{s.name}</span>
                            {s.school_type && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-primary/5 text-primary rounded">{s.school_type}</span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Retirer "${s.name}" du groupe ?`)) {
                                removeSchoolMutation.mutate({ groupId: group.id, schoolId: s.id });
                              }
                            }}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                            aria-label={`Retirer ${s.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-text/40 px-3 py-2">Aucune école dans ce groupe</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(!groups || groups.length === 0) && (
          <div className="col-span-2 text-center py-12 text-text/60">Aucun groupe scolaire</div>
        )}
      </div>
    </div>
  );
};

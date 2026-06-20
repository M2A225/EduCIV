import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, Building2, X, MapPin } from 'lucide-react';
import type { City } from '../../types';

export const CitiesManagementPage = () => {
  const queryClient = useQueryClient();
  const [expandedCity, setExpandedCity] = useState<number | null>(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [cityName, setCityName] = useState('');
  const [showCommuneForm, setShowCommuneForm] = useState(false);
  const [communeName, setCommuneName] = useState('');
  const [editingCommune, setEditingCommune] = useState<{ id: number; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'city' | 'commune'; id: number; name: string } | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get('/cities').then(r => r.data.data),
  });

  const createCity = useMutation({
    mutationFn: (name: string) => api.post('/cities', { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Ville créée'); setShowCityForm(false); setCityName(''); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  const updateCity = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.patch(`/cities/${id}`, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Ville modifiée'); setEditingCity(null); setCityName(''); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  const deleteCity = useMutation({
    mutationFn: (id: number) => api.delete(`/cities/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Ville supprimée'); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  const createCommune = useMutation({
    mutationFn: ({ cityId, name }: { cityId: number; name: string }) => api.post(`/cities/${cityId}/communes`, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Commune créée'); setShowCommuneForm(false); setCommuneName(''); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  const updateCommune = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.patch(`/cities/communes/${id}`, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Commune modifiée'); setEditingCommune(null); setCommuneName(''); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  const deleteCommune = useMutation({
    mutationFn: (id: number) => api.delete(`/cities/communes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cities'] }); toast.success('Commune supprimée'); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message || 'Erreur'),
  });

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des villes"
        subtitle="Ajoutez, modifiez ou supprimez des villes et leurs communes"
      />

      <div className="flex gap-2 mb-4">
        <Button variant="primary" onClick={() => { setEditingCity(null); setCityName(''); setShowCityForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter une ville
        </Button>
      </div>

      {showCityForm && (
        <Card className="p-4 mb-4">
          <div className="flex items-end gap-4">
            <Input label="Nom de la ville" value={cityName} onChange={e => setCityName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (editingCity ? updateCity.mutate({ id: editingCity.id, name: cityName }) : createCity.mutate(cityName))} />
            <Button variant="primary" isLoading={createCity.isPending || updateCity.isPending}
              onClick={() => editingCity ? updateCity.mutate({ id: editingCity.id, name: cityName }) : createCity.mutate(cityName)}>
              {editingCity ? 'Modifier' : 'Créer'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowCityForm(false); setEditingCity(null); setCityName(''); }}>Annuler</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {Array.isArray(cities) && cities.map((city: City) => (
          <Card key={city.id} className="overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => setExpandedCity(expandedCity === city.id ? null : city.id)}>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{city.name}</span>
                <span className="text-xs text-text/40 bg-primary/5 px-2 py-0.5 rounded-full">
                  {city.communes?.length || 0} commune{(city.communes?.length || 0) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <Button variant="glass" className="p-2" onClick={() => { setEditingCity(city); setCityName(city.name); setShowCityForm(true); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="glass" className="p-2 text-red-500" onClick={() => setDeleteTarget({ type: 'city', id: city.id, name: city.name })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {expandedCity === city.id && (
              <div className="border-t border-border/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text/60">Communes</span>
                  <Button variant="secondary" size="sm" onClick={() => { setShowCommuneForm(true); setCommuneName(''); }}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>

                {showCommuneForm && (
                  <div className="flex items-end gap-3">
                    <Input label="Nom de la commune" value={communeName} onChange={e => setCommuneName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createCommune.mutate({ cityId: city.id, name: communeName })} />
                    <Button variant="primary" size="sm" isLoading={createCommune.isPending}
                      onClick={() => createCommune.mutate({ cityId: city.id, name: communeName })}>Ajouter</Button>
                    <Button variant="secondary" size="sm" onClick={() => { setShowCommuneForm(false); setCommuneName(''); }}>Annuler</Button>
                  </div>
                )}

                {city.communes?.length === 0 && !showCommuneForm && (
                  <p className="text-xs text-text/30 text-center py-4">Aucune commune</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {city.communes?.map((commune) => (
                    <div key={commune.id} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                      {editingCommune?.id === commune.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Input value={communeName} onChange={e => setCommuneName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && updateCommune.mutate({ id: commune.id, name: communeName })} />
                          <Button variant="primary" size="sm" isLoading={updateCommune.isPending}
                            onClick={() => updateCommune.mutate({ id: commune.id, name: communeName })}>OK</Button>
                          <Button variant="secondary" size="sm" onClick={() => setEditingCommune(null)}>X</Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-text/40" />
                            <span className="text-sm">{commune.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingCommune(commune); setCommuneName(commune.name); }}
                              className="text-text/40 hover:text-primary p-1"><Pencil className="w-3 h-3" /></button>
                            <button onClick={() => setDeleteTarget({ type: 'commune', id: commune.id, name: commune.name })}
                              className="text-text/40 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Supprimer ${deleteTarget?.type === 'city' ? 'la ville' : 'la commune'}`}
        message={`Supprimer "${deleteTarget?.name}" ? ${deleteTarget?.type === 'city' ? 'Toutes les communes liées seront également supprimées.' : ''}`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'city') deleteCity.mutate(deleteTarget.id);
          else deleteCommune.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

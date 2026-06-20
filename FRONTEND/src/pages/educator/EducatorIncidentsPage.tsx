import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIncidents, useCreateIncident, useDeleteIncident } from '../../hooks/useIncidents';
import { useStudents } from '../../hooks/useStudents';

const typeLabels: Record<string, string> = {
  RETARD: 'Retard',
  ABSENCE_NON_JUSTIFIEE: 'Absence non justifiée',
  COMPORTEMENT: 'Comportement',
  AUTRE: 'Autre',
};

const typeVariant: Record<string, 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'orange'> = {
  RETARD: 'yellow',
  ABSENCE_NON_JUSTIFIEE: 'red',
  COMPORTEMENT: 'orange',
  AUTRE: 'gray',
};

const statusLabels: Record<string, string> = {
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  IGNORE: 'Ignoré',
};

export const EducatorIncidentsPage = () => {
  const { data: incidents, isLoading, error, refetch } = useIncidents();
  const createIncident = useCreateIncident();
  const deleteIncident = useDeleteIncident();
  const { data: students } = useStudents();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    type: 'RETARD',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.description) return;

    try {
      await createIncident.mutateAsync({
        student_id: Number(formData.student_id),
        type: formData.type as any,
        description: formData.description,
        date: formData.date,
      });
      setShowForm(false);
      setFormData({ student_id: '', type: 'RETARD', description: '', date: new Date().toISOString().split('T')[0] });
    } catch { toast.error('Impossible de créer l\'incident'); }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error.message || String(error)} onRetry={refetch} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Incidents"
        actions={
          <Button onClick={() => setShowForm(prev => !prev)} variant="primary">
            {showForm ? 'Annuler' : '+ Ajouter un incident'}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvel incident</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Élève</label>
                <select
                  className="input w-full"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {students?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="input w-full"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="RETARD">Retard</option>
                  <option value="ABSENCE_NON_JUSTIFIEE">Absence non justifiée</option>
                  <option value="COMPORTEMENT">Comportement</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input w-full"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" isLoading={createIncident.isPending} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {incidents?.map((incident: any) => (
          <Card key={incident.id} className="border border-primary/5">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={typeLabels[incident.type] || incident.type} variant={typeVariant[incident.type] || 'gray'} />
                    <StatusBadge
                      status={statusLabels[incident.status] || incident.status}
                      variant={incident.status === 'RESOLU' ? 'green' : incident.status === 'IGNORE' ? 'gray' : 'yellow'}
                    />
                  </div>
                  <div className="font-medium">{students?.find((s: any) => s.id === incident.student_id)?.name || `Élève #${incident.student_id}`}</div>
                  <div className="text-sm text-text/60 mt-1">{incident.description}</div>
                  <div className="text-xs text-text/40 mt-2">{new Date(incident.date).toLocaleDateString('fr-FR')}</div>
                </div>
                <Button
                  variant="outline"
                  className="text-xs px-2 py-1 border-red-200 text-red-600"
                  isLoading={deleteIncident.isPending}
                  onClick={() => deleteIncident.mutate(incident.id)}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {incidents?.length === 0 && (
          <div className="glass p-8 rounded-xl text-center text-text/60">
            Aucun incident enregistré
          </div>
        )}
      </div>
    </div>
  );
};

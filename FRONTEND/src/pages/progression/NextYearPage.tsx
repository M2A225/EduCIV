import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { CalendarPlus, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../../components/ui/LoadingState';

export const NextYearPage = () => {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetch = async () => {
    try {
      const res = await api.get('/school-years');
      setYears(res.data.data || []);
    } catch {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const lastYear = years.length > 0 ? years[years.length - 1] : null;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.post('/progression/create-next-year');
      toast.success(`Année ${res.data.data.year_range} créée`);
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Nouvelle année scolaire" subtitle="Créez l'année suivante" />

      <Card>
        <CardContent className="pt-6 space-y-4">
          {lastYear && (
            <div className="flex items-center justify-between p-4 rounded-xl border">
              <div>
                <span className="font-semibold">{lastYear.year_range}</span>
                {lastYear.closed && (
                  <span className="ml-3 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />Archivée
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6 text-center bg-white/10 rounded-xl">
            {lastYear?.closed ? (
              <>
                <p className="text-text/60 mb-4">
                  L'année {lastYear.year_range} est archivée. Vous pouvez créer l'année suivante.
                </p>
                <p className="text-xs text-text/40 mb-4">
                  Les structures (emplois du temps, affectations, plans de paiement) sont à recréer manuellement.
                </p>
                <Button onClick={handleCreate} isLoading={creating}>
                  <CalendarPlus className="w-4 h-4" /> Créer l'année suivante
                </Button>
              </>
            ) : (
              <p className="text-text/40">L'année actuelle doit être archivée avant de créer la suivante.</p>
            )}
          </div>

          {years.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text font-medium">
                    <th className="text-left p-3">Année</th>
                    <th className="text-left p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((y: any) => (
                    <tr key={y.id} className="border-t border-gray-100">
                      <td className="p-3">{y.year_range}</td>
                      <td className="p-3">
                        {y.closed
                          ? <span className="text-green-600">Archivée</span>
                          : <span className="text-blue-600">Active</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

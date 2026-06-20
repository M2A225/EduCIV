import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { api } from '../../services/api';
import { Archive, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../../components/ui/LoadingState';

export const ArchivePage = () => {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

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

  const handleArchive = async (yearId: number) => {
    setArchiving(true);
    try {
      await api.post(`/progression/archive/${yearId}`);
      toast.success('Année archivée');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erreur');
    } finally {
      setArchiving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Archivage des années" subtitle="Geler les notes et fermer une année scolaire" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          {years.map((y: any) => (
            <div key={y.id} className="flex items-center justify-between p-4 rounded-xl border">
              <div>
                <span className="font-semibold">{y.year_range}</span>
                {y.closed && (
                  <span className="ml-3 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />Archivée
                  </span>
                )}
              </div>
              {!y.closed && (
                <Button variant="outline" onClick={() => handleArchive(y.id)} isLoading={archiving}>
                  <Archive className="w-4 h-4" /> Archiver
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

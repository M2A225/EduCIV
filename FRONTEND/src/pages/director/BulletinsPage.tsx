import { useState } from 'react';
import { toast } from 'sonner';

import { useClasses } from '../../hooks/useClasses';
import { usePeriods } from '../../hooks/usePeriods';
import { bulletinService } from '../../services/bulletins';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';

export const BulletinsPage = () => {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: periods, isLoading: periodsLoading } = usePeriods();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [generating, setGenerating] = useState(false);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleBatchGenerate = async () => {
    if (!selectedClassId || !selectedPeriodId) return;
    setGenerating(true);
    setError(null);
    setPdfUrls([]);
    try {
      const res = await bulletinService.generateBatchBulletins(Number(selectedClassId), Number(selectedPeriodId), year);
      const body = (res.data as any)?.data ?? res.data;
      const urls: string[] = body.urls ?? body ?? [];
      setPdfUrls(urls);
      const count = body.count ?? urls.length;
      toast.success(`${count} bulletin(s) généré(s) avec succès`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la génération';
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId('');
    setSelectedPeriodId('');
    setPdfUrls([]);
    setError(null);
  };

  if (classesLoading || periodsLoading) return <LoadingState type="card" count={3} />;

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Bulletins" />

      <Card>
        <CardHeader>
          <CardTitle>Générer les bulletins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Select
              label="Classe"
              placeholder="Sélectionner une classe"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={(classes || []).map((c: any) => ({ value: String(c.id), label: c.name }))}
            />
            <Select
              label="Période"
              placeholder="Sélectionner une période"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              options={(periods || []).map((p: any) => ({ value: String(p.id), label: p.name }))}
            />
            <Input
              label="Année scolaire"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024-2025"
            />
            <div className="flex items-end gap-2">
              <Button
                onClick={handleBatchGenerate}
                disabled={!selectedClassId || !selectedPeriodId}
                isLoading={generating}
              >
                Générer
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <Feedback type="error" message={error} />}

      {pdfUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulletins générés ({pdfUrls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {pdfUrls.map((url, idx) => (
                <div key={url} className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-white/50">
                  <span className="text-text font-medium">Bulletin {idx + 1}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger PDF
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedClassId && !selectedPeriodId && pdfUrls.length === 0 && (
        <div className="text-center py-12 text-text/60">
          Sélectionnez une classe et une période, puis cliquez sur Générer
        </div>
      )}
    </div>
  );
};

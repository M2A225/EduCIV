import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';

export const FinancialClosePage = () => {
  const [years, setYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/school-years').then(res => {
      const yrs = res.data.data || [];
      setYears(yrs);
      if (yrs.length > 0) setSelectedYearId(String(yrs[yrs.length - 1].id));
    }).catch(() => toast.error('Erreur'));
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;
    setLoading(true);
    api.get(`/progression/financial/${selectedYearId}`).then(res => {
      setData(res.data.data);
    }).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, [selectedYearId]);

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Clôture financière" subtitle="État des paiements et impayés" />

      <div className="w-64">
        <Select
          value={selectedYearId}
          onChange={(e: any) => setSelectedYearId(e.target.value)}
          options={years.map(y => ({ value: String(y.id), label: y.year_range }))}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{data.totalExpected?.toLocaleString()} FCFA</div>
              <div className="text-sm text-text/60">Attendu</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{data.totalCollected?.toLocaleString()} FCFA</div>
              <div className="text-sm text-text/60">Collecté</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600">{data.totalOutstanding?.toLocaleString()} FCFA</div>
              <div className="text-sm text-text/60">Impayé</div>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Détail par plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text font-medium">
                      <th className="text-left p-3">Plan</th>
                      <th className="text-left p-3">Total</th>
                      <th className="text-left p-3">Collecté</th>
                      <th className="text-left p-3">Impayé</th>
                      <th className="text-left p-3">Élèves avec solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.byPlan || []).map((p: any) => (
                      <tr key={p.planId} className="border-t border-gray-100">
                        <td className="p-3 font-medium">{p.planName}</td>
                        <td className="p-3">{p.total?.toLocaleString()} FCFA</td>
                        <td className="p-3 text-green-600">{p.collected?.toLocaleString()} FCFA</td>
                        <td className="p-3 text-red-600">{p.outstanding?.toLocaleString()} FCFA</td>
                        <td className="p-3">{p.studentsWithBalance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

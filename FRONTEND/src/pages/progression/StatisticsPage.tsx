import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { PageHeader } from '../../components/ui/PageHeader';
import { LoadingState } from '../../components/ui/LoadingState';
import { api } from '../../services/api';

export const StatisticsPage = () => {
  const [years, setYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/school-years').then(res => {
      const yrs = res.data.data || [];
      setYears(yrs);
      if (yrs.length > 0) setSelectedYearId(String(yrs[yrs.length - 1].id));
    }).catch(() => toast.error('Erreur chargement'));
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;
    setLoading(true);
    api.get(`/progression/stats/${selectedYearId}`).then(res => {
      setStats(res.data.data);
    }).catch(() => toast.error('Erreur stats')).finally(() => setLoading(false));
  }, [selectedYearId]);

  return (
    <div className="space-y-8 font-sans">
      <PageHeader title="Statistiques de fin d'année" subtitle="Consultez les résultats par classe" />

      <div className="w-64">
        <Select
          value={selectedYearId}
          onChange={(e: any) => setSelectedYearId(e.target.value)}
          options={years.map(y => ({ value: String(y.id), label: y.year_range }))}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.globalStats?.tauxReussite || 0}%</div>
              <div className="text-sm text-text/60">Taux de réussite</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.globalStats?.tauxRedoublement || 0}%</div>
              <div className="text-sm text-text/60">Redoublement</div>
            </CardContent></Card>
            <Card><CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.globalStats?.tauxDepart || 0}%</div>
              <div className="text-sm text-text/60">Départs</div>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Par classe</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text font-medium">
                      <th className="text-left p-3">Classe</th>
                      <th className="text-left p-3">Total</th>
                      <th className="text-left p-3">Admis</th>
                      <th className="text-left p-3">Redoublants</th>
                      <th className="text-left p-3">Transferés</th>
                      <th className="text-left p-3">Exclus</th>
                      <th className="text-left p-3">Abandons</th>
                      <th className="text-left p-3">Taux réussite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.byClass || []).map((c: any) => (
                      <tr key={c.className} className="border-t border-gray-100">
                        <td className="p-3 font-medium">{c.className}</td>
                        <td className="p-3">{c.total}</td>
                        <td className="p-3 text-green-600">{c.admis}</td>
                        <td className="p-3 text-orange-600">{c.redoubles}</td>
                        <td className="p-3">{c.transferes}</td>
                        <td className="p-3 text-red-600">{c.exclus}</td>
                        <td className="p-3">{c.abandons}</td>
                        <td className="p-3 font-semibold">{c.tauxReussite}%</td>
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

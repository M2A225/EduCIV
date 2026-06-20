import { useAttendance } from '../../hooks/useAttendance';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const EducatorAttendancePage = () => {
  const { attendance, loading, error } = useAttendance();

  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error} />;

  return (
    <div>
      <PageHeader title="Suivi des appels" size="sm" />

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/5">
              <th className="p-3 text-left font-semibold">Date</th>
              <th className="p-3 text-left font-semibold">Classe</th>
              <th className="p-3 text-left font-semibold">Statut</th>
              <th className="p-3 text-left font-semibold">Présents</th>
              <th className="p-3 text-left font-semibold">Absents</th>
              <th className="p-3 text-left font-semibold">Retards</th>
            </tr>
          </thead>
          <tbody>
            {attendance?.map((record: any) => (
              <tr key={record.id} className="border-t border-border/20">
                <td className="p-3">{new Date(record.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="p-3">-</td>
                <td className="p-3">
                  <StatusBadge
                    status={record.status}
                    variant={record.status === 'PRESENT' ? 'green' : record.status === 'ABSENT' ? 'red' : 'yellow'}
                  />
                </td>
                <td className="p-3">-</td>
                <td className="p-3">-</td>
                <td className="p-3">-</td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendance?.length === 0 && (
          <div className="p-8 text-center text-text/60">
            Aucune donnée d'appel
          </div>
        )}
      </div>
    </div>
  );
};

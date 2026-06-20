import { useAttendance } from '../../hooks/useAttendance';
import { LoadingState } from '../../components/ui/LoadingState';
import { Feedback } from '../../components/ui/Feedback';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const ParentAttendancePage = () => {
  const { attendance, loading, error } = useAttendance();

  if (loading) return <LoadingState />;
  if (error) return <Feedback type="error" message={error} />;

  return (
    <div>
      <PageHeader title="Absences de l'enfant" size="sm" />

      <div className="grid gap-4">
        {attendance?.map((record: any) => (
          <div key={record.id} className="glass p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  {record.status === 'PRESENT' ? 'Présent' : record.status === 'ABSENT' ? 'Absent' : 'Retard'}
                </div>
                <div className="text-sm text-text/60">{new Date(record.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <StatusBadge
                status={record.status}
                variant={record.status === 'PRESENT' ? 'green' : record.status === 'ABSENT' ? 'red' : 'yellow'}
              />
            </div>
          </div>
        ))}
        {attendance?.length === 0 && (
          <div className="glass p-8 rounded-xl text-center text-text/60">
            Aucune donnée de présence
          </div>
        )}
      </div>
    </div>
  );
};

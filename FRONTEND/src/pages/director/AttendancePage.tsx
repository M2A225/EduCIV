import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';

// Mock data to simulate attendance status
const attendanceData = [
  { id: 1, class: '6ème A', time: '08:00', teacher: 'M. Diallo', status: 'done' },
  { id: 2, class: '6ème B', time: '08:00', teacher: 'Mme. Sow', status: 'pending' },
  { id: 3, class: '5ème A', time: '09:00', teacher: 'M. Keita', status: 'done' },
];

export const AttendancePage = () => {
  const isLoading = false;

  if (isLoading) return <LoadingState type="list" count={5} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Suivi des Appels</h1>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Classe</th>
                <th className="p-3">Heure</th>
                <th className="p-3">Professeur</th>
                <th className="p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{row.class}</td>
                  <td className="p-3">{row.time}</td>
                  <td className="p-3">{row.teacher}</td>
                  <td className="p-3">
                    {row.status === 'done' ? (
                      <span className="text-green-600 font-bold">✅ Fait</span>
                    ) : (
                      <span className="text-red-600 font-bold">❌ Non fait</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

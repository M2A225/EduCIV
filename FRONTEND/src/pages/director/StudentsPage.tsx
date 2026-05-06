import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Mock data
const studentsData = [
  { id: 1, name: 'Jean Dupont', class: '6ème A', parent: 'M. Dupont', payment: 'À jour' },
  { id: 2, name: 'Marie Keita', class: '6ème A', parent: 'Mme. Keita', payment: 'Retard' },
  { id: 3, name: 'Ousmane Sow', class: '5ème A', parent: 'M. Sow', payment: 'À jour' },
];

export const StudentsPage = () => {
  const isLoading = false;

  if (isLoading) return <LoadingState type="list" count={10} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>
        <Button>+ Ajouter Élève</Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Rechercher par nom..." className="w-64" />
        <Input placeholder="Classe..." className="w-48" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Nom</th>
                <th className="p-3">Classe</th>
                <th className="p-3">Parent</th>
                <th className="p-3">Paiement</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.class}</td>
                  <td className="p-3">{student.parent}</td>
                  <td className="p-3">
                    <span className={student.payment === 'À jour' ? 'text-green-600' : 'text-red-600'}>
                      {student.payment}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button variant="outline" className="text-xs">Voir</Button>
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
